import { useEffect, useState } from "react"
import {
  Building2,
  Loader2,
  MapPin,
  FileText,
  X,
} from "lucide-react"

function CreateSiteModal({
  isOpen,
  onClose,
  onSubmit,
  saving = false,
  editingSite = null,
}) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    location: "",
    description: "",
    is_active: true,
  })

  const [error, setError] = useState("")

  useEffect(() => {
    if (!isOpen) return

    if (editingSite) {
      setForm({
        code: editingSite.code || "",
        name: editingSite.name || "",
        location: editingSite.location || "",
        description: editingSite.description || "",
        is_active: editingSite.is_active !== false,
      })
    } else {
      setForm({
        code: "",
        name: "",
        location: "",
        description: "",
        is_active: true,
      })
    }

    setError("")
  }, [isOpen, editingSite])

  if (!isOpen) {
    return null
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError("Site name is required.")
      return
    }

    setError("")

    try {
      await onSubmit({
        name: form.name.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        is_active: form.is_active,
      })
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.name?.[0] ||
          err?.response?.data?.code?.[0] ||
          "Unable to save site."
      )
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <Building2 size={21} />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                {editingSite ? "Edit Site" : "Add New Site"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {editingSite
                  ? "Update your construction site details."
                  : "Create a new construction site."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-6"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Name */}
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Site Name *
              </span>

              <input
                autoFocus
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Raj Bhavan Project"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </label>
          </div>

          {/* Location */}
          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Location
            </span>

            <div className="relative mt-2">
              <MapPin
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Enter site location"
                className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </label>

          {/* Description */}
          <label className="mt-5 block">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Description
            </span>

            <div className="relative mt-2">
              <FileText
                size={17}
                className="pointer-events-none absolute left-4 top-4 text-slate-400"
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Add notes or project details..."
                className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </label>

          {/* Active */}
          <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />

            <div>
              <p className="text-sm font-bold text-slate-800">
                Active site
              </p>

              <p className="text-xs text-slate-500">
                Keep this site available for current work.
              </p>
            </div>
          </label>

          {/* Buttons */}
          <div className="mt-7 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {editingSite
                ? "Save Changes"
                : "Create Site"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateSiteModal