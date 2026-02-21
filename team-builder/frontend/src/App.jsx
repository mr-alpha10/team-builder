import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import CompleteProfile from './pages/CompleteProfile'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import AIAgent from './pages/AIAgent'
import Messages from './pages/Messages'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  if (!user.profileComplete && window.location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />
  }
  
  return children
}

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const token = localStorage.getItem('token')

  return (
    <>
      {token && <Navbar theme={theme} toggleTheme={toggleTheme} />}
      <main className="container">
        <Routes>
          <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/signup" element={token ? <Navigate to="/dashboard" replace /> : <Signup />} />
          <Route path="/complete-profile" element={<PrivateRoute><CompleteProfile /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="/projects/:id" element={<PrivateRoute><ProjectDetail /></PrivateRoute>} />
          <Route path="/ai" element={<PrivateRoute><AIAgent /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </>
  )
}
