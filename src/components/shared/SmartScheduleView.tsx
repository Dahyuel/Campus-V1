import React, { useMemo, useState } from 'react';
import { Sparkles, Plus, X, Loader2, RefreshCw, Printer, CalendarDays } from 'lucide-react';
import { useSchedulePreferences, useSavePreferences, useGenerateSchedule, useCachedSchedule } from '../../hooks/useSmartSchedule';

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const START_SLOT = 16;
const END_SLOT = 44;

interface Slot {
  day: string;
  startSlot: number;
  endSlot: number;
  type: string;
  label: string;
  courseCode?: string | null;
  color: string;
  startTime?: string;
  endTime?: string;
}

interface BlockedSlot {
  day: string;
  from: string;
  to: string;
}

interface PersonalEvent {
  day: string;
  from: string;
  to: string;
  label: string;
}

const TYPE_LABELS: Record<string, string> = {
  course: 'Course',
  study: 'Study',
  personal: 'Personal',
  break: 'Break',
};

function timeToSlot(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 2 + (m >= 30 ? 1 : 0);
}

function slotToTime(slot: number): string {
  const h = Math.floor(slot / 2);
  return `${String(h).padStart(2, '0')}:${slot % 2 === 0 ? '00' : '30'}`;
}

function normalizeSlot(s: Slot): Slot {
  return {
    ...s,
    startTime: s.startTime ?? slotToTime(s.startSlot),
    endTime: s.endTime ?? slotToTime(s.endSlot),
  };
}

