'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { clearAuthSession, getAuthToken, getAuthUser, type AuthUser } from '../../lib/web/authStorage';
import {
  webApi,
  type SchedulerProject,
  type SchedulerState,
  type SchedulerTask,
  type SchedulerTaskPriority,
  type SchedulerTaskStatus,
} from '../../lib/web/apiClient';

type ViewMode = 'timeline' | 'board' | 'calendar';
type SchedulerPersona = 'superintendent' | 'project-manager' | 'owner';

const CONSTRAINT_LABELS: Record<NonNullable<SchedulerTask['constraintType']>, string> = {
  none: 'None',
  rfi: 'RFI',
  submittal: 'Submittal',
  inspection: 'Inspection',
  materials: 'Materials',
  weather: 'Weather',
  other: 'Other',
};

const STATUS_COLORS: Record<SchedulerTaskStatus, string> = {
  'not-started': 'bg-slate-600 text-slate-100',
  'in-progress': 'bg-blue-600 text-white',
  blocked: 'bg-red-600 text-white',
  completed: 'bg-emerald-600 text-white',
};

const PRIORITY_COLORS: Record<SchedulerTaskPriority, string> = {
  low: 'text-slate-300',
  medium: 'text-blue-300',
  high: 'text-amber-300',
  critical: 'text-red-300',
};

function toDateValue(value: string): number {
  return new Date(`${value}T00:00:00`).getTime();
}

function daysBetween(start: string, end: string): number {
  const diff = toDateValue(end) - toDateValue(start);
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
}

