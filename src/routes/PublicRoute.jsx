// src/routes/PublicRoute.jsx
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()

  // Wait until AuthProvider finishes checking localStorage and /auth/me/
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    )
  }

  // If already authenticated, redirect away from public pages (Login/Register/Home) to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}