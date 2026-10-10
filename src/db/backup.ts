import { db, type Child, type Session } from './db'

interface BackupFile {
  app: 'fingerup'
  version: 1
  exportedAt: string
  children: Child[]
  sessions: Session[]
}

export async function exportBackup() {
  const backup: BackupFile = {
    app: 'fingerup',
    version: 1,
    exportedAt: new Date().toISOString(),
    children: await db.children.toArray(),
    sessions: await db.sessions.toArray(),
  }
  const name = `fingerup-backup-${backup.exportedAt.slice(0, 10)}.json`
  const file = new File([JSON.stringify(backup)], name, { type: 'application/json' })

  // On iPad/Android the share sheet lets the therapist save to Files, Drive or email.
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export async function readBackup(file: File): Promise<BackupFile> {
  const parsed = JSON.parse(await file.text()) as Partial<BackupFile>
  if (parsed.app !== 'fingerup' || !Array.isArray(parsed.children) || !Array.isArray(parsed.sessions)) {
    throw new Error('This file is not a FingerUp backup.')
  }
  return parsed as BackupFile
}

/** Replaces everything on this device with the backup contents. */
export async function restoreBackup(backup: BackupFile) {
  await db.transaction('rw', db.children, db.sessions, async () => {
    await db.children.clear()
    await db.sessions.clear()
    await db.children.bulkAdd(backup.children)
    await db.sessions.bulkAdd(backup.sessions)
  })
}
