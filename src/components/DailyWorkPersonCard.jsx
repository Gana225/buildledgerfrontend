import { GripVertical, IndianRupee, Trash2 } from "lucide-react"

function DailyWorkPersonCard({
  person,
  type,
  onUpdate,
  onRemove,
}) {
  const name = person.name || "Unknown"

  const handleWageChange = (event) => {
    onUpdate({
      ...person,
      wage: event.target.value,
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
          <p className="truncate font-semibold text-slate-900">
            {name}
          </p>

          {/* Wage */}
          <label className="mt-3 block min-w-0">
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
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => onRemove(person)}
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