function daysDelta(start: string, end: string): number {
  const diff = toDateValue(end) - toDateValue(start);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function normalizeTask(task: SchedulerTask): SchedulerTask {
  return {
    ...task,
    baselineStartDate: task.baselineStartDate || task.startDate,
    baselineEndDate: task.baselineEndDate || task.endDate,
    predecessorIds: Array.isArray(task.predecessorIds) ? task.predecessorIds : [],
    crewCount: Math.max(0, Number(task.crewCount || 0)),
    equipmentUnits: Math.max(0, Number(task.equipmentUnits || 0)),
    progress: clampProgress(Number(task.progress || 0)),
    taskSequence: Number.isFinite(Number(task.taskSequence)) ? Number(task.taskSequence) : 0,
    constraintType: task.constraintType || 'none',
    constraintNote: task.constraintNote || '',
    weatherDelayDays: Math.max(0, Number(task.weatherDelayDays || 0)),
    weatherCondition: task.weatherCondition || '',
    dailyLog: task.dailyLog || '',
    lastFieldUpdateAt: task.lastFieldUpdateAt || '',
  };
}

function normalizeState(state: SchedulerState): SchedulerState {
  return {
    projects: Array.isArray(state.projects) ? state.projects : [],
    tasks: Array.isArray(state.tasks) ? state.tasks.map(normalizeTask) : [],
  };
}

function parseDependencies(input: string, availableTaskIds: string[]): string[] {
  const ids = input
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const set = new Set(ids.filter((id) => availableTaskIds.includes(id)));
  return Array.from(set);
}

function arePredecessorsComplete(task: SchedulerTask, taskIndex: Map<string, SchedulerTask>): boolean {
  if (task.predecessorIds.length === 0) return true;
  return task.predecessorIds.every((id) => taskIndex.get(id)?.status === 'completed');
}

function getConstraintLabel(task: SchedulerTask): string {
  const key: NonNullable<SchedulerTask['constraintType']> = task.constraintType ?? 'none';
  return CONSTRAINT_LABELS[key];
}

export default function ProjectSchedulingPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingState, setLoadingState] = useState(true);
  const [saveError, setSaveError] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState('');

  const [projects, setProjects] = useState<SchedulerProject[]>([]);
  const [tasks, setTasks] = useState<SchedulerTask[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [statusFilter, setStatusFilter] = useState<'all' | SchedulerTaskStatus>('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [lookaheadDays, setLookaheadDays] = useState(14);
  const [persona, setPersona] = useState<SchedulerPersona>('project-manager');
  const [draggedTaskId, setDraggedTaskId] = useState('');

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectLocation, setNewProjectLocation] = useState('Austin, TX');
  const [newProjectStartDate, setNewProjectStartDate] = useState('2026-04-15');
  const [newProjectEndDate, setNewProjectEndDate] = useState('2026-08-15');

  const [dependencyInput, setDependencyInput] = useState('');
  const [newTask, setNewTask] = useState<Omit<SchedulerTask, 'id' | 'projectId' | 'predecessorIds'>>({
    title: '',
    phase: 'Site Prep',
    assignee: 'Site Superintendent',
    startDate: '2026-04-15',
    endDate: '2026-04-18',
    baselineStartDate: '2026-04-15',
    baselineEndDate: '2026-04-18',
    crewCount: 4,
    equipmentUnits: 2,
    status: 'not-started',
    progress: 0,
    priority: 'medium',
    isMilestone: false,
    notes: '',
  });

  const initializedRef = useRef(false);

  useEffect(() => {
    const authUser = getAuthUser();
    const token = getAuthToken();

    if (!authUser || !token) {
      router.replace('/');
      return;
    }

    setUser(authUser);

    const load = async () => {
      try {
        const response = await webApi.getSchedulerState(authUser.id);
        const state = normalizeState(response.state);
        setProjects(state.projects);
        setTasks(state.tasks);
        if (state.projects.length > 0) {
          setSelectedProjectId(state.projects[0].id);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load scheduler';
        setSaveError(message);
      } finally {
        setLoadingState(false);
        initializedRef.current = true;
      }
    };

    void load();
  }, [router]);

  useEffect(() => {
    if (!user || !initializedRef.current) return;

    const timer = setTimeout(async () => {
      try {
        const payload = normalizeState({ projects, tasks });
        await webApi.saveSchedulerState(user.id, payload);
        setSaveError('');
        setLastSavedAt(new Date().toLocaleTimeString());
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to save scheduler state';
        setSaveError(message);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [projects, tasks, user]);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const projectTasks = useMemo(
    () => tasks.filter((task) => task.projectId === selectedProjectId),
    [tasks, selectedProjectId]
  );

  const taskIndex = useMemo(() => {
    const map = new Map<string, SchedulerTask>();
    projectTasks.forEach((task) => map.set(task.id, task));
    return map;
  }, [projectTasks]);

  const assignees = useMemo(() => {
    const unique = new Set(projectTasks.map((task) => task.assignee));
    return ['all', ...Array.from(unique).sort()];
  }, [projectTasks]);

  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = projectTasks.filter((task) => {
      const statusOk = statusFilter === 'all' || task.status === statusFilter;
      const assigneeOk = assigneeFilter === 'all' || task.assignee === assigneeFilter;
      const queryOk = !q || `${task.title} ${task.phase} ${task.assignee} ${task.notes}`.toLowerCase().includes(q);
      return statusOk && assigneeOk && queryOk;
    });
    return filtered.sort((a, b) => {
      const seqA = Number(a.taskSequence || 0);
      const seqB = Number(b.taskSequence || 0);
      if (seqA !== seqB) return seqA - seqB;
      return toDateValue(a.startDate) - toDateValue(b.startDate);
    });
  }, [projectTasks, statusFilter, assigneeFilter, search]);

  const timelineRange = useMemo(() => {
    if (!selectedProject) {
      return { start: '2026-01-01', end: '2026-01-31', totalDays: 31, weekLabels: ['W1'] };
    }

    const totalDays = daysBetween(selectedProject.startDate, selectedProject.endDate);
    const weekCount = Math.ceil(totalDays / 7);
    const labels = Array.from({ length: weekCount }, (_, idx) => `W${idx + 1}`);

    return { start: selectedProject.startDate, end: selectedProject.endDate, totalDays, weekLabels: labels };
  }, [selectedProject]);

  const stats = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter((task) => task.status === 'completed').length;
    const blocked = projectTasks.filter((task) => task.status === 'blocked').length;
    const delayed = projectTasks.filter((task) => daysDelta(task.baselineEndDate, task.endDate) > 0).length;
    const progressAvg = total === 0 ? 0 : Math.round(projectTasks.reduce((sum, task) => sum + task.progress, 0) / total);
    return { total, completed, blocked, delayed, progressAvg };
  }, [projectTasks]);

  const dailyAllocation = useMemo(() => {
    const start = selectedProject?.startDate || new Date().toISOString().slice(0, 10);
    return Array.from({ length: 14 }, (_, idx) => {
      const day = addDays(start, idx);
      const dayTasks = visibleTasks.filter((task) => day >= task.startDate && day <= task.endDate);
      const crew = dayTasks.reduce((sum, task) => sum + task.crewCount, 0);
      const equipment = dayTasks.reduce((sum, task) => sum + task.equipmentUnits, 0);
      return { day, crew, equipment, taskCount: dayTasks.length };
    });
  }, [selectedProject, visibleTasks]);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const lookaheadEnd = useMemo(() => addDays(today, Math.max(1, lookaheadDays) - 1), [today, lookaheadDays]);

  const lookaheadTasks = useMemo(
    () => visibleTasks.filter((task) => task.startDate <= lookaheadEnd && task.endDate >= today),
    [visibleTasks, today, lookaheadEnd]
  );

  const fieldMetrics = useMemo(() => {
    const ready = lookaheadTasks.filter(
      (task) => task.status !== 'completed' && task.status !== 'blocked' && arePredecessorsComplete(task, taskIndex)
    );

    const constraints = lookaheadTasks.filter(
      (task) => task.status === 'blocked' || !arePredecessorsComplete(task, taskIndex) || task.constraintType !== 'none'
    );

    const atRisk = lookaheadTasks.filter((task) => {
      const delayed = daysDelta(task.baselineEndDate, task.endDate) > 0 || Number(task.weatherDelayDays || 0) > 0;
      const critical = task.priority === 'critical';
      const blocked = task.status === 'blocked' || !arePredecessorsComplete(task, taskIndex) || task.constraintType !== 'none';
      return delayed || critical || blocked;
    });

    const plannedToFinish = lookaheadTasks.filter((task) => task.endDate <= lookaheadEnd).length;
    const completedToFinish = lookaheadTasks.filter(
      (task) => task.endDate <= lookaheadEnd && task.status === 'completed'
    ).length;
    const ppc = plannedToFinish === 0 ? 0 : Math.round((completedToFinish / plannedToFinish) * 100);

    return {
      ready,
      constraints,
      atRisk,
      ppc,
      plannedToFinish,
      completedToFinish,
    };
  }, [lookaheadTasks, lookaheadEnd, taskIndex]);

  const handleSignOut = () => {
    clearAuthSession();
    router.push('/');
  };

  const handleAddProject = () => {
    if (!newProjectName.trim()) return;
    const id = `proj_${Date.now()}`;
    const project: SchedulerProject = {
      id,
      name: newProjectName.trim(),
      location: newProjectLocation.trim() || 'Unknown',
      startDate: newProjectStartDate,
      endDate: newProjectEndDate,
    };

    setProjects((current) => [project, ...current]);
    setSelectedProjectId(id);
    setNewProjectName('');
  };

  const handleAddTask = () => {
    if (!selectedProjectId || !newTask.title.trim()) return;

    const predecessorIds = parseDependencies(dependencyInput, projectTasks.map((task) => task.id));

    const task: SchedulerTask = normalizeTask({
      id: `task_${Date.now()}`,
      projectId: selectedProjectId,
      ...newTask,
      title: newTask.title.trim(),
      assignee: newTask.assignee.trim() || 'Unassigned',
      notes: newTask.notes.trim(),
      predecessorIds,
    });

    setTasks((current) => [task, ...current]);
    setDependencyInput('');
    setNewTask((current) => ({
      ...current,
      title: '',
      notes: '',
      progress: 0,
      status: 'not-started',
      predecessorIds: undefined as never,
    }));
  };

  const updateTask = (taskId: string, patch: Partial<SchedulerTask>) => {
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== taskId) return task;
        return normalizeTask({ ...task, ...patch });
      })
    );
  };

  const shiftTask = (taskId: string, days: number) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;
    updateTask(taskId, {
      startDate: addDays(task.startDate, days),
      endDate: addDays(task.endDate, days),
    });
  };

  const resequenceProjectTasks = (projectId: string, orderedTaskIds: string[]) => {
    const sequenceMap = new Map<string, number>();
    orderedTaskIds.forEach((id, idx) => sequenceMap.set(id, idx + 1));
    setTasks((current) =>
      current.map((task) => {
        if (task.projectId !== projectId) return task;
        const seq = sequenceMap.get(task.id);
        if (!seq) return task;
        return { ...task, taskSequence: seq };
      })
    );
  };

  const moveTaskSequence = (taskId: string, direction: 'up' | 'down') => {
    const ordered = projectTasks
      .slice()
      .sort((a, b) => Number(a.taskSequence || 0) - Number(b.taskSequence || 0));
    const idx = ordered.findIndex((task) => task.id === taskId);
    if (idx < 0) return;
    const nextIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (nextIdx < 0 || nextIdx >= ordered.length) return;
    const copy = ordered.slice();
    const [item] = copy.splice(idx, 1);
    copy.splice(nextIdx, 0, item);
    resequenceProjectTasks(item.projectId, copy.map((task) => task.id));
  };

  const applyWeatherDelay = (task: SchedulerTask) => {
    const delayDays = Math.max(0, Number(task.weatherDelayDays || 0));
    if (!delayDays) return;
    updateTask(task.id, {
      startDate: addDays(task.startDate, delayDays),
      endDate: addDays(task.endDate, delayDays),
      constraintType: 'weather',
      lastFieldUpdateAt: new Date().toISOString(),
    });
  };

  const deleteTask = (taskId: string) => {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    setTasks((current) =>
      current.map((task) => ({
        ...task,
        predecessorIds: task.predecessorIds.filter((id) => id !== taskId),
      }))
    );
  };

  const setTaskStatusQuick = (task: SchedulerTask, status: SchedulerTaskStatus) => {
    const patch: Partial<SchedulerTask> = { status };
    if (status === 'completed') patch.progress = 100;
    if (status === 'not-started') patch.progress = 0;
    if (status === 'in-progress' && task.progress === 0) patch.progress = 10;
    patch.lastFieldUpdateAt = new Date().toISOString();
    updateTask(task.id, patch);
  };

  const saveFieldLog = (task: SchedulerTask) => {
    updateTask(task.id, { lastFieldUpdateAt: new Date().toISOString() });
  };

  const statusColumns: SchedulerTaskStatus[] = ['not-started', 'in-progress', 'blocked', 'completed'];
  const isOwnerView = persona === 'owner';
  const isSuperintendentView = persona === 'superintendent';

  if (!user || loadingState) {
    return (
      <div className="min-h-screen bg-black/55 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-5xl rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 text-zinc-100 backdrop-blur-sm">
          Loading scheduler...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/55 px-6 py-10 text-zinc-100">
      <main className="mx-auto w-full max-w-6xl flex-col gap-6">
        <section className="relative z-[1000] mb-6 overflow-visible rounded-lg border border-amber-300/20 bg-slate-950/75 p-4 text-zinc-100 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-white">BuildVault</Link>
              <Link href="/dashboard" className="text-sm font-semibold text-amber-300 hover:text-amber-200">Dashboard</Link>
              <Link href="/categories" className="text-sm font-semibold text-amber-300 hover:text-amber-200">Categories</Link>
              <Link href="/messages" className="text-sm font-semibold text-amber-300 hover:text-amber-200">Messages</Link>
            </div>

            <div className="relative z-[1100]">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-md border border-amber-300/25 bg-slate-900/80 px-3 py-2 text-sm text-zinc-100 hover:bg-slate-800"
              >
                ?
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-[1200] mt-2 w-56 rounded-md border border-amber-300/20 bg-slate-950/95 text-zinc-100 shadow-lg backdrop-blur-sm">
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Profile</Link>
                  <Link href="/photo-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Photo Analysis</Link>
                  <Link href="/blueprint-analysis" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Blueprint Analysis</Link>
                  <Link href="/building-codes" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">??? Building Codes</Link>
                  <Link href="/price-comparison" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Price Comparison</Link>
                  <Link href="/find-contractors" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Find Contractors</Link>
                  <Link href="/permit-assistance" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Permit Assistance</Link>
                  <Link href="/project-scheduling" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-slate-800">?? Project Scheduling</Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Settings</Link>
                  <div className="border-t border-white/10" />
                  <Link href="/help" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-slate-800">?? Help & Support</Link>
                  <div className="border-t border-white/10" />
                  <button onClick={handleSignOut} className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-slate-800">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Construction Site Scheduler</h1>
              <p className="mt-1 text-sm text-slate-300">Buildertrend-style planning for dependencies, baseline variance, and field resource allocation.</p>
              <p className="mt-1 text-xs text-slate-400">{saveError ? `Save error: ${saveError}` : lastSavedAt ? `Synced ${lastSavedAt}` : 'Syncing to server...'}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2"><div className="text-slate-400">Tasks</div><div className="font-semibold text-white">{stats.total}</div></div>
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2"><div className="text-slate-400">Complete</div><div className="font-semibold text-emerald-300">{stats.completed}</div></div>
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2"><div className="text-slate-400">Blocked</div><div className="font-semibold text-red-300">{stats.blocked}</div></div>
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2"><div className="text-slate-400">Delayed</div><div className="font-semibold text-amber-300">{stats.delayed}</div></div>
              <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2"><div className="text-slate-400">Avg Progress</div><div className="font-semibold text-blue-300">{stats.progressAvg}%</div></div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select value={selectedProjectId} onChange={(event) => setSelectedProjectId(event.target.value)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              {projects.map((project) => (<option key={project.id} value={project.id}>{project.name}</option>))}
            </select>
            <select value={persona} onChange={(event) => setPersona(event.target.value as SchedulerPersona)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              <option value="superintendent">Superintendent View</option>
              <option value="project-manager">Project Manager View</option>
              <option value="owner">Owner View</option>
            </select>
            <select value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              <option value="timeline">Timeline View</option>
              <option value="board">Board View</option>
              <option value="calendar">Calendar View</option>
            </select>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <button onClick={handleAddTask} disabled={isOwnerView} className="rounded-md bg-amber-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50" type="button">Add Task</button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div className="text-slate-400">Lookahead Window</div>
              <select
                value={lookaheadDays}
                onChange={(event) => setLookaheadDays(Number(event.target.value || 14))}
                className="mt-1 w-full rounded-md border border-amber-300/20 bg-slate-900/90 px-2 py-1 text-sm text-zinc-100"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={21}>21 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div className="text-slate-400">Ready Work</div>
              <div className="font-semibold text-emerald-300">{fieldMetrics.ready.length}</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div className="text-slate-400">Constraint Log</div>
              <div className="font-semibold text-red-300">{fieldMetrics.constraints.length}</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <div className="text-slate-400">PPC (Planned Complete)</div>
              <div className="font-semibold text-blue-300">{fieldMetrics.ppc}%</div>
              <div className="text-xs text-slate-400">{fieldMetrics.completedToFinish}/{fieldMetrics.plannedToFinish} due</div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | SchedulerTaskStatus)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              <option value="all">All Statuses</option><option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option>
            </select>
            <select value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              {assignees.map((assignee) => (<option key={assignee} value={assignee}>{assignee === 'all' ? 'All Assignees' : assignee}</option>))}
            </select>
            <input value={newProjectName} onChange={(event) => setNewProjectName(event.target.value)} placeholder="New project name" disabled={isOwnerView} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60" />
            <button type="button" onClick={handleAddProject} disabled={isOwnerView} className="rounded-md border border-amber-300/30 bg-slate-900/90 px-3 py-2 text-sm text-amber-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">Add Project</button>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input value={newProjectLocation} onChange={(event) => setNewProjectLocation(event.target.value)} placeholder="Project location" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="date" value={newProjectStartDate} onChange={(event) => setNewProjectStartDate(event.target.value)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="date" value={newProjectEndDate} onChange={(event) => setNewProjectEndDate(event.target.value)} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
          </div>
        </section>

        {!isOwnerView && (
        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
          <h2 className="mb-3 text-xl font-semibold text-white">Task Composer</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <input value={newTask.title} onChange={(event) => setNewTask((current) => ({ ...current, title: event.target.value }))} placeholder="Task title" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input value={newTask.phase} onChange={(event) => setNewTask((current) => ({ ...current, phase: event.target.value }))} placeholder="Phase" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input value={newTask.assignee} onChange={(event) => setNewTask((current) => ({ ...current, assignee: event.target.value }))} placeholder="Assignee" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="number" min={0} value={newTask.crewCount} onChange={(event) => setNewTask((current) => ({ ...current, crewCount: Math.max(0, Number(event.target.value || 0)) }))} placeholder="Crew" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="number" min={0} value={newTask.equipmentUnits} onChange={(event) => setNewTask((current) => ({ ...current, equipmentUnits: Math.max(0, Number(event.target.value || 0)) }))} placeholder="Equipment" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="date" value={newTask.startDate} onChange={(event) => setNewTask((current) => ({ ...current, startDate: event.target.value }))} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="date" value={newTask.endDate} onChange={(event) => setNewTask((current) => ({ ...current, endDate: event.target.value }))} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="date" value={newTask.baselineStartDate} onChange={(event) => setNewTask((current) => ({ ...current, baselineStartDate: event.target.value }))} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input type="date" value={newTask.baselineEndDate} onChange={(event) => setNewTask((current) => ({ ...current, baselineEndDate: event.target.value }))} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <select value={newTask.priority} onChange={(event) => setNewTask((current) => ({ ...current, priority: event.target.value as SchedulerTaskPriority }))} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
            </select>
            <select value={newTask.status} onChange={(event) => setNewTask((current) => ({ ...current, status: event.target.value as SchedulerTaskStatus }))} className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100">
              <option value="not-started">Not Started</option><option value="in-progress">In Progress</option><option value="blocked">Blocked</option><option value="completed">Completed</option>
            </select>
            <input type="number" min={0} max={100} value={newTask.progress} onChange={(event) => setNewTask((current) => ({ ...current, progress: clampProgress(Number(event.target.value || 0)) }))} placeholder="Progress %" className="rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
            <input value={dependencyInput} onChange={(event) => setDependencyInput(event.target.value)} placeholder="Dependencies (task ids, comma-separated)" className="col-span-1 rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100 md:col-span-2" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input id="milestone" type="checkbox" checked={newTask.isMilestone} onChange={(event) => setNewTask((current) => ({ ...current, isMilestone: event.target.checked }))} className="h-4 w-4" />
            <label htmlFor="milestone" className="text-sm text-slate-200">Milestone task</label>
          </div>
          <textarea value={newTask.notes} onChange={(event) => setNewTask((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes, dependencies, and field updates" rows={3} className="mt-3 w-full rounded-md border border-amber-300/20 bg-slate-900/90 px-3 py-2 text-sm text-zinc-100" />
        </section>
        )}

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-semibold text-white">Daily Site Allocation (14-Day Lookahead)</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {dailyAllocation.map((row) => (
              <div key={row.day} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
                <div className="font-semibold text-white">{row.day}</div>
                <div className="text-slate-300">Tasks: {row.taskCount}</div>
                <div className="text-blue-300">Crew: {row.crew}</div>
                <div className="text-amber-300">Equipment: {row.equipment}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
          <h2 className="mb-1 text-xl font-semibold text-white">Field Control Tower</h2>
          <p className="mb-4 text-sm text-slate-300">Buildertrend/Procore-style execution list for what is ready now, constrained, and at-risk.</p>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-md border border-emerald-300/20 bg-emerald-950/20 p-3">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-200">Ready Work</h3>
              <div className="space-y-2">
                {fieldMetrics.ready.length === 0 && <div className="text-xs text-slate-400">No ready tasks in the selected window.</div>}
                {fieldMetrics.ready.slice(0, 6).map((task) => (
                  <div key={`ready_${task.id}`} className="rounded border border-white/10 bg-black/20 p-2">
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="text-xs text-slate-300">{task.phase} | {task.assignee}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-red-300/20 bg-red-950/20 p-3">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-red-200">Constraint Log</h3>
              <div className="space-y-2">
                {fieldMetrics.constraints.length === 0 && <div className="text-xs text-slate-400">No active constraints.</div>}
                {fieldMetrics.constraints.slice(0, 6).map((task) => (
                  <div key={`constraint_${task.id}`} className="rounded border border-white/10 bg-black/20 p-2">
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="text-xs text-slate-300">
                      {(task.constraintType || 'none') !== 'none'
                        ? getConstraintLabel(task)
                        : task.status === 'blocked'
                          ? 'Blocked status'
                          : 'Waiting on predecessors'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-amber-300/20 bg-amber-950/20 p-3">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-200">At-Risk Work</h3>
              <div className="space-y-2">
                {fieldMetrics.atRisk.length === 0 && <div className="text-xs text-slate-400">No at-risk tasks in window.</div>}
                {fieldMetrics.atRisk.slice(0, 6).map((task) => (
                  <div key={`risk_${task.id}`} className="rounded border border-white/10 bg-black/20 p-2">
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="text-xs text-slate-300">Variance {daysDelta(task.baselineEndDate, task.endDate)}d | {task.priority}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
          <h2 className="mb-1 text-xl font-semibold text-white">Daily Field Updates</h2>
          <p className="mb-4 text-sm text-slate-300">Capture foreman notes, weather delays, and constraint flags. This is the handoff layer your teams use daily.</p>
          <div className="space-y-3">
            {visibleTasks.slice(0, 10).map((task) => (
              <div key={`field_${task.id}`} className="rounded-md border border-white/10 bg-white/5 p-3">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="text-xs text-slate-400">Activity {task.id} | Last update {task.lastFieldUpdateAt ? new Date(task.lastFieldUpdateAt).toLocaleString() : 'n/a'}</div>
                  </div>
                  {isSuperintendentView && <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-xs text-emerald-200">Superintendent Focus</span>}
                </div>
                <div className="grid gap-2 md:grid-cols-4">
                  <select
                    value={task.constraintType || 'none'}
                    disabled={isOwnerView}
                    onChange={(event) => updateTask(task.id, { constraintType: event.target.value as SchedulerTask['constraintType'] })}
                    className="rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="none">No Constraint</option>
                    <option value="rfi">RFI</option>
                    <option value="submittal">Submittal</option>
                    <option value="inspection">Inspection</option>
                    <option value="materials">Materials</option>
                    <option value="weather">Weather</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    value={task.constraintNote || ''}
                    disabled={isOwnerView}
                    onChange={(event) => updateTask(task.id, { constraintNote: event.target.value })}
                    placeholder="Constraint note"
                    className="rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <input
                    type="number"
                    min={0}
                    value={task.weatherDelayDays || 0}
                    disabled={isOwnerView}
                    onChange={(event) => updateTask(task.id, { weatherDelayDays: Math.max(0, Number(event.target.value || 0)) })}
                    placeholder="Weather delay days"
                    className="rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isOwnerView}
                      onClick={() => applyWeatherDelay(task)}
                      className="rounded border border-blue-300/40 px-2 py-1 text-xs text-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Apply Delay
                    </button>
                    <button
                      type="button"
                      disabled={isOwnerView}
                      onClick={() => saveFieldLog(task)}
                      className="rounded border border-emerald-300/40 px-2 py-1 text-xs text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save Log
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  value={task.dailyLog || ''}
                  disabled={isOwnerView}
                  onChange={(event) => updateTask(task.id, { dailyLog: event.target.value })}
                  placeholder="Daily field log: manpower, deliveries, issues, and next-day plan"
                  className="mt-2 w-full rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        </section>

        {viewMode === 'timeline' && (
          <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
            <h2 className="mb-3 text-xl font-semibold text-white">Timeline + Baseline Variance</h2>
            <p className="mb-3 text-sm text-slate-300">{selectedProject?.name || 'No project selected'} | {timelineRange.start} to {timelineRange.end}</p>
            <div className="overflow-x-auto">
              <div className="min-w-[1040px]">
                {visibleTasks.map((task) => {
                  const totalDays = timelineRange.totalDays;
                  const startOffset = Math.max(0, daysBetween(timelineRange.start, task.startDate) - 1);
                  const baselineOffset = Math.max(0, daysBetween(timelineRange.start, task.baselineStartDate) - 1);
                  const actualLength = daysBetween(task.startDate, task.endDate);
                  const baselineLength = daysBetween(task.baselineStartDate, task.baselineEndDate);
                  const left = (startOffset / totalDays) * 100;
                  const baselineLeft = (baselineOffset / totalDays) * 100;
                  const width = Math.max(2, (actualLength / totalDays) * 100);
                  const baselineWidth = Math.max(2, (baselineLength / totalDays) * 100);
                  const variance = daysDelta(task.baselineEndDate, task.endDate);
                  const dependencyNames = task.predecessorIds.map((id) => taskIndex.get(id)?.title || id).join(', ');

                  return (
                    <div key={task.id} className="mb-3 rounded-md border border-white/10 bg-white/5 px-3 py-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{task.title}</span>
                            {task.isMilestone && <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-xs text-amber-200">Milestone</span>}
                            <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-300">{task.phase} | {task.assignee} | Crew {task.crewCount} | Equip {task.equipmentUnits}</div>
                          <div className="text-xs text-slate-400">Dependencies: {dependencyNames || 'None'}</div>
                        </div>
                        <div className="text-right text-xs">
                          <div className={variance > 0 ? 'text-red-300' : variance < 0 ? 'text-emerald-300' : 'text-slate-300'}>
                            Variance: {variance > 0 ? `+${variance}` : variance}d
                          </div>
                          <div className="text-slate-400">Baseline {task.baselineStartDate} &rarr; {task.baselineEndDate}</div>
                        </div>
                      </div>

                      <div className="relative h-8 rounded bg-slate-900/70">
                        <div className="absolute top-3 h-2 rounded bg-slate-600/60" style={{ left: `${baselineLeft}%`, width: `${baselineWidth}%` }} title="Baseline" />
                        <div className={`absolute top-1 h-6 rounded ${STATUS_COLORS[task.status].split(' ')[0]}`} style={{ left: `${left}%`, width: `${width}%` }} title="Actual" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {viewMode === 'board' && (
          <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">Execution Board</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {statusColumns.map((status) => {
                const columnTasks = visibleTasks.filter((task) => task.status === status);
                return (
                  <div
                    key={status}
                    className="rounded-md border border-white/10 bg-slate-900/70 p-3"
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (!draggedTaskId || isOwnerView) return;
                      const task = taskIndex.get(draggedTaskId);
                      if (!task) return;
                      updateTask(task.id, { status, taskSequence: columnTasks.length + 1, lastFieldUpdateAt: new Date().toISOString() });
                      setDraggedTaskId('');
                    }}
                  >
                    <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">{status.replace('-', ' ')}</h3>
                    <div className="space-y-2">
                      {columnTasks.length === 0 && <div className="text-xs text-slate-500">No tasks</div>}
                      {columnTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-md border border-white/10 bg-white/5 p-2"
                          draggable={!isOwnerView}
                          onDragStart={() => setDraggedTaskId(task.id)}
                        >
                          <div className="text-sm font-semibold text-white">{task.title}</div>
                          <div className="text-xs text-slate-300">{task.assignee} | {task.phase}</div>
                          <div className="text-xs text-slate-400">Activity: {task.id}</div>
                          <div className="text-xs text-slate-400">Seq: {task.taskSequence || 0}</div>
                          <div className="mt-1 text-xs text-slate-400">Crew {task.crewCount} | Equip {task.equipmentUnits}</div>
                          <div className="mt-1 text-xs text-slate-400">Pred: {task.predecessorIds.length ? task.predecessorIds.join(', ') : 'None'}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <button type="button" disabled={isOwnerView} className="rounded border border-white/20 px-2 py-0.5 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => shiftTask(task.id, -1)}>-1d</button>
                            <button type="button" disabled={isOwnerView} className="rounded border border-white/20 px-2 py-0.5 text-xs text-slate-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => shiftTask(task.id, 1)}>+1d</button>
                            <button type="button" disabled={isOwnerView} className="rounded border border-indigo-300/40 px-2 py-0.5 text-xs text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => moveTaskSequence(task.id, 'up')}>Up</button>
                            <button type="button" disabled={isOwnerView} className="rounded border border-indigo-300/40 px-2 py-0.5 text-xs text-indigo-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => moveTaskSequence(task.id, 'down')}>Down</button>
                            <button type="button" disabled={isOwnerView} className="rounded border border-blue-300/40 px-2 py-0.5 text-xs text-blue-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setTaskStatusQuick(task, 'in-progress')}>Start</button>
                            <button type="button" disabled={isOwnerView} className="rounded border border-emerald-300/40 px-2 py-0.5 text-xs text-emerald-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => setTaskStatusQuick(task, 'completed')}>Done</button>
                            <button type="button" disabled={isOwnerView} className="rounded border border-red-300/40 px-2 py-0.5 text-xs text-red-200 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => deleteTask(task.id)}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {viewMode === 'calendar' && (
          <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
            <h2 className="mb-4 text-xl font-semibold text-white">30-Day Lookahead</h2>
            <div className="space-y-2">
              {Array.from({ length: 30 }, (_, idx) => {
                const day = addDays(selectedProject?.startDate || new Date().toISOString().slice(0, 10), idx);
                const dayTasks = visibleTasks.filter((task) => day >= task.startDate && day <= task.endDate);
                return (
                  <div key={day} className="rounded-md border border-white/10 bg-white/5 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-white">{day}</div>
                        <div className="text-xs text-slate-400">{dayTasks.length} scheduled item(s)</div>
                      </div>
                      {dayTasks.some((task) => task.isMilestone) && <span className="rounded-full bg-amber-300/20 px-2 py-1 text-xs text-amber-200">Milestone Day</span>}
                    </div>
                    {dayTasks.length > 0 && (
                      <ul className="mt-2 space-y-1 text-sm">
                        {dayTasks.map((task) => (
                          <li key={`${day}-${task.id}`} className="flex items-center justify-between rounded border border-white/10 px-2 py-1">
                            <span className="text-slate-200">{task.title} ({task.assignee})</span>
                            <span className={`rounded px-2 py-0.5 text-xs ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-amber-300/20 bg-slate-950/75 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-semibold text-white">Task Grid</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-300">
                  <th className="px-2 py-2">Task</th>
                  <th className="px-2 py-2">Dates</th>
                  <th className="px-2 py-2">Baseline</th>
                  <th className="px-2 py-2">Dependencies</th>
                  <th className="px-2 py-2">Constraint</th>
                  <th className="px-2 py-2">Crew/Equip</th>
                  <th className="px-2 py-2">Weather</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Progress</th>
                  <th className="px-2 py-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => (
                  <tr key={task.id} className="border-b border-white/5 align-top">
                    <td className="px-2 py-3 text-zinc-100">{task.title}<div className="text-xs text-slate-400">{task.phase} | {task.assignee}</div></td>
                    <td className="px-2 py-3 text-slate-300">{task.startDate} &rarr; {task.endDate}</td>
                    <td className="px-2 py-3 text-slate-300">{task.baselineStartDate} &rarr; {task.baselineEndDate}<div className="text-xs text-slate-400">Var: {daysDelta(task.baselineEndDate, task.endDate)}d</div></td>
                    <td className="px-2 py-3">
                      <input
                        value={task.predecessorIds.join(', ')}
                        onChange={(event) => updateTask(task.id, { predecessorIds: parseDependencies(event.target.value, projectTasks.filter((x) => x.id !== task.id).map((x) => x.id)) })}
                        disabled={isOwnerView}
                        className="w-44 rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <select
                        value={task.constraintType || 'none'}
                        disabled={isOwnerView}
                        onChange={(event) => updateTask(task.id, { constraintType: event.target.value as SchedulerTask['constraintType'] })}
                        className="rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="none">None</option>
                        <option value="rfi">RFI</option>
                        <option value="submittal">Submittal</option>
                        <option value="inspection">Inspection</option>
                        <option value="materials">Materials</option>
                        <option value="weather">Weather</option>
                        <option value="other">Other</option>
                      </select>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} value={task.crewCount} disabled={isOwnerView} onChange={(event) => updateTask(task.id, { crewCount: Math.max(0, Number(event.target.value || 0)) })} className="w-14 rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60" />
                        <span className="text-xs text-slate-400">/</span>
                        <input type="number" min={0} value={task.equipmentUnits} disabled={isOwnerView} onChange={(event) => updateTask(task.id, { equipmentUnits: Math.max(0, Number(event.target.value || 0)) })} className="w-14 rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60" />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={task.weatherDelayDays || 0}
                          disabled={isOwnerView}
                          onChange={(event) => updateTask(task.id, { weatherDelayDays: Math.max(0, Number(event.target.value || 0)) })}
                          className="w-14 rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                        <button
                          type="button"
                          disabled={isOwnerView}
                          onClick={() => applyWeatherDelay(task)}
                          className="rounded border border-blue-300/40 px-2 py-1 text-xs text-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delay
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <select value={task.status} disabled={isOwnerView} onChange={(event) => updateTask(task.id, { status: event.target.value as SchedulerTaskStatus })} className="rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60">
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="blocked">Blocked</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-2">
                        <input type="number" min={0} max={100} value={task.progress} disabled={isOwnerView} onChange={(event) => updateTask(task.id, { progress: Number(event.target.value || 0) })} className="w-16 rounded border border-white/20 bg-slate-900 px-2 py-1 text-xs text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60" />
                        <span className="text-slate-400">%</span>
                      </div>
                    </td>
                    <td className={`px-2 py-3 font-semibold ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</td>
                  </tr>
                ))}
                {visibleTasks.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-2 py-6 text-center text-slate-400">No tasks match the active filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}