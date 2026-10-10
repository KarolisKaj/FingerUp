import { Link } from 'react-router'
import { sound } from '../audio/sound'
import { Avatar } from '../components/Avatar'
import { BackIcon, ChartIcon, GearIcon } from '../components/icons'
import { games } from '../games/registry'
import { useChild } from '../hooks/useChild'
import { NotFound } from './NotFound'
import './GameMenu.css'

export function GameMenu() {
  const child = useChild()
  if (child === undefined) return null
  if (child === null) return <NotFound />

  return (
    <div className="screen">
      <div className="topbar">
        <Link to="/" className="btn btn-round" aria-label="Back" onClick={() => sound.tap()}>
          <BackIcon />
        </Link>
        <Avatar name={child.name} color={child.color} size={56} />
        <h1>Hi, {child.name}!</h1>
        <Link to="progress" className="btn btn-round" aria-label="Progress" onClick={() => sound.tap()}>
          <ChartIcon />
        </Link>
        <Link to="settings" className="btn btn-round" aria-label="Settings" onClick={() => sound.tap()}>
          <GearIcon />
        </Link>
      </div>

      <div className="screen-scroll">
        <div className="game-grid">
          {games.map((game) =>
            game.ready ? (
              <Link
                key={game.id}
                to={`play/${game.id}`}
                className="game-tile"
                style={{ background: game.color }}
                onClick={() => sound.unlock()}
              >
                <div className="game-icon">{game.icon}</div>
                <span className="game-title">{game.title}</span>
              </Link>
            ) : (
              <div key={game.id} className="game-tile locked" style={{ background: game.color }} aria-disabled="true">
                <div className="game-icon">{game.icon}</div>
                <span className="game-title">{game.title}</span>
                <span className="game-soon">Coming soon</span>
              </div>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
