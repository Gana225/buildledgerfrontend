import { useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  Banknote,
  Building2,
  ChevronRight,
  HardHat,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  User,
  Users,
  X,
} from "lucide-react"

import { useAuth } from "../context/AuthContext"

function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  const closePanels = () => {
    setMenuOpen(false)
    setProfileOpen(false)
  }

  const handleLogout = () => {
    closePanels()
    logout()
  }

  const getInitial = () => {
    const value =
      user?.first_name ||
      user?.username ||
      user?.email ||
      "U"

    return value.charAt(0).toUpperCase()
  }

  const getDisplayName = () => {
    if (user?.first_name || user?.last_name) {
      return `${user?.first_name || ""} ${
        user?.last_name || ""
      }`.trim()
    }

    return user?.username || "User"
  }

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Labour",
      path: "/labour",
      icon: Users,
    },
    {
      label: "Mesthiri",
      path: "/mesthiri",
      icon: HardHat,
    },
    {
      label: "Materials",
      path: "/materials",
      icon: Package,
    },
  ]

  const isGlobalPage = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(true)
                setProfileOpen(false)
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Building2 size={19} />
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  BuildLedger
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  Construction Manager
                </p>
              </div>
            </button>
          </div>

          {/* Profile */}
          <button
            type="button"
            onClick={() => {
              setProfileOpen(true)
              setMenuOpen(false)
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-slate-100"
            aria-label="Open profile"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {getInitial()}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-32 truncate text-sm font-semibold text-slate-800">
                {getDisplayName()}
              </p>
              <p className="text-xs text-slate-400">
                Account
              </p>
            </div>
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main>
        <Outlet />
      </main>

      {/* BACKDROP */}
      {(menuOpen || profileOpen) && (
        <button
          type="button"
          aria-label="Close panel"
          onClick={closePanels}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/30 backdrop-blur-[1px]"
        />
      )}

      {/* LEFT DRAWER */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-[290px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          menuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                BuildLedger
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Menu
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isGlobalPage(item.path)

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3.5 py-3 transition ${
                      isActive || active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} />
                    <span className="text-sm font-semibold">
                      {item.label}
                    </span>
                  </span>

                  <ChevronRight
                    size={16}
                    className="opacity-50 transition group-hover:translate-x-0.5"
                  />
                </NavLink>
              )
            })}
          </nav>

          <div className="my-6 border-t border-slate-200" />

          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick actions
          </p>

          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              navigate("/dashboard")
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Banknote size={19} />
            Financial overview
          </button>
        </div>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Logged in as
            </p>
            <p className="mt-1 truncate text-sm font-bold text-slate-900">
              {getDisplayName()}
            </p>
          </div>
        </div>
      </aside>

      {/* PROFILE PANEL */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-[360px] max-w-[90vw] flex-col bg-white shadow-2xl transition-transform duration-300 ${
          profileOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <p className="text-base font-bold text-slate-900">
              Profile
            </p>
            <p className="text-xs text-slate-400">
              Account information
            </p>
          </div>

          <button
            type="button"
            onClick={() => setProfileOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="rounded-3xl bg-slate-900 p-6 text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-2xl font-bold">
              {getInitial()}
            </div>

            <h2 className="mt-5 text-xl font-bold">
              {getDisplayName()}
            </h2>

            {user?.email && (
              <p className="mt-1 break-all text-sm text-slate-300">
                {user.email}
              </p>
            )}
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2">
                  <User size={18} className="text-slate-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Username
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.username || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2">
                  <Building2 size={18} className="text-slate-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Account
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    BuildLedger User
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </div>
  )
}

export default AppShell