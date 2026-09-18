import { useEffect, useState } from "react"
import { Trash2, PackagePlus } from "lucide-react"
import { useParams, useNavigate } from "react-router-dom"

import api from "../api/axios"

function Materials() {
  const { siteId } = useParams()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
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

  function formatDate(dateString) {
  if (!dateString) return ""

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
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

  const navigate = useNavigate()

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">

      <div className="mx-auto max-w-5xl">  
        <button 
          type="button"
          onClick={()=>navigate(`/sites/${siteId}`)}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
          Back
        </button>

        <div className="flex items-start justify-between gap-4">
          
          <div>

            <h1 className="text-2xl font-bold text-slate-900">
              Materials
            </h1>
            
            <p className="mt-1 text-sm text-slate-500">
              Record paid material purchases for this site.
            </p>

          </div>

        </div>

          {error && 
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </p>}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {loading ? 
            <p className="p-8 text-center text-sm text-slate-500">Loading materials...</p> : 
              materials.length === 0 ? 
              <p className="p-8 text-center text-sm text-slate-500">No material purchases recorded.</p> : 
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-4">Date</th>
                      <th className="p-4">Material</th>
                      <th className="p-4">Quantity</th>
                      <th className="p-4 text-right">Paid</th>
                      <th className="p-4" />
                    </tr>
                  </thead>

                  <tbody>{materials.map((material) => 
                    <tr key={material.id} className="border-t border-slate-100">
                      <td className="p-4">{formatDate(material.purchase_date)}</td>
                      <td className="p-4 font-medium">{material.name}</td>
                      <td className="p-4">{material.quantity} {material.unit}</td>
                      <td className="p-4 text-right">₹{Number(material.price).toFixed(2)}</td>
                      <td className="p-4 text-right"><button type="button" onClick={() => remove(material.id)} className="text-red-600"><Trash2 size={18} /></button></td>
                    </tr>)}
                  </tbody>
              </table>}

        </section>
      </div>
    </main>
  )
}

export default Materials
