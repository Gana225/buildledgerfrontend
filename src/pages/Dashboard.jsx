import { useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Banknote,
  Building2,
  CircleDollarSign,
  HardHat,
  Loader2,
  Plus,
  RefreshCcw,
  Trash2,
  Users,
  X,
} from "lucide-react"

import api from "../api/axios"

import DashboardStatCard from "../components/DashboardStatCard"
import ExpenseBreakdownCard from "../components/ExpenseBreakdownCard"
import PaymentOverviewCard from "../components/PaymentOverviewCard"
import DashboardSiteCard from "../components/DashboardSiteCard"
import CreateSiteModal from "../components/CreateSiteModal"

function Dashboard() {
  const [dashboard, setDashboard] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [siteModalOpen, setSiteModalOpen] =
    useState(false)

  const [editingSite, setEditingSite] =
    useState(null)

  const [deleteSite, setDeleteSite] =
    useState(null)

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0))
  }

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

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get(
        "/reports/dashboard/"
      )

      setDashboard(response.data)
    } catch (err) {
      console.error(
        "Dashboard loading failed:",
        err
      )

      setError(
        getErrorMessage(
          err,
          "Unable to load dashboard data."
        )
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const summary = dashboard?.summary || {}
  const sites = dashboard?.sites || []
  const expenseBreakdown =
    dashboard?.expense_breakdown || []

  const activeSiteCount = useMemo(() => {
    return sites.length
  }, [sites])

  const openCreateSite = () => {
    setEditingSite(null)
    setError("")
    setSuccess("")
    setSiteModalOpen(true)
  }

  const openEditSite = (site) => {
    const dashboardSite = {
      id: site.site_id,
      code: site.site_code,
      name: site.site_name,
      location: "",
      description: "",
      is_active: true,
    }

    setEditingSite(dashboardSite)
    setError("")
    setSuccess("")
    setSiteModalOpen(true)
  }

  const closeSiteModal = () => {
    if (saving) return

    setSiteModalOpen(false)
    setEditingSite(null)
  }

  const handleSiteSubmit = async (formData) => {
    try {
      setSaving(true)
      setError("")
      setSuccess("")

      if (editingSite) {
        await api.patch(
          `/sites/${editingSite.id}/`,
          formData
        )

        setSuccess(
          "Site updated successfully."
        )
      } else {
        await api.post(
          "/sites/",
          formData
        )

        setSuccess(
          "Site created successfully."
        )
      }

      setSiteModalOpen(false)
      setEditingSite(null)

      await loadDashboard()
    } catch (err) {
      console.error(
        "Site save failed:",
        err
      )

      setError(
        getErrorMessage(
          err,
          "Unable to save site."
        )
      )

      throw err
    } finally {
      setSaving(false)
    }
  }

  const openDeleteSite = (site) => {
    setDeleteSite(site)
    setError("")
    setSuccess("")
  }

  const closeDeleteSite = () => {
    if (saving) return
    setDeleteSite(null)
  }

  const handleDeleteSite = async () => {
    if (!deleteSite) return

    try {
      setSaving(true)
      setError("")

      await api.delete(
        `/sites/${deleteSite.site_id}/`
      )

      setSuccess(
        `${deleteSite.site_name} deleted successfully.`
      )

      setDeleteSite(null)

      await loadDashboard()
    } catch (err) {
      console.error(
        "Site deletion failed:",
        err
      )

      setError(
        getErrorMessage(
          err,
          "Unable to delete site."
        )
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
            <Loader2
              size={21}
              className="animate-spin"
            />
            Loading dashboard...
          </div>
        </div>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* PAGE HEADER */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Building2 size={16} />
              Workspace
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Manage your construction sites, workforce
              and project finances from one place.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={loadDashboard}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <RefreshCcw size={17} />
              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={openCreateSite}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Add Site
            </button>
          </div>
        </section>

        {/* ALERTS */}
        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto shrink-0 rounded-lg p-1 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <span>{success}</span>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="ml-auto rounded-lg p-1 hover:bg-emerald-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* FINANCIAL STATS */}
        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            title="Total Expense"
            value={formatCurrency(
              summary.total_expense
            )}
            subtitle="Across all sites"
            icon={CircleDollarSign}
          />

          <DashboardStatCard
            title="Total Paid"
            value={formatCurrency(
              summary.total_paid
            )}
            subtitle="Payments recorded"
            icon={Banknote}
          />

          <DashboardStatCard
            title="Outstanding"
            value={formatCurrency(
              summary.total_outstanding
            )}
            subtitle="Amount remaining"
            icon={AlertCircle}
          />

          <DashboardStatCard
            title="Active Sites"
            value={activeSiteCount}
            subtitle="Projects managed"
            icon={Building2}
          />
        </section>

        {/* OVERVIEW */}
        <section className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ExpenseBreakdownCard
            data={expenseBreakdown}
          />

          <PaymentOverviewCard
            totalExpense={summary.total_expense}
            totalPaid={summary.total_paid}
            totalOutstanding={
              summary.total_outstanding
            }
          />
        </section>

        {/* SITES */}
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  Your Sites
                </h2>

                <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                  {sites.length}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Create, edit, delete and open your
                construction projects.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateSite}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Plus size={17} />
              New Site
            </button>
          </div>

          {sites.length === 0 ? (
            <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Building2
                  size={28}
                  className="text-slate-500"
                />
              </div>

              <h3 className="mt-5 text-lg font-black text-slate-900">
                No construction sites yet
              </h3>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Create your first site to start tracking
                labour, mesthiri, materials and project
                expenses.
              </p>

              <button
                type="button"
                onClick={openCreateSite}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Create First Site
              </button>
            </div>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sites.map((site) => (
                <DashboardSiteCard
                  key={site.site_id}
                  site={site}
                  onEdit={openEditSite}
                  onDelete={openDeleteSite}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* CREATE / EDIT SITE */}
      <CreateSiteModal
        isOpen={siteModalOpen}
        onClose={closeSiteModal}
        onSubmit={handleSiteSubmit}
        saving={saving}
        editingSite={editingSite}
      />

      {/* DELETE CONFIRMATION */}
      {deleteSite && (
        <DeleteSiteModal
          site={deleteSite}
          saving={saving}
          onCancel={closeDeleteSite}
          onConfirm={handleDeleteSite}
        />
      )}
    </div>
  )
}

function DeleteSiteModal({
  site,
  saving,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative w-full rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Trash2 size={22} />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={19} />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-black text-slate-900">
          Delete this site?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          You are about to delete this construction
          site and its site record:
        </p>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Site
          </p>

          <p className="mt-1 text-base font-black text-slate-900">
            {site.site_code} — {site.site_name}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          Please make sure you really want to remove
          this site. Associated site data may also be
          affected according to your backend model
          relationships.
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {saving && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            Delete Site
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard