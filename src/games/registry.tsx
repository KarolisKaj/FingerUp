import { bubblePop } from './bubblePop'
import { connectDots } from './connectDots'
import { paint } from './paint'
import { pinch } from './pinch'
import { wipe } from './wipe'
import type { GameInfo } from './types'

/** Menu order: roughly the order skills develop, from cause-and-effect tapping upwards. */
// Each game has its own result type; the registry only needs the shared shape.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const games: GameInfo<any, any>[] = [bubblePop, paint, wipe, pinch, connectDots]

export const gameById = (id: string) => games.find((g) => g.id === id)
