import Dexie, { type EntityTable } from 'dexie'

export type Difficulty = 'easy' | 'medium' | 'hard'
export type Tolerance = 'large' | 'normal' | 'small'

/** Per-child settings the therapist tunes; every game reads what applies to it. */
export interface ChildSettings {
  /** Fallback level for games without their own entry in `levels`. */
  difficulty: Difficulty
  /** Per-game level, keyed by game id. */
  levels: Partial<Record<string, Difficulty>>
  rounds: number
  tolerance: Tolerance
  guide: boolean
  voice: boolean
  volume: number
  calm: boolean
}

export const defaultSettings: ChildSettings = {
  difficulty: 'easy',
  levels: {},
  rounds: 3,
  tolerance: 'large',
  guide: true,
  voice: true,
  volume: 0.8,
  calm: false,
}

export interface Child {
  id: number
  name: string
  color: string
  createdAt: number
  settings: ChildSettings
}

export interface Session<T = unknown> {
  id: number
  childId: number
  gameId: string
  startedAt: number
  durationMs: number
  /** False when the child left before finishing every round. */
  completed: boolean
  settings: ChildSettings
  data: T
}

export const db = new Dexie('fingerup') as Dexie & {
  children: EntityTable<Child, 'id'>
  sessions: EntityTable<Session, 'id'>
}

db.version(1).stores({
  children: '++id, name',
  sessions: '++id, childId, gameId, startedAt, [childId+gameId]',
})

/** Ask the browser not to evict our data under storage pressure (Safari otherwise may after 7 idle days). */
export async function requestPersistentStorage() {
  try {
    if (navigator.storage?.persisted && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // Not supported; backups cover this case.
  }
}

export function childSettings(child: Child | undefined): ChildSettings {
  return { ...defaultSettings, ...child?.settings }
}

export function levelFor(settings: ChildSettings, gameId: string): Difficulty {
  return settings.levels[gameId] ?? settings.difficulty
}

export async function deleteChild(childId: number) {
  await db.transaction('rw', db.children, db.sessions, async () => {
    await db.sessions.where('childId').equals(childId).delete()
    await db.children.delete(childId)
  })
}
