import { NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from './features/auth/authSlice.js'
import BlueprintsPage from './pages/BlueprintsPage.jsx'
import BlueprintDetailPage from './pages/BlueprintDetailPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFound from './pages/NotFound.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'

export default function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated)
  const username = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="container">
      <header>
        <h1>ECI - Laboratorio de planos en React</h1>
        {isAuthenticated && (
          <nav>
            <NavLink to="/blueprints" end>
              Planos
            </NavLink>
            <span style={{ marginLeft: '1rem', color: '#666' }}>
              Usuario: {username}
            </span>
            <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
              Salir
            </button>
          </nav>
        )}
      </header>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/blueprints"
          element={
            <PrivateRoute>
              <BlueprintsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/blueprints/:author/:name"
          element={
            <PrivateRoute>
              <BlueprintDetailPage />
            </PrivateRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}
