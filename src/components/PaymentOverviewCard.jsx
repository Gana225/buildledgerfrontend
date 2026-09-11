import {
  CircleDollarSign,
  CheckCircle2,
  Clock3,
} from "lucide-react"

function PaymentOverviewCard({
  totalExpense = 0,
  totalPaid = 0,
  totalOutstanding = 0,
}) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

  const total = Number(totalExpense || 0)
  const paid = Number(totalPaid || 0)

  const paidPercentage =
    total > 0
      ? Math.min((paid / total) * 100, 100)
      : 0

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Payment Overview
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Overall payment status
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <CircleDollarSign size={21} />
        </div>
      </div>

      <div className="mt-7">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Paid progress
            </p>

            <p className="mt-1 text-3xl font-bold">
              {paidPercentage.toFixed(0)}%
            </p>
          </div>

          <p className="text-sm text-slate-400">
            of total expense
          </p>
        </div>

        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-700"
            style={{
              width: `${paidPercentage}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs text-slate-400">
            Total
          </p>

          <p className="mt-1 font-semibold">
            {formatCurrency(totalExpense)}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-400/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-emerald-300">
            <CheckCircle2 size={14} />
            Paid
          </div>

          <p className="mt-1 font-semibold text-emerald-200">
            {formatCurrency(totalPaid)}
          </p>
        </div>

        <div className="rounded-2xl bg-rose-400/10 p-4">
          <div className="flex items-center gap-1.5 text-xs text-rose-300">
            <Clock3 size={14} />
            Pending
          </div>

          <p className="mt-1 font-semibold text-rose-200">
            {formatCurrency(totalOutstanding)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default PaymentOverviewCard