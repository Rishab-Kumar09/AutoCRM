import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Index'
import Customers from './pages/Customers'
import Settings from './pages/Settings'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/tickets" element={<Tickets />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

export default App 