import { dbQuery, isDatabaseEnabled } from '../db';

export type SchedulerTaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed';
export type SchedulerTaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface SchedulerProject {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
}

export interface SchedulerTask {
  id: string;
  projectId: string;
  title: string;
  phase: string;
  assignee: string;
  startDate: string;
  endDate: string;
  baselineStartDate: string;
  baselineEndDate: string;
  predecessorIds: string[];
  crewCount: number;
  equipmentUnits: number;
  status: SchedulerTaskStatus;
  progress: number;
  priority: SchedulerTaskPriority;
  isMilestone: boolean;
  notes: string;
  taskSequence?: number;
  constraintType?: 'none' | 'rfi' | 'submittal' | 'inspection' | 'materials' | 'weather' | 'other';
  constraintNote?: string;
  weatherDelayDays?: number;
  weatherCondition?: string;
  dailyLog?: string;
  lastFieldUpdateAt?: string;
}

export interface SchedulerState {
  projects: SchedulerProject[];
  tasks: SchedulerTask[];
}

interface SchedulerStateRow {
  user_id: string;
  state: SchedulerState;
  updated_at: Date;
}

const fallbackStore = new Map<string, SchedulerState>();
let tableEnsured = false;

function clampProgress(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function normalizeTask(task: SchedulerTask): SchedulerTask {
  return {
    ...task,
    predecessorIds: Array.isArray(task.predecessorIds) ? task.predecessorIds : [],
    baselineStartDate: task.baselineStartDate || task.startDate,
    baselineEndDate: task.baselineEndDate || task.endDate,
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

function seedState(): SchedulerState {
  const projects: SchedulerProject[] = [
    {
      id: 'proj_austin_01',
      name: 'Riverside Multi-Family Build',
      location: 'Austin, TX',
      startDate: '2026-04-15',
      endDate: '2026-09-20',
    },
  ];

  const tasks: SchedulerTask[] = [
    {
      id: 'task_1',
      projectId: 'proj_austin_01',
      title: 'Mobilization and Site Safety Setup',
      phase: 'Site Prep',
      assignee: 'Site Superintendent',
      startDate: '2026-04-15',
      endDate: '2026-04-18',
      baselineStartDate: '2026-04-15',
      baselineEndDate: '2026-04-18',
      predecessorIds: [],
      crewCount: 4,
      equipmentUnits: 2,
      status: 'completed',
      progress: 100,
      priority: 'high',
      isMilestone: false,
      notes: 'Barricades, trailer setup, and safety signage completed.',
      taskSequence: 1,
      constraintType: 'none',
      constraintNote: '',
      weatherDelayDays: 0,
      weatherCondition: '',
      dailyLog: 'Site established and safety walkthrough complete.',
      lastFieldUpdateAt: '',
    },
    {
      id: 'task_2',
      projectId: 'proj_austin_01',
      title: 'Foundation Pour - Building A',
      phase: 'Foundation',
      assignee: 'Concrete Crew Alpha',
      startDate: '2026-04-21',
      endDate: '2026-04-25',
      baselineStartDate: '2026-04-20',
      baselineEndDate: '2026-04-24',
      predecessorIds: ['task_1'],
      crewCount: 8,
      equipmentUnits: 3,
      status: 'in-progress',
      progress: 55,
      priority: 'critical',
      isMilestone: true,
      notes: 'Awaiting pump truck confirmation for final pour segment.',
      taskSequence: 2,
      constraintType: 'materials',
      constraintNote: 'Pump truck and rebar delivery timing risk.',
      weatherDelayDays: 0,
      weatherCondition: '',
      dailyLog: 'Crew mobilized. Waiting on final pour window.',
      lastFieldUpdateAt: '',
    },
    {
      id: 'task_3',
      projectId: 'proj_austin_01',
      title: 'Structural Framing - Level 1',
      phase: 'Framing',
      assignee: 'Framing Team Delta',
      startDate: '2026-04-28',
      endDate: '2026-05-10',
      baselineStartDate: '2026-04-27',
      baselineEndDate: '2026-05-08',
      predecessorIds: ['task_2'],
      crewCount: 12,
      equipmentUnits: 4,
      status: 'not-started',
      progress: 0,
      priority: 'high',
      isMilestone: false,
      notes: 'Start immediately after foundation sign-off.',
      taskSequence: 3,
      constraintType: 'none',
      constraintNote: '',
      weatherDelayDays: 0,
      weatherCondition: '',
      dailyLog: '',
      lastFieldUpdateAt: '',
    },
  ];

  return { projects, tasks };
}

async function ensureSchedulerTable() {
  if (!isDatabaseEnabled() || tableEnsured) {
    return;
  }

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS app_scheduler_state (
      user_id TEXT PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    )`
  );

  tableEnsured = true;
}

export async function getSchedulerState(userId: string): Promise<SchedulerState> {
  if (!isDatabaseEnabled()) {
    if (!fallbackStore.has(userId)) {
      fallbackStore.set(userId, seedState());
    }
    return normalizeState(fallbackStore.get(userId)!);
  }

  try {
    await ensureSchedulerTable();
    const rows = await dbQuery<SchedulerStateRow>(
      'SELECT user_id, state, updated_at FROM app_scheduler_state WHERE user_id = $1 LIMIT 1',
      [userId]
    );

    if (!rows[0]) {
      const seeded = seedState();
      await saveSchedulerState(userId, seeded);
      return seeded;
    }

    return normalizeState(rows[0].state);
  } catch {
    if (!fallbackStore.has(userId)) {
      fallbackStore.set(userId, seedState());
    }
    return normalizeState(fallbackStore.get(userId)!);
  }
}

export async function saveSchedulerState(userId: string, state: SchedulerState): Promise<SchedulerState> {
  const normalized = normalizeState(state);

  if (!isDatabaseEnabled()) {
    fallbackStore.set(userId, normalized);
    return normalized;
  }

  try {
    await ensureSchedulerTable();
    await dbQuery(
      `INSERT INTO app_scheduler_state (user_id, state, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()`,
      [userId, JSON.stringify(normalized)]
    );
    return normalized;
  } catch {
    fallbackStore.set(userId, normalized);
    return normalized;
  }
}
