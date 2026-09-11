import {
  Menu,
  UserCircle,
} from "lucide-react"

function AppHeader({
  onMenuClick,
  onProfileClick,
}) {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <Menu size={23} />
          </button>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              BuildLedger
            </h1>

            <p className="hidden text-xs text-slate-500 sm:block">
              Construction Management
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={onProfileClick}
          aria-label="Open profile"
          className="flex items-center gap-2 rounded-full p-1.5 transition hover:bg-slate-100"
        >
          <UserCircle
            size={34}
            strokeWidth={1.7}
            className="text-slate-700"
          />
        </button>

      </div>
    </header>
  )
}

export default AppHeader