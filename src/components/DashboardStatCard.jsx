import { ArrowUpRight } from "lucide-react"

function DashboardStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "slate",
}) {
  const styles = {
    slate: {
      icon: "bg-slate-900 text-white",
      badge: "bg-slate-100 text-slate-600",
    },

    blue: {
      icon: "bg-blue-600 text-white",
      badge: "bg-blue-50 text-blue-600",
    },

    amber: {
      icon: "bg-amber-500 text-white",
      badge: "bg-amber-50 text-amber-700",
    },

    rose: {
      icon: "bg-rose-500 text-white",
      badge: "bg-rose-50 text-rose-600",
    },

    emerald: {
      icon: "bg-emerald-500 text-white",
      badge: "bg-emerald-50 text-emerald-600",
    },
  }

  const currentStyle = styles[accent] || styles.slate

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${currentStyle.icon}`}
        >
          <Icon size={22} />
        </div>

        <div
          className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${currentStyle.badge}`}
        >
          Overview
          <ArrowUpRight size={12} />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {value}
        </h3>

        {subtitle && (
          <p className="mt-2 text-xs text-slate-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

export default DashboardStatCard