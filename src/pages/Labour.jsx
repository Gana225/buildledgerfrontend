import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Edit3,
  HardHat,
  Loader2,
  MapPin,
  Plus,
  RefreshCcw,
  Trash2,
  UserRound,
  X,
} from "lucide-react"

import api from "../api/axios"
import { useParams } from "react-router-dom"

function Labour() {

  const { siteId } = useParams()
  const isSiteView = Boolean(siteId)

  const [labours, setLabours] = useState([])
  const [sites, setSites] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editingLabour, setEditingLabour] = useState(null)

  const [showDelete, setShowDelete] = useState(false)
  const [deletingLabour, setDeletingLabour] = useState(null)

  const [showAssignment, setShowAssignment] = useState(false)
  const [assignmentLabour, setAssignmentLabour] = useState(null)

  const [form, setForm] = useState({
    name: "",
  })

  const [assignmentForm, setAssignmentForm] = useState({
    site: "",
    start_date: new Date().toISOString().slice(0, 10),
  })

  const getErrorMessage = (err, fallback) => {
    const data = err?.response?.data

    if (!data) return fallback

    if (typeof data.detail === "string") {
      return data.detail
    }

    if (typeof data === "string") {
      return data
    }

    const firstKey = Object.keys(data)[0]

    if (firstKey) {
      const value = data[firstKey]

      if (Array.isArray(value)) {
        return value[0]
      }

      if (typeof value === "string") {
        return value
      }
    }

    return fallback
  }

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      const [labourResponse, siteResponse] =
        await Promise.all([
          api.get("/labour/"),
          api.get("/sites/"),
        ])

      setLabours(
        Array.isArray(labourResponse.data)
          ? labourResponse.data
          : labourResponse.data?.results || []
      )

      setSites(
        Array.isArray(siteResponse.data)
          ? siteResponse.data
          : siteResponse.data?.results || []
      )
    } catch (err) {
      console.error(err)
      setError(
        getErrorMessage(
          err,
          "Unable to load labour data."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const activeCount = useMemo(
    () =>
      labours.filter(
        (labour) => labour.is_active !== false
      ).length,
    [labours]
  )

  const openCreate = () => {
    setEditingLabour(null)
    setForm({ name: "" })
    setError("")
    setSuccess("")
    setShowForm(true)
  }

  const openEdit = (labour) => {
    setEditingLabour(labour)
    setForm({
      name: labour.name || "",
    })
    setError("")
    setSuccess("")
    setShowForm(true)
  }

  const closeForm = () => {
    if (saving) return
    setShowForm(false)
    setEditingLabour(null)
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!form.name.trim()) {
      setError("Please enter the labour name.")
      return
    }

    try {
      setSaving(true)
      setError("")

      if (editingLabour) {
        await api.patch(
          `/labour/${editingLabour.id}/`,
          {
            name: form.name.trim(),
          }
        )

        setSuccess("Labour updated successfully.")
      } else {
        await api.post("/labour/", {
          name: form.name.trim(),
        })

        setSuccess("Labour added successfully.")
      }

      setShowForm(false)
      setEditingLabour(null)
      setForm({ name: "" })

      await loadData()
    } catch (err) {
      console.error(err)
      setError(
        getErrorMessage(
          err,
          "Unable to save labour."
        )
      )
    } finally {
      setSaving(false)
    }
  }

  const openDelete = (labour) => {
    setDeletingLabour(labour)
    setError("")
    setShowDelete(true)
  }

  const closeDelete = () => {
    if (saving) return
    setShowDelete(false)
    setDeletingLabour(null)
  }

  const handleDelete = async () => {
    if (!deletingLabour) return

    try {
      setSaving(true)
      setError("")

      await api.delete(
        `/labour/${deletingLabour.id}/`
      )

      setSuccess("Labour deleted successfully.")

      setShowDelete(false)
      setDeletingLabour(null)

      await loadData()
    } catch (err) {
      console.error(err)
      setError(
        getErrorMessage(
          err,
          "Unable to delete labour."
        )
      )
    } finally {
      setSaving(false)
    }
  }

  // const openAssignment = (labour) => {
  //   setAssignmentLabour(labour)
  //   setAssignmentForm({
  //     site: "",
  //     start_date: new Date()
  //       .toISOString()
  //       .slice(0, 10),
  //   })
  //   setError("")
  //   setShowAssignment(true)
  // }

  // const closeAssignment = () => {
  //   if (saving) return
  //   setShowAssignment(false)
  //   setAssignmentLabour(null)
  // }

  // const handleAssignment = async (event) => {
  //   event.preventDefault()

  //   if (!assignmentForm.site) {
  //     setError("Please select a site.")
  //     return
  //   }

  //   if (!assignmentForm.start_date) {
  //     setError("Please select a start date.")
  //     return
  //   }

  //   try {
  //     setSaving(true)
  //     setError("")

  //     await api.post(
  //       `/labour/${assignmentLabour.id}/assignments/`,
  //       {
  //         site: Number(assignmentForm.site),
  //         start_date:
  //           assignmentForm.start_date,
  //       }
  //     )

  //     setSuccess(
  //       `${assignmentLabour.name} assigned successfully.`
  //     )

  //     setShowAssignment(false)
  //     setAssignmentLabour(null)

  //     await loadData()
  //   } catch (err) {
  //     console.error(err)
  //     setError(
  //       getErrorMessage(
  //         err,
  //         "Unable to create assignment."
  //       )
  //     )
  //   } finally {
  //     setSaving(false)
  //   }
  // }

  const getCurrentSite = (labour) => {
    return (
      labour.current_site_name ||
      labour.current_site?.name ||
      labour.current_site?.site_name ||
      null
    )
  }

  const getCurrentSiteId = (labour) => {
    return (
      labour.current_site ||
      labour.current_site_id ||
      labour.current_site?.id ||
      null
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <UsersIcon />
              Workforce
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Labour
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Manage your complete labour master list,
              assignments and workforce history.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadData}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={17} />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Labour
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {success}
          </div>
        )}

        {/* STATS */}
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat
            label="Total Labour"
            value={labours.length}
            icon={UsersIcon}
          />

          <Stat
            label="Active"
            value={activeCount}
            icon={HardHat}
          />

          <Stat
            label="Sites"
            value={sites.length}
            icon={MapPin}
          />
        </div>

        {/* LIST */}
        <div className="mt-7">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2
                  size={20}
                  className="animate-spin"
                />
                Loading labour...
              </div>
            </div>
          ) : labours.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <UsersIcon
                  size={25}
                  className="text-slate-500"
                />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No labour added yet
              </h2>

              <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                Add your labour once here. Later, you can
                assign the same person to different sites
                without creating another labour record.
              </p>

              <button
                type="button"
                onClick={openCreate}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
              >
                <Plus size={17} />
                Add First Labour
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              {/* Desktop header */}
              <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(180px,1fr)_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
                <span>Labour</span>
                {/* <span>Current Site</span> */}
                <span className="text-right">Actions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {labours.map((labour) => {
                  const currentSite =
                    getCurrentSite(labour)

                  return (
                    <div
                      key={labour.id}
                      className="p-4 transition hover:bg-slate-50/70 sm:p-5"
                    >
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(180px,1fr)_auto] md:items-center">
                        {/* Person */}
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                            <UserRound size={20} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {labour.name}
                              </p>

                              {labour.is_active ===
                                false && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                                  Inactive
                                </span>
                              )}
                            </div>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Labour #{labour.id}
                            </p>
                          </div>
                        </div>

                        {/* Current site
                        <div>
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 md:hidden">
                            Current Site
                          </p>

                          {currentSite ? (
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                              <MapPin
                                size={16}
                                className="text-slate-400"
                              />
                              {currentSite}
                            </div>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                              Not assigned
                            </span>
                          )}
                        </div> */}

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 md:justify-end">
                          {/* <button
                            type="button"
                            onClick={() =>
                              openAssignment(labour)
                            }
                            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                          >
                            <MapPin size={14} />
                            Assign
                          </button> */}

                          <button
                            type="button"
                            onClick={() =>
                              openEdit(labour)
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openDelete(labour)
                            }
                            className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT */}
      {showForm && (
        <Modal onClose={closeForm}>
          <div className="p-5 sm:p-6">
            <ModalHeader
              title={
                editingLabour
                  ? "Edit Labour"
                  : "Add Labour"
              }
              subtitle={
                editingLabour
                  ? "Update the labour master record."
                  : "Create a labour record for your workforce."
              }
              onClose={closeForm}
            />

            <form
              onSubmit={handleSave}
              className="mt-6"
            >
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Labour Name
                </span>

                <input
                  autoFocus
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                  placeholder="Enter labour name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}
                  {editingLabour
                    ? "Save Changes"
                    : "Add Labour"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* DELETE */}
      {showDelete && deletingLabour && (
        <Modal onClose={closeDelete}>
          <div className="p-5 sm:p-6">
            <ModalHeader
              title="Delete Labour?"
              subtitle="This action cannot be undone."
              onClose={closeDelete}
            />

            <div className="mt-5 rounded-2xl bg-red-50 p-4">
              <p className="text-sm text-red-700">
                You are about to delete:
              </p>

              <p className="mt-1 text-base font-bold text-red-900">
                {deletingLabour.name}
              </p>
            </div>

            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={closeDelete}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {saving && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ASSIGNMENT */}
      {showAssignment && assignmentLabour && (
        <Modal onClose={closeAssignment}>
          <div className="p-5 sm:p-6">
            <ModalHeader
              title="Assign Labour"
              subtitle={`Assign ${assignmentLabour.name} to a site.`}
              onClose={closeAssignment}
            />

            <form
              onSubmit={handleAssignment}
              className="mt-6 space-y-5"
            >
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Site
                </span>

                <select
                  value={assignmentForm.site}
                  onChange={(event) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      site: event.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">
                    Select a site
                  </option>

                  {sites.map((site) => (
                    <option
                      key={site.id}
                      value={site.id}
                    >
                      {site.code
                        ? `${site.code} — ${site.name}`
                        : site.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Assignment Start Date
                </span>

                <div className="relative mt-2">
                  <CalendarDays
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    value={
                      assignmentForm.start_date
                    }
                    onChange={(event) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        start_date:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </label>

              <div className="rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                If this labour is currently assigned to
                another site, the backend should close the
                previous assignment before the new
                assignment begins.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={closeAssignment}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  )}
                  Assign
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UsersIcon({ size = 17, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          <Icon size={17} />
        </div>
      </div>

      <p className="mt-3 text-2xl font-black tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-3xl">
        {children}
      </div>
    </div>
  )
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-black text-slate-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
      >
        <X size={19} />
      </button>
    </div>
  )
}

export default Labour