import {
  X,
  LogOut,
  Mail,
  User,
  CalendarDays,
} from "lucide-react"

function ProfilePanel({
  open,
  user,
  onClose,
  onLogout,
}) {
  if (!open) {
    return null
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <h2 className="text-lg font-semibold text-slate-900">
            Profile
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close profile"
          >
            <X size={21} />
          </button>

        </div>

        <div className="flex-1 overflow-y-auto p-6">

          <div className="flex flex-col items-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            <h3 className="mt-4 text-xl font-semibold text-slate-900">
              {user?.username || "User"}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              BuildLedger Account
            </p>

          </div>

          <div className="mt-8 space-y-3">

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">

                <User
                  size={19}
                  className="mt-0.5 text-slate-500"
                />

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Username
                  </p>

                  <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {user?.username || "—"}
                  </p>
                </div>

              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start gap-3">

                <Mail
                  size={19}
                  className="mt-0.5 text-slate-500"
                />

                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-words text-sm font-medium text-slate-800">
                    {user?.email || "—"}
                  </p>
                </div>

              </div>
            </div>

            {user?.created_at && (
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">

                  <CalendarDays
                    size={19}
                    className="mt-0.5 text-slate-500"
                  />

                  <div>
                    <p className="text-xs text-slate-400">
                      Account created
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {new Date(
                        user.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

        <div className="border-t border-slate-200 p-5">

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <LogOut size={19} />
            Logout
          </button>

        </div>

      </aside>
    </>
  )
}

export default ProfilePanel