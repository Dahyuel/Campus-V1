from fastapi import FastAPI
from pydantic import BaseModel
from ortools.sat.python import cp_model
from typing import List, Optional

app = FastAPI()

DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
SLOTS_START = 8 * 2
SLOTS_END = 22 * 2
NUM_SLOTS = SLOTS_END - SLOTS_START

COLORS = {'course': '#3256a8', 'study': '#10b981', 'break': '#6b7280', 'personal': '#f59e0b'}


class CourseSession(BaseModel):
    day: str
    startSlot: int
    endSlot: int
    courseCode: str
    courseName: str


class Deadline(BaseModel):
    dayIndex: int
    label: str


class BlockedSlot(BaseModel):
    day: str
    fromSlot: int
    toSlot: int


class PersonalEvent(BaseModel):
    day: str
    fromSlot: int
    toSlot: int
    label: str


class ScheduleRequest(BaseModel):
    userId: str
    courseSessions: List[CourseSession]
    deadlines: List[Deadline]
    blockedSlots: List[BlockedSlot]
    personalEvents: List[PersonalEvent]
    preferredStudy: str
    maxStudyBlockSlots: int
    coursesToStudy: List[str]


class GeneratedSlot(BaseModel):
    day: str
    startSlot: int
    endSlot: int
    type: str
    label: str
    courseCode: Optional[str] = None
    color: str


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/generate')
def generate_schedule(req: ScheduleRequest):
    model = cp_model.CpModel()

    study_vars = {}
    for d, _day in enumerate(DAYS):
        for s in range(NUM_SLOTS):
            for course in req.coursesToStudy:
                study_vars[(d, s, course)] = model.new_bool_var(f'study_{d}_{s}_{course}')

    occupied = set()
    for session in req.courseSessions:
        d = DAYS.index(session.day) if session.day in DAYS else -1
        if d < 0:
            continue
        for s in range(session.startSlot - SLOTS_START, session.endSlot - SLOTS_START):
            if 0 <= s < NUM_SLOTS:
                occupied.add((d, s))

    for block in req.blockedSlots:
        d = DAYS.index(block.day) if block.day in DAYS else -1
        if d < 0:
            continue
        for s in range(block.fromSlot - SLOTS_START, block.toSlot - SLOTS_START):
            if 0 <= s < NUM_SLOTS:
                occupied.add((d, s))

    for pe in req.personalEvents:
        d = DAYS.index(pe.day) if pe.day in DAYS else -1
        if d < 0:
            continue
        for s in range(pe.fromSlot - SLOTS_START, pe.toSlot - SLOTS_START):
            if 0 <= s < NUM_SLOTS:
                occupied.add((d, s))

    for (d, s) in occupied:
        for course in req.coursesToStudy:
            if (d, s, course) in study_vars:
                model.add(study_vars[(d, s, course)] == 0)

    for d in range(len(DAYS)):
        for s in range(NUM_SLOTS):
            vars_here = [study_vars[(d, s, c)] for c in req.coursesToStudy if (d, s, c) in study_vars]
            if vars_here:
                model.add_at_most_one(vars_here)

    max_block = max(1, req.maxStudyBlockSlots)
    for d in range(len(DAYS)):
        for s in range(NUM_SLOTS - max_block):
            window = []
            for k in range(max_block + 1):
                for c in req.coursesToStudy:
                    if (d, s + k, c) in study_vars:
                        window.append(study_vars[(d, s + k, c)])
            if len(window) > max_block:
                model.add(sum(window) <= max_block)

    study_totals = {}
    for course in req.coursesToStudy:
        total = sum(
            study_vars[(d, s, course)]
            for d in range(len(DAYS))
            for s in range(NUM_SLOTS)
            if (d, s, course) in study_vars
        )
        study_totals[course] = total

    if req.preferredStudy == 'morning':
        pref_start, pref_end = 0, 8
    elif req.preferredStudy == 'afternoon':
        pref_start, pref_end = 8, 16
    else:
        pref_start, pref_end = 16, 24

    preferred_bonus = []
    for d in range(len(DAYS)):
        for s in range(pref_start, min(pref_end, NUM_SLOTS)):
            for course in req.coursesToStudy:
                if (d, s, course) in study_vars:
                    preferred_bonus.append(study_vars[(d, s, course)])

    deadline_bonus = []
    for dl in req.deadlines:
        d = dl.dayIndex
        for lookahead in [1, 2]:
            target_day = max(0, d - lookahead)
            for s in range(NUM_SLOTS):
                for course in req.coursesToStudy:
                    if (target_day, s, course) in study_vars and dl.label.startswith(course):
                        deadline_bonus.append(study_vars[(target_day, s, course)])

    objective_terms = []
    for course in req.coursesToStudy:
        objective_terms.append(study_totals[course])
    objective_terms.extend(preferred_bonus)
    objective_terms.extend(deadline_bonus)

    if objective_terms:
        model.maximize(sum(objective_terms))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.solve(model)

    result_slots = []

    for session in req.courseSessions:
        result_slots.append(GeneratedSlot(
            day=session.day, startSlot=session.startSlot, endSlot=session.endSlot,
            type='course', label=session.courseName, courseCode=session.courseCode,
            color=COLORS['course']
        ))

    for pe in req.personalEvents:
        result_slots.append(GeneratedSlot(
            day=pe.day, startSlot=pe.fromSlot, endSlot=pe.toSlot,
            type='personal', label=pe.label, color=COLORS['personal']
        ))

    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for d, day in enumerate(DAYS):
            for s in range(NUM_SLOTS):
                for course in req.coursesToStudy:
                    if (d, s, course) in study_vars and solver.value(study_vars[(d, s, course)]):
                        result_slots.append(GeneratedSlot(
                            day=day,
                            startSlot=SLOTS_START + s,
                            endSlot=SLOTS_START + s + 1,
                            type='study',
                            label=f'Study: {course}',
                            courseCode=course,
                            color=COLORS['study']
                        ))

    return {
        'slots': [s.model_dump() for s in result_slots],
        'status': 'optimal' if status == cp_model.OPTIMAL else 'feasible',
    }