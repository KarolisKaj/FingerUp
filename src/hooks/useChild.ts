import { useLiveQuery } from 'dexie-react-hooks'
import { useParams } from 'react-router'
import { db } from '../db/db'

/** The child from the `:childId` route param. `undefined` while loading, `null` if it does not exist. */
export function useChild() {
  const childId = Number(useParams().childId)
  return useLiveQuery(async () => (await db.children.get(childId)) ?? null, [childId])
}
