import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { GuestRoute, ProtectedRoute } from './components/AuthRoute'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import IntroPage from './pages/IntroPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <AuthPage />
            </GuestRoute>
          }
        />
        <Route
          path="/intro"
          element={
            <ProtectedRoute>
              <IntroPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
