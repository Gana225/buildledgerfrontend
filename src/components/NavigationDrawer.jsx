import {
  X,
  LayoutDashboard,
  HardHat,
  Users,
  Package,
} from "lucide-react"

function NavigationDrawer({
  open,
  onClose,
  onNavigate,
}) {
  if (!open) {
    return null
  }

  const handleNavigation = (path) => {
    onNavigate(path)
    onClose()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl">

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">

          <div>
            <p className="font-bold text-slate-900">
              BuildLedger
            </p>

            <p className="text-xs text-slate-500">
              Navigation
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close navigation"
          >
            <X size={21} />
          </button>

        </div>

        <nav className="flex-1 space-y-1 p-4">

          <button
            type="button"
            onClick={() => handleNavigation("/dashboard")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => handleNavigation("/labour")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <HardHat size={20} />
            Labour
          </button>

          <button
            type="button"
            onClick={() => handleNavigation("/mesthiri")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <Users size={20} />
            Mesthiri
          </button>

          <button
            type="button"
            onClick={() => handleNavigation("/materials")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <Package size={20} />
            Materials
          </button>

        </nav>

        <div className="border-t border-slate-200 p-4">
          <p className="text-xs leading-5 text-slate-400">
            BuildLedger helps you manage construction sites,
            labour, mesthiri, materials and expenses.
          </p>
        </div>

      </aside>
    </>
  )
}

export default NavigationDrawer
