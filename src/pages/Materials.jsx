import { useEffect, useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import api from "../api/axios"

const emptyForm = {
  name: "",
  quantity: "",
  unit: "",
  price: "",
  purchase_date: new Date().toISOString().slice(0, 10),
  notes: "",
}

function Materials() {
  const navigate = useNavigate()
  const { siteId } = useParams()
  const [materials, setMaterials] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const loadMaterials = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await api.get(`/materials/sites/${siteId}/`)
      setMaterials(response.data.results || response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to load materials.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMaterials()
  }, [siteId])

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      const response = await api.post(`/materials/sites/${siteId}/`, form)
      setMaterials((current) => [...current, response.data])
      setForm({ ...emptyForm, purchase_date: new Date().toISOString().slice(0, 10) })
      setOpen(false)
    } catch (requestError) {
      const data = requestError.response?.data
      setError(data ? Object.values(data).flat().join(" ") : "Unable to save material.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm("Delete this material purchase?")) return
    try {
      await api.delete(`/materials/${id}/`)
      setMaterials((current) => current.filter((material) => material.id !== id))
    } catch {
      setError("Unable to delete material.")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate(`/sites/${siteId}/labour`)} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft size={18} /> Back to site
        </button>
        <div className="flex items-start justify-between gap-4">
          <div><h1 className="text-2xl font-bold text-slate-900">Materials</h1><p className="mt-1 text-sm text-slate-500">Record paid material purchases for this site.</p></div>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><Plus size={18} /> Add material</button>
        </div>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {open && <form onSubmit={submit} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2">
          {[["name", "Material name", "text"], ["quantity", "Quantity", "number"], ["unit", "Unit", "text"], ["price", "Total paid price", "number"], ["purchase_date", "Purchase date", "date"]].map(([name, label, type]) => <label key={name} className="text-sm font-medium text-slate-700">{label}<input required min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} type={type} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>)}
          <label className="sm:col-span-2 text-sm font-medium text-slate-700">Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label>
          <div className="sm:col-span-2 flex gap-3"><button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">{saving ? "Saving..." : "Save purchase"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold">Cancel</button></div>
        </form>}
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading materials...</p> : materials.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No material purchases recorded.</p> : <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500"><tr><th className="p-4">Date</th><th className="p-4">Material</th><th className="p-4">Quantity</th><th className="p-4 text-right">Paid</th><th className="p-4" /></tr></thead><tbody>{materials.map((material) => <tr key={material.id} className="border-t border-slate-100"><td className="p-4">{material.purchase_date}</td><td className="p-4 font-medium">{material.name}</td><td className="p-4">{material.quantity} {material.unit}</td><td className="p-4 text-right">₹{Number(material.price).toFixed(2)}</td><td className="p-4 text-right"><button type="button" onClick={() => remove(material.id)} className="text-red-600"><Trash2 size={18} /></button></td></tr>)}</tbody></table>}
        </section>
      </div>
    </main>
  )
}

export default Materials
