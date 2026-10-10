import { useState } from 'react'
import { useParams } from 'react-router'
import { GameShell } from '../games/GameShell'
import { gameById } from '../games/registry'
import { useChild } from '../hooks/useChild'
import { NotFound } from './NotFound'

export function PlayGame() {
  const game = gameById(useParams().gameId ?? '')
  const child = useChild()
  // Bumping `run` remounts the shell for "Again!" with a fresh session.
  const [run, setRun] = useState(0)
  if (child === undefined) return null
  if (child === null || !game) return <NotFound />
  return <GameShell key={run} game={game} child={child} autoStart={run > 0} onPlayAgain={() => setRun((r) => r + 1)} />
}
