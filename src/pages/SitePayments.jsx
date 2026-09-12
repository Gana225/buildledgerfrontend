import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Receipt,
  Search,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import api from "../api/axios"

function getToday() {
  const now = new Date()

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

function SitePayments() {
  const { siteId } = useParams()
  const navigate = useNavigate()

  const [data, setData] = useState(null)
  const [tab, setTab] = useState("labour")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [paymentWorker, setPaymentWorker] = useState(null)
  const [accountWorker, setAccountWorker] = useState(null)

  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get(
        `/reports/sites/${siteId}/worker-accounts/`
      )

      setData(response.data)
    } catch (err) {
      console.error(err)

      setError(
        err.response?.data?.detail ||
          "Unable to load worker accounts."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAccounts()
  }, [siteId])

  const workers = useMemo(() => {
    const list =
      tab === "labour"
        ? data?.labour || []
        : data?.mesthiri || []

    const query = search.trim().toLowerCase()

    if (!query) {
      return list
    }

    return list.filter((person) =>
      person.name
        .toLowerCase()
        .includes(query)
    )
  }, [data, tab, search])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-slate-500"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading worker accounts...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-3">

          <button
            type="button"
            onClick={() => navigate(`/sites/${siteId}`)}
            className="mt-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={19} />
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Worker Accounts
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              {data?.site?.name || "Site"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track earnings, payments and outstanding balances.
            </p>
          </div>
        </div>

      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <SummaryCard
          label="Total Earned"
          value={money(
            data?.summary?.total_earned
          )}
          icon={<Receipt size={19} />}
        />

        <SummaryCard
          label="Total Paid"
          value={money(
            data?.summary?.total_paid
          )}
          icon={<Wallet size={19} />}
        />

        <SummaryCard
          label="Total Outstanding"
          value={money(
            data?.summary?.total_due
          )}
          icon={<Wallet size={19} />}
          highlight
        />

      </div>

      {/* Tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">

        <div className="grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={() => setTab("labour")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              tab === "labour"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users
              size={17}
              className="mr-2 inline"
            />
            Labour
          </button>

          <button
            type="button"
            onClick={() => setTab("mesthiri")}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              tab === "mesthiri"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Users
              size={17}
              className="mr-2 inline"
            />
            Mesthiri
          </button>

        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder={`Search ${tab}...`}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-slate-400"
        />
      </div>

      {/* Workers */}
      <div className="space-y-3">

        {workers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
            <Users
              size={30}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              No {tab} accounts found.
            </p>
          </div>
        ) : (
          workers.map((worker) => (
            <WorkerAccountCard
              key={worker.id}
              worker={worker}
              type={tab}
              onPay={() =>
                setPaymentWorker(worker)
              }
              onAccount={() =>
                setAccountWorker(worker)
              }
            />
          ))
        )}

      </div>

      {paymentWorker && (
        <PaymentModal
          siteId={siteId}
          worker={paymentWorker}
          type={tab}
          onClose={() =>
            setPaymentWorker(null)
          }
          onSaved={async () => {
            setPaymentWorker(null)
            await loadAccounts()
            window.alert(
              "Payment recorded successfully."
            )
          }}
        />
      )}

      {accountWorker && (
        <AccountModal
          siteId={siteId}
          worker={accountWorker}
          type={tab}
          onClose={() =>
            setAccountWorker(null)
          }
        />
      )}

    </div>
  )
}


function SummaryCard({
  label,
  value,
  icon,
  highlight = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <div className="rounded-xl bg-slate-100 p-2 text-slate-500">
          {icon}
        </div>

      </div>

      <p
        className={`mt-3 text-2xl font-bold ${
          highlight
            ? "text-amber-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

    </div>
  )
}


function WorkerAccountCard({
  worker,
  onPay,
  onAccount,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
              {worker.name
                ?.slice(0, 1)
                .toUpperCase()}
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                {worker.name}
              </h3>

              <p className="text-xs text-slate-400">
                {worker.worked_days} work{" "}
                {worker.worked_days === 1
                  ? "day"
                  : "days"}
              </p>
            </div>

          </div>

        </div>

        <div className="grid grid-cols-3 gap-4 lg:min-w-[500px]">

          <Amount
            label="Earned"
            value={worker.total_earned}
          />

          <Amount
            label="Paid"
            value={worker.total_paid}
          />

          <Amount
            label="Due"
            value={worker.total_due}
            due
          />

        </div>

        <div className="flex gap-2">

          <button
            type="button"
            onClick={onAccount}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            View Account
          </button>

          <button
            type="button"
            onClick={onPay}
            disabled={
              Number(worker.total_due || 0) <= 0
            }
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus
              size={16}
              className="mr-1 inline"
            />
            Payment
          </button>

        </div>

      </div>

    </div>
  )
}


function Amount({
  label,
  value,
  due = false,
}) {
  return (
    <div>
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-base font-bold ${
          due
            ? "text-amber-600"
            : "text-slate-900"
        }`}
      >
        {money(value)}
      </p>
    </div>
  )
}


