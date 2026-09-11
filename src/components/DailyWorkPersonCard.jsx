import { GripVertical, IndianRupee, Trash2 } from "lucide-react"

function DailyWorkPersonCard({
  person,
  type,
  onUpdate,
  onRemove,
}) {
  const name = person.name || "Unknown"

  const wage = Math.max(0, Number(person.wage || 0))
  const paid = Math.max(0, Number(person.paid_amount || 0))

  const remaining = Math.max(0, wage - paid)

  const handleWageChange = (event) => {
    const value = event.target.value

    onUpdate({
      ...person,
      wage: value,
      // If wage is reduced below the current paid amount,
      // automatically cap paid amount to the new wage.
      paid_amount:
        value !== "" &&
        Number(person.paid_amount || 0) > Number(value)
          ? value
          : person.paid_amount,
    })
  }

  const handlePaidChange = (event) => {
    const value = event.target.value

    // Allow the user to clear the field while typing.
    if (value === "") {
      onUpdate({
        ...person,
        paid_amount: "",
      })
      return
    }

    const numericValue = Math.max(0, Number(value))
    const maxPaid = Math.max(0, Number(person.wage || 0))

    onUpdate({
      ...person,
      paid_amount: String(
        Math.min(numericValue, maxPaid)
      ),
    })
  }

  return (
    <div
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData(
          "application/json",
          JSON.stringify({
            type,
            id: person.id,
          })
        )

        event.dataTransfer.effectAllowed = "move"
      }}
      className="group rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-4"
    >
      <div className="flex items-start gap-2 sm:gap-3">
        {/* Drag handle */}
        <div
          className="cursor-grab pt-1 text-slate-400 active:cursor-grabbing"
          title="Drag"
          aria-label="Drag worker"
        >
          <GripVertical size={18} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Name + type */}
          <div className="flex min-w-0 items-center justify-between gap-2">
            <p className="truncate font-semibold text-slate-900">
              {name}
            </p>
          </div>

          {/* Wage / Paid */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {/* Wage */}
            <label className="min-w-0">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Wage
              </span>

              <div className="relative">
                <IndianRupee
                  size={13}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={person.wage ?? ""}
                  onChange={handleWageChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-2 text-sm font-semibold outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </label>

            {/* Paid */}
            <label className="min-w-0">
              <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Paid
              </span>

              <div className="relative">
                <IndianRupee
                  size={13}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="number"
                  min="0"
                  max={wage}
                  step="0.01"
                  inputMode="decimal"
                  value={person.paid_amount ?? ""}
                  onChange={handlePaidChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-6 pr-2 text-sm font-semibold outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>
            </label>
          </div>

          {/* Remaining */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs font-medium text-slate-400">
              Remaining
            </span>

            <span className="text-sm font-bold text-amber-600">
              ₹{remaining.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(person)}
          disabled={false}
          aria-label={`Remove ${name}`}
          title={`Remove ${name}`}
          className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  )
}

export default DailyWorkPersonCard
