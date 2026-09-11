import {
  ArrowRight,
  Building2,
  Edit3,
  MapPin,
  MoreVertical,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

function DashboardSiteCard({
  site,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  const handleOpenSite = () => {
    navigate(`/sites/${site.site_id}`)
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* Top */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <button
            type="button"
            onClick={handleOpenSite}
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Building2 size={21} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                  {site.site_code || "SITE"}
                </span>
              </div>

              <h3 className="mt-1 truncate text-base font-black text-slate-900 sm:text-lg">
                {site.site_name}
              </h3>
            </div>
          </button>

          {/* Actions */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Site actions"
            >
              <MoreVertical size={19} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close actions"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />

                <div className="absolute right-0 top-11 z-20 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(site)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <Edit3 size={15} />
                    Edit Site
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(site)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={15} />
                    Delete Site
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Financial overview */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-2xl bg-slate-50">
          <FinancialItem
            label="Expense"
            value={formatCurrency(site.total_expense)}
          />

          <FinancialItem
            label="Paid"
            value={formatCurrency(site.total_paid)}
          />

          <FinancialItem
            label="Due"
            value={formatCurrency(site.total_outstanding)}
          />
        </div>

        {/* Open */}
        <button
          type="button"
          onClick={handleOpenSite}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
        >
          Open Site
          <ArrowRight
            size={16}
            className="transition group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  )
}

function FinancialItem({ label, value }) {
  return (
    <div className="min-w-0 px-3 py-3 text-center">
      <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-black text-slate-800 sm:text-sm">
        {value}
      </p>
    </div>
  )
}

export default DashboardSiteCard