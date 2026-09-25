import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Lightbulb,
  X,
  Loader2,
  Circle,
  CheckCircle2,
  GripVertical,
} from 'lucide-react';
import {
  useTodos,
  useCreateTodo,
  useMarkDone,
  useDeleteTodo,
  useAcceptSuggestion,
  Todo,
  SuggestedTodo,
} from '../../hooks/useTodos';
import { useStudentCourses } from '../../hooks/useStudentData';
import { User } from '../../types';

interface TodoTabProps {
  user: User;
}

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-rose-100 text-rose-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
};

const FILTERS = ['All', 'High', 'Medium', 'Low', 'Done'] as const;

export const TodoTab: React.FC<TodoTabProps> = ({ user }) => {
  const { data, isLoading } = useTodos();
  const { data: courses } = useStudentCourses();
  const createTodo = useCreateTodo();
  const markDone = useMarkDone();
  const deleteTodo = useDeleteTodo();
  const acceptSuggestion = useAcceptSuggestion();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [order, setOrder] = useState<string[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);

  const todos: Todo[] = data?.todos ?? [];
  const suggestions: SuggestedTodo[] = (data?.suggestions ?? []).filter(
    (s) => !dismissed.has(s.title)
  );

  const ordered = useMemo(() => {
    const pending = todos.filter((t) => t.status === 'pending');
    if (order.length === 0) return pending;
    return [...pending].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [todos, order]);

  const visible = useMemo(() => {
    if (filter === 'Done') return todos.filter((t) => t.status === 'done');
    if (filter === 'All') return ordered;
    return ordered.filter((t) => t.priority === filter.toLowerCase());
  }, [filter, ordered, todos]);

  const completed = todos.filter((t) => t.status === 'done');

  const handleAdd = async () => {
    if (!title.trim()) return;
    await createTodo.mutateAsync({
      title: title.trim(),
      courseCode: courseCode || null,
      dueDate: dueDate || null,
      priority,
    });
    setTitle('');
    setCourseCode('');
    setDueDate('');
    setPriority('medium');
    setShowForm(false);
  };

  const handleAccept = async (s: SuggestedTodo) => {
    await acceptSuggestion.mutateAsync(s);
    setDismissed((prev) => new Set(prev).add(s.title));
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = ordered.map((t) => t.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(from, 1);
    ids.splice(to, 0, dragId);
    setOrder(ids);
    setDragId(null);
  };

  const renderCard = (todo: Todo) => (
    <div
      key={todo.id}
      draggable
      onDragStart={() => setDragId(todo.id)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => handleDrop(todo.id)}
      className="group flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 hover:border-slate-200 transition-all"
    >
      <GripVertical className="w-4 h-4 text-slate-300 cursor-grab" />
      <button
        onClick={() => todo.status !== 'done' && markDone.mutate(todo.id)}
        className="shrink-0"
      >
        {todo.status === 'done' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-emerald-500" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate ${
            todo.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'
          }`}
        >
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {todo.courseCode && (
            <span className="text-[10px] font-bold text-[#3256a8] bg-blue-50 px-1.5 py-0.5 rounded">
              {todo.courseCode}
            </span>
          )}
          {todo.dueDate && (
            <span className="text-[10px] font-medium text-slate-400">{todo.dueDate}</span>
          )}
          {todo.isSuggested && (
            <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
              Suggested
            </span>
          )}
        </div>
      </div>
      <span
        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
          PRIORITY_STYLES[todo.priority] ?? PRIORITY_STYLES.low
        }`}
      >
        {todo.priority}
      </span>
      <button
        onClick={() => deleteTodo.mutate(todo.id)}
        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#3256a8]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-[#3256a8]" />
          <h2 className="text-lg font-bold text-slate-800">To-Do List</h2>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3256a8] hover:bg-[#284588] text-white text-sm font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="md:col-span-2 text-sm border border-slate-200 rounded-lg px-3 py-2"
          />
          <select
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="">No course</option>
            {(courses ?? []).map((c: { code: string }) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={createTodo.isPending || !title.trim()}
            className="md:col-span-4 py-2 bg-[#3256a8] hover:bg-[#284588] disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all"
          >
            {createTodo.isPending ? 'Adding...' : 'Save Task'}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === f ? 'bg-[#3256a8] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide">My Tasks</h3>
          {visible.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-400">
              No tasks yet — add your first task or accept a suggestion.
            </div>
          ) : (
            <div className="space-y-2">{visible.map(renderCard)}</div>
          )}

          {completed.length > 0 && filter !== 'Done' && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                Completed ({completed.length})
              </h3>
              <div className="space-y-2 opacity-70">{completed.slice(0, 3).map(renderCard)}</div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="bg-violet-50/60 border border-violet-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-violet-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-violet-800">Suggested for you</h3>
                <p className="text-[11px] text-violet-500">
                  Based on your grades, attendance, and upcoming exams
                </p>
              </div>
            </div>

            {suggestions.length === 0 ? (
              <p className="text-xs text-violet-400 py-4 text-center">No suggestions right now.</p>
            ) : (
              <div className="space-y-2">
                {suggestions.map((s) => (
                  <div key={s.title} className="bg-white rounded-xl border border-violet-100 p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-800">{s.title}</p>
                      <button
                        onClick={() => setDismissed((prev) => new Set(prev).add(s.title))}
                        className="text-slate-300 hover:text-slate-500 shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.courseCode && (
                        <span className="text-[10px] font-bold text-[#3256a8] bg-blue-50 px-1.5 py-0.5 rounded">
                          {s.courseCode}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          PRIORITY_STYLES[s.priority] ?? PRIORITY_STYLES.low
                        }`}
                      >
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{s.suggestionReason}</p>
                    <button
                      onClick={() => handleAccept(s)}
                      disabled={acceptSuggestion.isPending}
                      className="w-full py-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-[11px] font-bold rounded-lg transition-all"
                    >
                      Add to My List
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoTab;