function PaymentModal({
  siteId,
  worker,
  type,
  onClose,
  onSaved,
}) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(getToday())
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const due = Number(
    worker.total_due || 0
  )

  const handleSave = async () => {
    const value = Number(amount)

    if (!value || value <= 0) {
      setError(
        "Enter a payment amount greater than zero."
      )
      return
    }

    if (value > due) {
      setError(
        `Payment cannot exceed ${money(due)}.`
      )
      return
    }

    try {
      setSaving(true)
      setError("")

      const base =
        type === "labour"
          ? `labour/sites/${siteId}/labour/${worker.id}/payments/`
          : `mesthiri/sites/${siteId}/mesthiri/${worker.id}/payments/`

      await api.post(base, {
        payment_date: date,
        amount: value,
        notes: notes.trim(),
      })

      await onSaved()
    } catch (err) {
      console.error(err)

      const data = err.response?.data

      if (typeof data === "string") {
        setError(data)
      } else if (data) {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)

        setError(
          messages.join(" ") ||
            "Unable to record payment."
        )
      } else {
        setError(
          "Unable to record payment."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Add Payment
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {worker.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={21} />
          </button>

        </div>

        <div className="space-y-5 p-5">

          <div className="grid grid-cols-3 gap-3">

            <MiniStat
              label="Earned"
              value={worker.total_earned}
            />

            <MiniStat
              label="Paid"
              value={worker.total_paid}
            />

            <MiniStat
              label="Due"
              value={worker.total_due}
              due
            />

          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Payment amount
            </label>

            <div className="mt-2 flex items-center rounded-xl border border-slate-200 px-4 focus-within:border-slate-400">

              <span className="text-xl font-bold text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                max={due}
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="500"
                className="w-full px-3 py-3 text-xl font-bold outline-none"
              />

            </div>

            <p className="mt-1 text-xs text-slate-400">
              Maximum payable now: {money(due)}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Payment date
            </label>

            <div className="relative mt-2">

              <CalendarDays
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-slate-400"
              />

            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={3}
              placeholder="Weekly payment, cash, etc."
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <div className="flex gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={16}
                    className="mr-2 inline animate-spin"
                  />
                  Saving...
                </>
              ) : (
                `Pay ${amount ? money(amount) : ""}`
              )}
            </button>

          </div>

        </div>

      </div>

    </div>
  )
}


function MiniStat({
  label,
  value,
  due = false,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-bold ${
          due
            ? "text-amber-600"
            : "text-slate-900"
        }`}
      >
        {money(value)}
      </p>
    </div>
  )
}


function AccountModal({
  siteId,
  worker,
  type,
  onClose,
}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const load = async () => {
      try {
        const base =
          type === "labour"
            ? `labour/sites/${siteId}/labour/${worker.id}/account/`
            : `mesthiri/sites/${siteId}/mesthiri/${worker.id}/account/`

        const response = await api.get(base)

        setData(response.data)
      } catch (err) {
        console.error(err)

        setError(
          "Unable to load account history."
        )
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [siteId, worker.id, type])

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Account Ledger
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {worker.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={21} />
          </button>

        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">

          {loading ? (
            <div className="py-20 text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-slate-500"
              />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : (
            <div className="space-y-6">

              {/* Account summary */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <MiniStat
                  label="Total Earned"
                  value={
                    data.summary.total_earned
                  }
                />

                <MiniStat
                  label="Total Paid"
                  value={
                    data.summary.total_paid
                  }
                />

                <MiniStat
                  label="Outstanding"
                  value={
                    data.summary.total_due
                  }
                  due
                />

              </div>

              {/* Contributions */}
              <LedgerSection
                title="Contribution History"
                icon={<Receipt size={18} />}
              >

                {data.contributions.length === 0 ? (
                  <EmptyLedger text="No work records." />
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                      <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3 whitespace-nowrap">
                            Date
                          </th>

                          <th className="px-3 py-3 whitespace-nowrap">
                            Site
                          </th>

                          <th className="px-3 py-3">
                            Work Done
                          </th>

                          <th className="px-3 py-3 text-right whitespace-nowrap">
                            Wage
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.contributions.map(
                          (entry) => (
                            <tr
                              key={entry.id}
                              className="border-b border-slate-100 align-top"
                            >
                              <td className="px-3 py-3 font-medium text-slate-700 whitespace-nowrap">
                                {new Date(
                                  `${entry.date}T00:00:00`
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </td>

                              <td className="px-3 py-3 text-slate-500 whitespace-nowrap">
                                {data.site.name}
                              </td>

                              <td className="px-3 py-3 min-w-[280px] max-w-[500px]">
                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                  {entry.work_description || "No work description recorded."}
                                </p>
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-slate-800 whitespace-nowrap">
                                {money(entry.wage)}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>

                  </div>
                )}

              </LedgerSection>

              {/* Payments */}
              <LedgerSection
                title="Payment History"
                icon={<Wallet size={18} />}
              >

                {data.payments.length === 0 ? (
                  <EmptyLedger text="No payments recorded." />
                ) : (
                  <div className="overflow-x-auto">

                    <table className="w-full text-left text-sm">

                      <thead>
                        <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-3">
                            Date
                          </th>

                          <th className="px-3 py-3 text-right">
                            Amount
                          </th>

                          <th className="px-3 py-3">
                            Notes
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {data.payments.map(
                          (payment) => (
                            <tr
                              key={payment.id}
                              className="border-b border-slate-100"
                            >
                              <td className="px-3 py-3 font-medium text-slate-700">
                                {new Date(
                                  `${payment.payment_date}T00:00:00`
                                ).toLocaleDateString(
                                  "en-IN"
                                )}
                              </td>

                              <td className="px-3 py-3 text-right font-bold text-slate-800">
                                {money(
                                  payment.amount
                                )}
                              </td>

                              <td className="px-3 py-3 text-slate-500">
                                {payment.notes ||
                                  "—"}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>

                  </div>
                )}

              </LedgerSection>

            </div>
          )}

        </div>

      </div>

    </div>
  )
}


function LedgerSection({
  title,
  icon,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>

        <h3 className="font-bold text-slate-900">
          {title}
        </h3>

      </div>

      <div className="p-2">
        {children}
      </div>

    </section>
  )
}


function EmptyLedger({ text }) {
  return (
    <div className="px-4 py-8 text-center text-sm text-slate-400">
      {text}
    </div>
  )
}

export default SitePayments