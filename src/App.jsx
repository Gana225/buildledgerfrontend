import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom"

import { AuthProvider } from "./context/AuthContext"

import ProtectedRoute from "./routes/ProtectedRoute"
import AppShell from "./components/AppShell"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Labour from "./pages/Labour"
import Mesthiri from "./pages/Mesthiri"
import Materials from "./pages/Materials"
import SiteDashboard from "./pages/SiteDashboard"
import SitePayments from "./pages/SitePayments"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected application */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              {/* Global pages */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/labour" element={<Labour />} />
              <Route path="/mesthiri" element={<Mesthiri />} />

              {/* Materials can later also become global if required */}
              <Route path="/materials" element={<Materials />} />

              {/* Site */}
              <Route
                path="/sites/:siteId"
                element={<SiteDashboard />}
              />

              {/* Site-specific sections */}
              <Route
                path="/sites/:siteId/labour"
                element={<Labour />}
              />

              <Route
                path="/sites/:siteId/mesthiri"
                element={<Mesthiri />}
              />

              <Route
                path="/sites/:siteId/materials"
                element={<Materials />}
              />

              <Route
                path="/sites/:siteId/payments"
                element={<SitePayments />}
              />

            </Route>
          </Route>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App