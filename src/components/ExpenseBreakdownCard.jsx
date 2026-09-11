import { BarChart3 } from "lucide-react"

function ExpenseBreakdownCard({
  breakdown = [],
  totalExpense = 0,
}) {
  const formatCurrency = (value) => {
    const number = Number(value || 0)

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(number)
  }

  console.log(breakdown)

  const getPercentage = (amount) => {
    const total = Number(totalExpense || 0)

    if (!total) return 0

    return Math.min(
      (Number(amount || 0) / total) * 100,
      100
    )
  }

  const getBarClass = (category) => {
    switch (category?.toLowerCase()) {
      case "labour":
        return "bg-blue-500"

      case "mesthiri":
        return "bg-amber-500"

      case "materials":
        return "bg-emerald-500"

      default:
        return "bg-slate-500"
    }
  }

  const getDotClass = (category) => {
    switch (category?.toLowerCase()) {
      case "labour":
        return "bg-blue-500"

      case "mesthiri":
        return "bg-amber-500"

      case "materials":
        return "bg-emerald-500"

      default:
        return "bg-slate-500"
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Expense Breakdown
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Where your project money is being spent
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <BarChart3 size={21} />
        </div>
      </div>

      <div className="mt-7 space-y-6">
        {breakdown.map((item) => {
          const percentage = getPercentage(item.amount)

          return (
            <div key={item.category}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${getDotClass(
                      item.category
                    )}`}
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {item.category}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>

                  <span className="ml-2 text-xs text-slate-400">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarClass(
                    item.category
                  )}`}
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ExpenseBreakdownCard