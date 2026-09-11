import {
  Edit2,
  Trash2,
  UserRound,
} from "lucide-react"

function PersonTable({
  people,
  type,
  onEdit,
  onDelete,
}) {
  const personLabel =
    type === "labour"
      ? "Labour"
      : "Mesthiri"

  if (people.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <UserRound size={25} />
        </div>

        <h3 className="mt-4 text-base font-semibold text-slate-900">
          No {personLabel.toLowerCase()} found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Add a new {personLabel.toLowerCase()} to get started.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {people.map((person) => (
              <tr
                key={person.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {person.name
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </div>

                    <span className="font-medium text-slate-900">
                      {person.name}
                    </span>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <StatusBadge
                    active={person.is_active}
                  />
                </td>

                <td className="px-5 py-4">
                  <ActionButtons
                    onEdit={() =>
                      onEdit(person)
                    }
                    onDelete={() =>
                      onDelete(person)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {people.map((person) => (
          <div
            key={person.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                  {person.name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {person.name}
                  </p>

                  <div className="mt-1">
                    <StatusBadge
                      active={person.is_active}
                    />
                  </div>
                </div>
              </div>

              <ActionButtons
                onEdit={() =>
                  onEdit(person)
                }
                onDelete={() =>
                  onDelete(person)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  )
}

function ActionButtons({
  onEdit,
  onDelete,
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        title="Edit"
      >
        <Edit2 size={17} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
        title="Delete"
      >
        <Trash2 size={17} />
      </button>
    </div>
  )
}

export default PersonTable