export const SmartScheduleView: React.FC = () => {
  const { data: prefs, isLoading: prefsLoading } = useSchedulePreferences();
  const savePrefs = useSavePreferences();
  const generate = useGenerateSchedule();
  const { data: cached } = useCachedSchedule();

  const [preferredStudy, setPreferredStudy] = useState('morning');
  const [maxStudyBlock, setMaxStudyBlock] = useState(90);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [blockDay, setBlockDay] = useState('Saturday');
  const [blockFrom, setBlockFrom] = useState('08:00');
  const [blockTo, setBlockTo] = useState('10:00');
  const [eventDay, setEventDay] = useState('Sunday');
  const [eventFrom, setEventFrom] = useState('14:00');
  const [eventTo, setEventTo] = useState('16:00');
  const [eventLabel, setEventLabel] = useState('');

  React.useEffect(() => {
    if (prefs && !loaded) {
      setPreferredStudy(prefs.preferredStudy ?? 'morning');
      setMaxStudyBlock(prefs.maxStudyBlock ?? 90);
      setBlockedSlots(Array.isArray(prefs.blockedSlots) ? prefs.blockedSlots : []);
      setPersonalEvents(Array.isArray(prefs.personalEvents) ? prefs.personalEvents : []);
      setLoaded(true);
    }
  }, [prefs, loaded]);

  const slots: Slot[] = useMemo(() => {
    const raw: Slot[] = cached?.slots ?? [];
    return raw.map(normalizeSlot);
  }, [cached]);

  const handleGenerate = async () => {
    await savePrefs.mutateAsync({ preferredStudy, maxStudyBlock, blockedSlots, personalEvents });
    await generate.mutateAsync();
  };

  const addBlock = () => {
    setBlockedSlots((prev) => [...prev, { day: blockDay, from: blockFrom, to: blockTo }]);
  };

  const addEvent = () => {
    if (!eventLabel.trim()) return;
    setPersonalEvents((prev) => [...prev, { day: eventDay, from: eventFrom, to: eventTo, label: eventLabel.trim() }]);
    setEventLabel('');
  };

  const busy = savePrefs.isPending || generate.isPending;

  const rowSlots = useMemo(() => {
    const rows: number[] = [];
    for (let s = START_SLOT; s < END_SLOT; s += 1) rows.push(s);
    return rows;
  }, []);

  const blockFor = (slot: number, day: string): Slot | null => {
    return (
      slots.find(
        (s) => s.day === day && s.startSlot <= slot && s.endSlot > slot
      ) ?? null
    );
  };

  return (
    <div className="space-y-6 print:space-y-2">
      <div className="flex items-center gap-2 print:hidden">
        <Sparkles className="w-5 h-5 text-[#3256a8]" />
        <h2 className="text-lg font-bold text-slate-800">Smart Weekly Schedule</h2>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
          OR-Tools
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-5 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Preferred Study Time</p>
            <div className="flex gap-2">
              {['morning', 'afternoon', 'evening'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPreferredStudy(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    preferredStudy === p
                      ? 'bg-[#3256a8] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide pt-2">Max Study Block</p>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((m) => (
                <button
                  key={m}
                  onClick={() => setMaxStudyBlock(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    maxStudyBlock === m
                      ? 'bg-[#3256a8] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Blocked Times</p>
            <div className="flex flex-wrap gap-2">
              {blockedSlots.map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {b.day} {b.from}-{b.to}
                  <button onClick={() => setBlockedSlots((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={blockDay} onChange={(e) => setBlockDay(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5">
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input type="time" value={blockFrom} onChange={(e) => setBlockFrom(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
              <input type="time" value={blockTo} onChange={(e) => setBlockTo(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
              <button onClick={addBlock} className="inline-flex items-center gap-1 text-xs font-bold text-[#3256a8] hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            <p className="text-xs font-bold text-slate-700 uppercase tracking-wide pt-2">Personal Events</p>
            <div className="flex flex-wrap gap-2">
              {personalEvents.map((ev, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                  {ev.label}: {ev.day} {ev.from}-{ev.to}
                  <button onClick={() => setPersonalEvents((prev) => prev.filter((_, idx) => idx !== i))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={eventDay} onChange={(e) => setEventDay(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5">
                {DAYS.map((d) => <option key={d}>{d}</option>)}
              </select>
              <input type="time" value={eventFrom} onChange={(e) => setEventFrom(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
              <input type="time" value={eventTo} onChange={(e) => setEventTo(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5" />
              <input value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} placeholder="Label" className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 w-24" />
              <button onClick={addEvent} className="inline-flex items-center gap-1 text-xs font-bold text-[#3256a8] hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={busy || prefsLoading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3256a8] hover:bg-[#284588] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {busy ? 'Generating...' : 'Generate My Schedule'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden print:border-0">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse min-w-[820px] print:min-w-0">
            <thead>
              <tr>
                <th className="w-16 border-b border-slate-100 p-2 text-[10px] font-bold text-slate-400 uppercase">Time</th>
                {DAYS.map((d) => (
                  <th key={d} className="border-b border-slate-100 p-2 text-[11px] font-bold text-slate-600">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowSlots.map((slot) => (
                <tr key={slot}>
                  <td className="border-b border-slate-50 px-2 py-1 text-[10px] font-bold text-slate-400 align-top whitespace-nowrap">
                    {slot % 2 === 0 ? slotToTime(slot) : ''}
                  </td>
                  {DAYS.map((day) => {
                    const block = blockFor(slot, day);
                    if (block && block.startSlot === slot) {
                      const span = block.endSlot - block.startSlot;
                      return (
                        <td
                          key={day}
                          rowSpan={span}
                          className="border border-white p-0 align-top"
                        >
                          <div
                            className="h-full w-full rounded-lg p-2 text-white text-[11px] leading-tight"
                            style={{ backgroundColor: block.color }}
                            title={`${TYPE_LABELS[block.type] ?? block.type}: ${block.label} (${block.startTime}-${block.endTime})`}
                          >
                            <p className="font-bold truncate">{block.label}</p>
                            <p className="opacity-80 text-[10px]">
                              {block.startTime}-{block.endTime}
                            </p>
                          </div>
                        </td>
                      );
                    }
                    if (block) return null;
                    return <td key={day} className="border-b border-slate-50 h-6" />;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {slots.length === 0 && (
          <div className="p-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <CalendarDays className="w-8 h-8 text-slate-300" />
            No schedule generated yet. Set your preferences and click Generate.
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#3256a8' }} /> Course
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} /> Study
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} /> Personal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#6b7280' }} /> Blocked
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleGenerate}
            disabled={busy}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all disabled:opacity-60"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartScheduleView;