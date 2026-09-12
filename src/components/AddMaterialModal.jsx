import { useState } from "react"
import {
  CalendarDays,
  Loader2,
  PackagePlus,
  X,
} from "lucide-react"

import api from "../api/axios"

function AddMaterialModal({
  siteId,
  onClose,
  onSaved,
}) {
  const getToday = () => {
    const date = new Date()

    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`
  }

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    price: "",
    purchase_date: getToday(),
    notes: "",
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")

    // -----------------------------------------------
    // Basic frontend validation
    // -----------------------------------------------

    if (!form.name.trim()) {
      setError("Material name is required.")
      return
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.")
      return
    }

    if (!form.unit.trim()) {
      setError("Unit is required.")
      return
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      setError("Price cannot be negative.")
      return
    }

    if (!form.purchase_date) {
      setError("Purchase date is required.")
      return
    }

    try {
      setSaving(true)

      await api.post(
        `/materials/sites/${siteId}/`,
        {
          name: form.name.trim(),
          quantity: Number(form.quantity),
          unit: form.unit.trim(),
          price: Number(form.price),
          purchase_date: form.purchase_date,
          notes: form.notes.trim(),
        }
      )

      // -----------------------------------------------
      // Refresh Site Dashboard
      // -----------------------------------------------

      if (onSaved) {
        await onSaved()
      }

      // -----------------------------------------------
      // Success
      // -----------------------------------------------

      window.alert(
        "Material added successfully."
      )

      // -----------------------------------------------
      // Close modal
      // -----------------------------------------------

      onClose()
    } catch (err) {
      console.error(
        "Failed to add material:",
        err
      )

      const data = err?.response?.data

      if (typeof data === "string") {
        setError(data)
      } else if (data) {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)
          .map((message) =>
            typeof message === "string"
              ? message
              : String(message)
          )

        setError(
          messages.join(" ") ||
            "Failed to add material."
        )
      } else {
        setError(
          "Failed to add material. Please try again."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-3xl">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <PackagePlus size={20} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Add Material
              </h2>

              <p className="text-xs text-slate-400">
                Add a purchase to this site
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5"
        >

          {/* Error */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* ==================================================
              MATERIAL NAME
          ================================================== */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Material Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              placeholder="Cement"
              disabled={saving}
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            />
          </div>

          {/* ==================================================
              QUANTITY + UNIT
          ================================================== */}

          <div className="grid grid-cols-2 gap-3">

            {/* Quantity */}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="0.01"
                step="0.01"
                inputMode="decimal"
                value={form.quantity}
                onChange={(event) =>
                  updateField(
                    "quantity",
                    event.target.value
                  )
                }
                placeholder="50"
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

            {/* Unit */}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Unit
              </label>

              <input
                type="text"
                value={form.unit}
                onChange={(event) =>
                  updateField(
                    "unit",
                    event.target.value
                  )
                }
                placeholder="bags"
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />
            </div>

          </div>

          {/* ==================================================
              PRICE
          ================================================== */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Price
            </label>

            <div className="relative">

              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={form.price}
                onChange={(event) =>
                  updateField(
                    "price",
                    event.target.value
                  )
                }
                placeholder="420"
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
              />

            </div>
          </div>

          {/* ==================================================
              PURCHASE DATE
          ================================================== */}

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CalendarDays size={15} />
              Purchase Date
            </label>

            <input
              type="date"
              value={form.purchase_date}
              onChange={(event) =>
                updateField(
                  "purchase_date",
                  event.target.value
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            />
          </div>

          {/* ==================================================
              NOTES
          ================================================== */}

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Notes
            </label>

            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value
                )
              }
              placeholder="Optional notes..."
              disabled={saving}
              className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-400 disabled:bg-slate-50"
            />
          </div>

          {/* ==================================================
              BUTTONS
          ================================================== */}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Adding...
                </>
              ) : (
                <>
                  <PackagePlus size={17} />
                  Add Material
                </>
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  )
}

export default AddMaterialModal