import { useEffect, useMemo, useState } from "react"
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleDollarSign,
  HardHat,
  IndianRupee,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  WalletCards,
  Plus,
  Users,
  CreditCard,
  PackagePlus,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import api from "../api/axios"
import DailyWorkModal from "../components/DailyWorkModal"
import AddMaterialModal from "../components/AddMaterialModal"

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}


function formatDate(dateString) {
  if (!dateString) return ""

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
}


function formatMonth(dateString) {
  if (!dateString) return ""

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
}


function percentage(value, total) {
  if (!Number(total)) return 0

  return Math.min(
    100,
    Math.max(
      0,
      (Number(value || 0) / Number(total)) * 100
    )
  )
}


/* ---------------------------------- */
/* Financial stat card */
/* ---------------------------------- */

function FinancialCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  type,
}) {
  const styles = {
    expense: {
      icon: "bg-orange-50 text-orange-600",
    },
    paid: {
      icon: "bg-emerald-50 text-emerald-600",
    },
    outstanding: {
      icon: "bg-red-50 text-red-600",
    },
  }

  const style =
    styles[type] || styles.expense

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-50 transition duration-500 group-hover:scale-150" />

      <div className="relative">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${style.icon}`}
        >
          <Icon size={21} />
        </div>

        <p className="mt-5 text-sm font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {formatCurrency(amount)}
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {subtitle}
        </p>
      </div>
    </div>
  )
}


/* ---------------------------------- */
/* Expense breakdown */
/* ---------------------------------- */

function ExpenseBreakdown({
  items,
  total,
}) {
  const icons = {
    Labour: HardHat,
    Mesthiri: BriefcaseBusiness,
    Materials: Package,
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Expenses
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Expense breakdown
          </h2>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <BarChart3 size={19} />
        </div>
      </div>

      <div className="mt-7 space-y-6">
        {items.map((item) => {
          const Icon =
            icons[item.category] ||
            CircleDollarSign

          const percent = percentage(
            item.amount,
            total
          )

          return (
            <div
              key={item.category}
              className="flex items-center gap-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">
                    {item.category}
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-800 transition-all duration-700"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>

                  <span className="w-9 text-right text-xs font-medium text-slate-400">
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


/* ---------------------------------- */
/* Payment overview */
/* ---------------------------------- */

function PaymentOverview({
  total,
  paid,
  outstanding,
}) {
  const paidPercent = percentage(
    paid,
    total
  )

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5" />

      <div className="relative">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <WalletCards size={21} />
        </div>

        <p className="mt-6 text-sm text-slate-400">
          Payment status
        </p>

        <p className="mt-1 text-3xl font-bold">
          {formatCurrency(paid)}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          paid out of {formatCurrency(total)}
        </p>

        <div className="mt-7">
          <div className="mb-2 flex justify-between text-xs">
            <span className="text-slate-400">
              Payment progress
            </span>

            <span className="font-bold text-white">
              {paidPercent.toFixed(0)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{
                width: `${paidPercent}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">
              Paid
            </p>

            <p className="mt-1 text-sm font-bold">
              {formatCurrency(paid)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs text-slate-400">
              Outstanding
            </p>

            <p className="mt-1 text-sm font-bold">
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ---------------------------------- */
/* Daily / monthly table */
/* ---------------------------------- */

function ExpenseTable({
  title,
  subtitle,
  data,
  monthly = false,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
              {monthly ? "Monthly" : "Daily"}
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <CalendarDays size={17} />
          </div>
        </div>
      </div>

      {data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr className="border-b border-slate-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:px-6">
                  {monthly ? "Month" : "Date"}
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 sm:px-6">
                  Expense
                </th>

                {!monthly && (
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400 sm:px-6">
                    Paid
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr
                  key={`${item.date || item.month}-${index}`}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-5 py-4 text-sm font-medium text-slate-700 sm:px-6">
                    {monthly
                      ? formatMonth(item.month)
                      : formatDate(item.date)}
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900 sm:px-6">
                    {formatCurrency(item.total)}
                  </td>

                  {!monthly && (
                    <td className="px-5 py-4 text-right text-sm font-semibold text-emerald-600 sm:px-6">
                      {formatCurrency(item.paid)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-slate-400">
            No records available yet.
          </p>
        </div>
      )}
    </div>
  )
}


/* ---------------------------------- */
/* Category summary */
/* ---------------------------------- */

function CategoryCard({
  title,
  icon: Icon,
  total,
  paid,
  remaining,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={18} />
        </div>

        <ArrowUpRight
          size={17}
          className="text-slate-300"
        />
      </div>

      <p className="mt-5 text-sm font-semibold text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {formatCurrency(total)}
      </p>

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            Paid
          </span>

          <span className="font-semibold text-emerald-600">
            {formatCurrency(paid)}
          </span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-slate-400">
            Remaining
          </span>

          <span className="font-semibold text-red-600">
            {formatCurrency(remaining)}
          </span>
        </div>
      </div>
    </div>
  )
}


/* ================================== */
/* Site Dashboard */
/* ================================== */

function SiteDashboard() {
  const { siteId } = useParams()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [dailyWorkOpen, setDailyWorkOpen] = useState(false)
  const [materialModalOpen, setMaterialModalOpen] = useState(false)

  const loadDashboard = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      setError("")

      const response = await api.get(
        `/reports/sites/${siteId}/dashboard/`
      )

      setDashboard(response.data)
    } catch (err) {
      console.error(
        "Failed to load site dashboard:",
        err
      )

      setError(
        err.response?.data?.detail ||
          "Unable to load site dashboard."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [siteId])

  const summary = dashboard?.summary
  const site = dashboard?.site

  const totalExpense = Number(
    summary?.total_expense || 0
  )

  const totalPaid = Number(
    summary?.total_paid || 0
  )

  const totalOutstanding = Number(
    summary?.total_outstanding || 0
  )

  const paymentPercentage = useMemo(() => {
    if (!totalExpense) return 0

    return Math.min(
      100,
      (totalPaid / totalExpense) * 100
    )
  }, [totalExpense, totalPaid])

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Loader2
              size={22}
              className="animate-spin"
            />
          </div>

          <p className="text-sm font-medium text-slate-500">
            Loading site dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Activity size={22} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Site dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-24">

      {/* =============================== */}
      {/* Site header */}
      {/* =============================== */}

      <section>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        <div className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Building2 size={25} />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] font-bold tracking-wide text-slate-300">
                    {dashboard.site.code}
                  </span>

                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    Active
                  </span>
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  {dashboard.site.name}
                </h1>

                <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin size={15} />
                  <span>Site financial overview</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </section>


      {/* =============================== */}
      {/* Main financial cards */}
      {/* =============================== */}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <FinancialCard
          title="Total Expense"
          amount={totalExpense}
          subtitle="All recorded site expenses"
          icon={CircleDollarSign}
          type="expense"
        />

        <FinancialCard
          title="Total Paid"
          amount={totalPaid}
          subtitle={`${paymentPercentage.toFixed(
            0
          )}% of expenses paid`}
          icon={WalletCards}
          type="paid"
        />

        <FinancialCard
          title="Outstanding"
          amount={totalOutstanding}
          subtitle="Amount still pending"
          icon={TrendingDown}
          type="outstanding"
        />

      </section>

      <section className="mt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <CalendarDays size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Daily Work
                  </h2>

                  <p className="text-xs text-slate-400">
                    Record today's labour and mesthiri work
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMaterialModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <PackagePlus size={17} />
              Add Material
            </button>

            <button
              type="button"
              onClick={() => setDailyWorkOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Plus size={17} />
              Manage Today's Work
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(`/sites/${siteId}/payments`)
              }
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <CreditCard size={17} />
              Manage Payments
            </button>
            
          </div>
        </div>
      </section>


      {/* =============================== */}
      {/* Breakdown */}
      {/* =============================== */}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        <ExpenseBreakdown
          items={
            dashboard.expense_breakdown || []
          }
          total={totalExpense}
        />

        <PaymentOverview
          total={totalExpense}
          paid={totalPaid}
          outstanding={totalOutstanding}
        />

      </section>


      {/* =============================== */}
      {/* Category cards */}
      {/* =============================== */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Financial categories
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Site expenses
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          <CategoryCard
            title="Labour"
            icon={HardHat}
            total={summary?.labour?.total}
            paid={summary?.labour?.paid}
            remaining={
              summary?.labour?.remaining
            }
          />

          <CategoryCard
            title="Mesthiri"
            icon={BriefcaseBusiness}
            total={summary?.mesthiri?.total}
            paid={summary?.mesthiri?.paid}
            remaining={
              summary?.mesthiri?.remaining
            }
          />

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Package size={18} />
              </div>

              <ArrowUpRight
                size={17}
                className="text-slate-300"
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-500">
              Materials
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(
                summary?.materials?.total
              )}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Material purchase expenses
            </p>
          </div>

        </div>
      </section>


      {/* =============================== */}
      {/* Daily */}
      {/* =============================== */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Activity
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Daily expenses
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          <ExpenseTable
            title="Labour"
            subtitle="Daily labour expense and payments"
            data={
              dashboard.labour_daily || []
            }
          />

          <ExpenseTable
            title="Mesthiri"
            subtitle="Daily mesthiri expense and payments"
            data={
              dashboard.mesthiri_daily || []
            }
          />

          <ExpenseTable
            title="Materials"
            subtitle="Daily material purchases"
            data={
              dashboard.material_daily || []
            }
          />

        </div>
      </section>


      {/* =============================== */}
      {/* Monthly */}
      {/* =============================== */}

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
            Trends
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Monthly expenses
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          <ExpenseTable
            title="Labour"
            subtitle="Monthly labour spending"
            data={
              dashboard.labour_monthly || []
            }
            monthly
          />

          <ExpenseTable
            title="Mesthiri"
            subtitle="Monthly mesthiri spending"
            data={
              dashboard.mesthiri_monthly || []
            }
            monthly
          />

          <ExpenseTable
            title="Materials"
            subtitle="Monthly material spending"
            data={
              dashboard.material_monthly || []
            }
            monthly
          />

        </div>
      </section>


      {/* =============================== */}
      {/* Bottom summary */}
      {/* =============================== */}

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <Activity size={18} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Site financial summary
            </h2>

            <p className="text-xs text-slate-400">
              Current position of this construction site
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

          <div className="py-3 sm:px-5 sm:py-1">
            <p className="text-xs text-slate-400">
              Total expense
            </p>

            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatCurrency(totalExpense)}
            </p>
          </div>

          <div className="py-3 sm:px-5 sm:py-1">
            <p className="text-xs text-slate-400">
              Total paid
            </p>

            <p className="mt-1 flex items-center gap-1 text-lg font-bold text-emerald-600">
              <ArrowUpRight size={16} />
              {formatCurrency(totalPaid)}
            </p>
          </div>

          <div className="py-3 sm:px-5 sm:py-1">
            <p className="text-xs text-slate-400">
              Outstanding
            </p>

            <p className="mt-1 flex items-center gap-1 text-lg font-bold text-red-600">
              <ArrowDownRight size={16} />
              {formatCurrency(
                totalOutstanding
              )}
            </p>
          </div>

        </div>
      </section>

      {dailyWorkOpen && (
        <DailyWorkModal
          siteId={siteId}
          siteName={site?.name || "Site"}
          onClose={() =>
            setDailyWorkOpen(false)
          }
          onSaved={loadDashboard}
        />
      )}

      {materialModalOpen && (
        <AddMaterialModal
          siteId={siteId}
          onClose={() =>
            setMaterialModalOpen(false)
          }
          onSaved={loadDashboard}
        />
      )}

    </div>
  )
}

export default SiteDashboard