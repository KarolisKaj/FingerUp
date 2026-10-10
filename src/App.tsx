import { HashRouter, Route, Routes } from 'react-router'
import { ConnectDots } from './games/connectDots/ConnectDots'
import { GameMenu } from './screens/GameMenu'
import { Home } from './screens/Home'
import { NotFound } from './screens/NotFound'
import { Progress } from './screens/Progress'
import { Settings } from './screens/Settings'
import { Tools } from './screens/Tools'

// Hash routing works on any static host (GitHub Pages etc.) without server rewrites.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/child/:childId" element={<GameMenu />} />
        <Route path="/child/:childId/settings" element={<Settings />} />
        <Route path="/child/:childId/progress" element={<Progress />} />
        <Route path="/child/:childId/play/connect-dots" element={<ConnectDots />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  )
}
