import {
  ChevronRight,
  MapPin,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

function SiteCard({ site }) {
  const navigate = useNavigate()

  const handleOpenSite = () => {
    navigate(`/sites/${site.site_id}`)
  }

  return (
    <button
      type="button"
      onClick={handleOpenSite}
      className="group w-full rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">

        {/* Site information */}

        <div className="min-w-0">

          <div className="mb-2">
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {site.site_code}
            </span>
          </div>

          <h3 className="truncate text-lg font-bold text-slate-900">
            {site.site_name}
          </h3>

        </div>

        {/* Arrow */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition duration-300 group-hover:bg-slate-900 group-hover:text-white">
          <ChevronRight size={19} />
        </div>

      </div>

      {/* Financial summary */}

      <div className="mt-6 grid grid-cols-3 gap-3">

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Expense
          </p>

          <p className="mt-1 text-sm font-bold text-slate-900">
            ₹{Number(site.total_expense || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Paid
          </p>

          <p className="mt-1 text-sm font-bold text-emerald-600">
            ₹{Number(site.total_paid || 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Due
          </p>

          <p className="mt-1 text-sm font-bold text-red-600">
            ₹{Number(site.total_outstanding || 0).toLocaleString("en-IN")}
          </p>
        </div>

      </div>

      {/* Payment progress */}

      <div className="mt-5">

        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">
            Payment progress
          </span>

          <span className="text-xs font-bold text-slate-600">
            {site.total_expense > 0
              ? Math.min(
                  100,
                  (
                    (Number(site.total_paid || 0) /
                      Number(site.total_expense || 0)) *
                    100
                  )
                ).toFixed(0)
              : 0}
            %
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
            style={{
              width: `${
                site.total_expense > 0
                  ? Math.min(
                      100,
                      (Number(site.total_paid || 0) /
                        Number(site.total_expense || 0)) *
                        100
                    )
                  : 0
              }%`,
            }}
          />
        </div>

      </div>

    </button>
  )
}

export default SiteCard