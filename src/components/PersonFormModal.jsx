import { useEffect, useState } from "react"
import { X } from "lucide-react"

function PersonFormModal({
  open,
  type,
  person,
  onClose,
  onSubmit,
  loading,
}) {
  const [name, setName] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState("")

  const isEditing = Boolean(person)

  useEffect(() => {
    if (person) {
      setName(person.name || "")
      setIsActive(person.is_active ?? true)
    } else {
      setName("")
      setIsActive(true)
    }

    setError("")
  }, [person, open])

  if (!open) {
    return null
  }

  const personLabel =
    type === "labour"
      ? "Labour"
      : "Mesthiri"

  const handleSubmit = async (event) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      setError("Please enter a name.")
      return
    }

    if (trimmedName.length > 150) {
      setError("Name cannot exceed 150 characters.")
      return
    }

    setError("")

    try {
      await onSubmit({
        name: trimmedName,
        is_active: isActive,
      })
    } catch (submitError) {
      const data = submitError?.response?.data

      if (data?.name) {
        setError(
          Array.isArray(data.name)
            ? data.name[0]
            : data.name
        )
      } else {
        setError(
          "Unable to save. Please try again."
        )
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEditing
                ? `Edit ${personLabel}`
                : `Add ${personLabel}`}
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              {isEditing
                ? `Update ${personLabel.toLowerCase()} details`
                : `Add a new ${personLabel.toLowerCase()} to this site`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder={`Enter ${personLabel.toLowerCase()} name`}
              autoFocus
              disabled={loading}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 disabled:bg-slate-100"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
              disabled={loading}
              className="h-4 w-4 rounded border-slate-300"
            />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Active
              </p>

              <p className="text-xs text-slate-500">
                Active people can be used for daily entries.
              </p>
            </div>
          </label>

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : `Add ${personLabel}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PersonFormModal