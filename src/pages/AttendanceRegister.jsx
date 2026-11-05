import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Loader2, Search,
  Users, HardHat, IndianRupee, RefreshCw, X, Check, AlertCircle,
  Building2, Wallet, CalendarCheck2, Smartphone, Filter,
} from "lucide-react"
import api from "../api/axios"

const currency = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
}).format(Number(value || 0))

const localISODate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const parseISODate = (value) => new Date(`${value}T00:00:00`)
const PAYMENT_PREFIX = "Attendance Register | Paid dates:"
const getErrorMessage = (error) => {
  const data = error?.response?.data
  if (typeof data === "string") return data
  if (data?.detail) return data.detail
  if (data && typeof data === "object") return Object.values(data).flat().filter(Boolean).join(" ") || "Something went wrong."
  return "Unable to connect to the server. Please try again."
}
const workerKey = (worker) => `${worker.group}:${worker.siteId}:${worker.id}`
const paymentUrl = (worker) => worker.group === "labour"
  ? `/labour/sites/${worker.siteId}/labour/${worker.id}/payments/`
  : `/mesthiri/sites/${worker.siteId}/mesthiri/${worker.id}/payments/`

// Safely extracts the day number regardless of whether date is a Date, an API date object, or an ISO string
const weekIndexFor = (dateInput, monthFirstDay) => {
  let dayNum = 1
  if (dateInput && typeof dateInput === "object") {
    if (typeof dateInput.getDate === "function") {
      dayNum = dateInput.getDate()
    } else if (typeof dateInput.day === "number") {
      dayNum = dateInput.day
    } else if (typeof dateInput.date === "string") {
      dayNum = parseISODate(dateInput.date).getDate()
    }
  } else if (typeof dateInput === "string") {
    dayNum = parseISODate(dateInput).getDate()
  } else if (typeof dateInput === "number") {
    dayNum = dateInput
  }
  return Math.floor((dayNum + monthFirstDay - 1) / 7)
}

const weekClass = (index) => index % 2 === 0 ? "bg-indigo-50/75" : "bg-amber-50/75"
const paymentColorClass = (index) => index % 2 === 0 ? "bg-rose-500" : "bg-sky-600"

function StatCard({ label, value, hint, icon: Icon }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
    <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-slate-500 sm:text-xs">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon size={16} /></span></div>
    <p className="mt-2 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{value}</p><p className="mt-1 text-[10px] text-slate-400 sm:text-xs">{hint}</p>
  </div>
}

function RegisterModal({ editor, onClose, onSave, saving }) {
  const [status, setStatus] = useState(editor.cell?.status || (editor.cell?.absence_applicable ? "ABSENT" : "PRESENT"))
  const [wage, setWage] = useState(editor.cell?.earnings || "")
  const [description, setDescription] = useState(editor.date?.work_description || "")
  const [amount, setAmount] = useState("")
  const [paymentDate, setPaymentDate] = useState(localISODate(new Date()))
  const [selectedDates, setSelectedDates] = useState([])
  const [note, setNote] = useState("")

  useEffect(() => {
    setStatus(editor.cell?.status || (editor.cell?.absence_applicable ? "ABSENT" : "PRESENT"))
    setWage(editor.cell?.earnings || "")
    setDescription(editor.date?.work_description || "")
    if (editor.mode === "payment") {
      const eligible = editor.dates.filter((date) => editor.worker.attendance?.[date.date]?.status === "PRESENT" && !editor.paidDates.includes(date.date))
      setSelectedDates(eligible.map((date) => date.date))
      setAmount(eligible.reduce((sum, date) => sum + Number(editor.worker.attendance?.[date.date]?.earnings || 0), 0).toFixed(2))
    }
  }, [editor])

  const isWork = editor.mode === "work"
  const isPayment = editor.mode === "payment"
  const toggleDate = (date) => setSelectedDates((current) => current.includes(date) ? current.filter((item) => item !== date) : [...current, date])
  const selectedTotal = selectedDates.reduce((sum, date) => sum + Number(editor.worker?.attendance?.[date]?.earnings || 0), 0)

  return <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl">
      <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{isWork ? `Site work · ${editor.site.name}` : isPayment ? "Record payment and mark paid days" : `${editor.group} attendance · ${editor.siteName}`}</p>
          <h2 className="mt-1 truncate text-lg font-bold text-slate-900">{isWork ? "Edit daily work" : editor.worker?.name}</h2>
          <p className="mt-1 text-xs text-slate-500">{isWork || !isPayment ? (editor.date?.date ? parseISODate(editor.date.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "") : `${editor.siteName} · ${editor.group === "labour" ? "Labour" : "Mesthiri"}`}</p>
        </div>
        <button type="button" onClick={onClose} className="ml-2 rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={19} /></button>
      </header>
      <div className="space-y-5 p-4 sm:p-5">
        {isWork ? <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Work / project description</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Example: Foundation work, first-floor brickwork..." className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-500 focus:bg-white" /></label>
          : isPayment ? <>
            <div className="rounded-xl bg-slate-50 p-3"><div className="flex items-center justify-between text-sm"><span className="text-slate-500">Selected unpaid days</span><strong>{selectedDates.length} days</strong></div><div className="mt-1 flex items-center justify-between text-sm"><span className="text-slate-500">Daily wage total</span><strong>{currency(selectedTotal)}</strong></div></div>
            <div><div className="mb-2 flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">Select days covered by this payment</p><span className="text-[10px] text-slate-400">Tap to select / unselect</span></div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{editor.dates.filter((date) => editor.worker.attendance?.[date.date]?.status === "PRESENT").map((date) => {
                const paid = editor.paidDates.includes(date.date); const checked = selectedDates.includes(date.date)
                return <button key={date.date} type="button" disabled={paid} onClick={() => toggleDate(date.date)} className={`rounded-xl border px-3 py-2 text-left text-xs transition disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "border-slate-900 bg-slate-900 text-white" : paid ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 bg-white text-slate-600"}`}>
                  <span className="flex items-center justify-between gap-1"><span>{parseISODate(date.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>{paid ? <span className="text-[10px]">Paid</span> : checked ? <Check size={14} /> : null}</span><span className="mt-1 block font-bold">{currency(editor.worker.attendance[date.date].earnings)}</span>
                </button>
              })}</div>
              {!editor.dates.some((date) => editor.worker.attendance?.[date.date]?.status === "PRESENT") && <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">No present days with wages are available in this month.</p>}
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Payment amount (₹)</span><input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-semibold outline-none focus:border-slate-500 focus:bg-white" placeholder="Enter amount" /></label><label><span className="mb-1.5 block text-sm font-semibold text-slate-700">Payment date</span><input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-500 focus:bg-white" /></label></div>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold text-slate-700">Note (optional)</span><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Cash / UPI / payment note" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-slate-500 focus:bg-white" /></label>
            <p className="rounded-xl bg-blue-50 px-3 py-2.5 text-xs leading-5 text-blue-800">The selected days will be marked with a coloured strike. The first payment uses rose, the next uses blue, then the colours alternate. Already-paid days cannot be selected again here.</p>
          </> : <>
            <div><p className="mb-2 text-sm font-semibold text-slate-700">Attendance status</p><div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setStatus("PRESENT")} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold ${status === "PRESENT" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600"}`}><Check size={16} /> Present (X)</button>
              <button type="button" onClick={() => setStatus("ABSENT")} disabled={!editor.cell?.absence_applicable && editor.cell?.status !== "ABSENT"} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold disabled:opacity-35 ${status === "ABSENT" ? "border-red-600 bg-red-600 text-white" : "border-slate-200 text-slate-600"}`}><X size={16} /> Absent (A)</button>
            </div></div>
            {status === "PRESENT" && <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">Daily earnings (₹)</span><input type="number" min="0" step="0.01" value={wage} onChange={(e) => setWage(e.target.value)} placeholder="Enter daily wage" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-base font-semibold outline-none focus:border-slate-500 focus:bg-white" /></label>}
            <p className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">Attendance uses your existing daily work records. A worker can be marked absent only on a date covered by their site assignment.</p>
          </>}
      </div>
      <footer className="sticky bottom-0 flex gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 sm:px-5">
        <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">Cancel</button>
        <button type="button" onClick={() => onSave(isWork ? { workDescription: description } : isPayment ? { amount, paymentDate, selectedDates, note } : { status, wage })} disabled={saving || (isPayment ? (!selectedDates.length || !paymentDate || !amount || Number(amount) <= 0) : !isWork && status === "PRESENT" && (wage === "" || Number(wage) < 0))} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}{isPayment ? "Save payment" : "Save changes"}</button>
      </footer>
    </section>
  </div>
}

function AttendanceRegister() {
  const navigate = useNavigate()
  const now = new Date()
  const [monthDate, setMonthDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [sites, setSites] = useState([])
  const [siteRegisters, setSiteRegisters] = useState([])
  const [group, setGroup] = useState("labour")
  const [search, setSearch] = useState("")
  const [loadingSites, setLoadingSites] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [editor, setEditor] = useState(null)
  const [paymentMarks, setPaymentMarks] = useState({})
  const [paymentLoading, setPaymentLoading] = useState(false)

  const month = monthDate.getMonth() + 1
  const year = monthDate.getFullYear()
  const monthLabel = monthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingSites(true)
        const response = await api.get("/sites/")
        const rows = Array.isArray(response.data) ? response.data : (response.data.results || [])
        if (active) setSites(rows)
      } catch (err) { if (active) setError(getErrorMessage(err)) }
      finally { if (active) setLoadingSites(false) }
    })()
    return () => { active = false }
  }, [])

  const loadRegister = useCallback(async () => {
    if (!sites.length) { setSiteRegisters([]); return }
    try {
      setLoading(true); setError("")
      const results = await Promise.all(sites.map(async (site) => {
        const response = await api.get(`/labour/sites/${site.id}/attendance-register/`, { params: { month, year } })
        return { ...response.data, site }
      }))
      setSiteRegisters(results)
    } catch (err) { setError(getErrorMessage(err)); setSiteRegisters([]) }
    finally { setLoading(false) }
  }, [sites, month, year])
  useEffect(() => { loadRegister() }, [loadRegister])

  const dates = siteRegisters[0]?.dates || []
  const workers = useMemo(() => siteRegisters.flatMap((register) => (register[group]?.workers || []).map((worker) => ({
    ...worker, group, siteId: register.site.id, siteName: register.site.name, siteCode: register.site.code || "", site: register.site,
  }))), [siteRegisters, group])
  const activeWorkers = useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = !query ? workers : workers.filter((worker) => `${worker.name} ${worker.siteName} ${worker.siteCode}`.toLowerCase().includes(query))
    return [...rows].sort((a, b) => a.siteName.localeCompare(b.siteName) || a.name.localeCompare(b.name))
  }, [workers, search])
  const summary = useMemo(() => workers.reduce((result, worker) => {
    const s = worker
    result.workers += 1
    Object.values(s.attendance || {}).forEach((cell) => {
      if (cell.status === "PRESENT") { result.present += 1; result.earnings += Number(cell.earnings || 0) }
      if (cell.status === "ABSENT") result.absent += 1
    })
    return result
  }, { workers: 0, present: 0, absent: 0, earnings: 0 }), [workers])

  const firstDay = new Date(year, month - 1, 1).getDay()
  const weekNumber = (date) => weekIndexFor(date, firstDay)

  const refreshPaymentMarks = useCallback(async (rows = workers) => {
    if (!rows.length) { setPaymentMarks({}); return }
    setPaymentLoading(true)
    const pairs = await Promise.all(rows.map(async (worker) => {
      try {
        const response = await api.get(paymentUrl(worker))
        const payments = Array.isArray(response.data) ? response.data : []
        const ordered = [...payments].sort((a, b) => String(a.payment_date).localeCompare(String(b.payment_date)) || Number(a.id) - Number(b.id))
        const marks = {}
        ordered.forEach((payment, index) => {
          const noteText = String(payment.notes || "")
          const match = noteText.match(/^Attendance Register \| Paid dates: ([0-9,\s-]+) \| Mark: (\d+)/)
          if (!match) return
          const paidDates = match[1].split(",").map((date) => date.trim()).filter(Boolean)
          const colorIndex = Number(match[2] ?? (index + 1)) - 1
          paidDates.forEach((date) => { marks[date] = { colorIndex, paymentId: payment.id, amount: payment.amount } })
        })
        return [workerKey(worker), marks]
      } catch { return [workerKey(worker), {}] }
    }))
    setPaymentMarks(Object.fromEntries(pairs))
    setPaymentLoading(false)
  }, [workers])
  useEffect(() => { if (siteRegisters.length) refreshPaymentMarks(workers) }, [siteRegisters, group, refreshPaymentMarks])

  const changeMonth = (offset) => setMonthDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  const getRegister = (siteId) => siteRegisters.find((register) => String(register.site.id) === String(siteId))

  const buildDailyPayload = (siteId, dateKey, override = {}) => {
    const register = getRegister(siteId)
    const labour = (register?.labour?.workers || []).flatMap((worker) => {
      const cell = worker.attendance?.[dateKey]; let present = cell?.status === "PRESENT"; let wage = cell?.earnings || "0"
      if (override.kind === "labour" && Number(override.workerId) === Number(worker.id)) { present = override.status === "PRESENT"; wage = override.wage }
      return present ? [{ labour: worker.id, wage: Number(wage || 0) }] : []
    })
    const mesthiri = (register?.mesthiri?.workers || []).flatMap((worker) => {
      const cell = worker.attendance?.[dateKey]; let present = cell?.status === "PRESENT"; let wage = cell?.earnings || "0"
      if (override.kind === "mesthiri" && Number(override.workerId) === Number(worker.id)) { present = override.status === "PRESENT"; wage = override.wage }
      return present ? [{ mesthiri: worker.id, wage: Number(wage || 0) }] : []
    })
    const day = register?.dates?.find((item) => item.date === dateKey)
    return { date: dateKey, work_description: override.workDescription ?? day?.work_description ?? "", labour, mesthiri }
  }

  const openCellEditor = (worker, date) => setEditor({ mode: "cell", worker, date, cell: worker.attendance?.[date.date] || {}, group: worker.group, siteName: worker.siteName, site: worker.site })
  const openWorkEditor = (register, date) => setEditor({ mode: "work", date, site: register.site, siteName: register.site.name, siteId: register.site.id, cell: {} })
  const openPaymentEditor = (worker) => {
    const marks = paymentMarks[workerKey(worker)] || {}
    setEditor({ mode: "payment", worker, site: worker.site, siteName: worker.siteName, dates, paidDates: Object.keys(marks), cell: {} })
  }

  const saveEditor = async (values) => {
    if (!editor) return
    try {
      setSaving(true)
      if (editor.mode === "payment") {
        const currentMarks = paymentMarks[workerKey(editor.worker)] || {}
        const usedColors = Object.values(currentMarks).map((mark) => Number(mark.colorIndex))
        const colorIndex = usedColors.length ? Math.max(...usedColors) + 1 : 0
        const notes = `${PAYMENT_PREFIX} ${values.selectedDates.join(", ")} | Mark: ${colorIndex + 1}${values.note ? ` | Note: ${values.note}` : ""}`
        await api.post(paymentUrl(editor.worker), { payment_date: values.paymentDate, amount: values.amount, notes })
        setEditor(null)
        await refreshPaymentMarks(workers)
      } else if (editor.mode === "work") {
        await api.post(`/labour/sites/${editor.siteId}/daily-work/`, buildDailyPayload(editor.siteId, editor.date.date, { workDescription: values.workDescription }))
        setEditor(null); await loadRegister()
      } else {
        const worker = editor.worker
        const override = { kind: worker.group, workerId: worker.id, status: values.status, wage: values.wage }
        await api.post(`/labour/sites/${worker.siteId}/daily-work/`, buildDailyPayload(worker.siteId, editor.date.date, override))
        setEditor(null); await loadRegister()
      }
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setSaving(false) }
  }

  const siteCount = siteRegisters.length
  const renderDayHeader = (date) => {
    const week = weekNumber(date)
    const dateSites = siteRegisters.map((register) => ({ register, detail: register.dates?.find((d) => d.date === date.date) })).filter((item) => item.detail?.work_description)
    return <div className="min-w-[72px] text-center sm:min-w-[96px]">
      <div className="flex items-baseline justify-center gap-1"><span className={`text-lg font-black ${date.is_today ? "text-blue-700" : "text-slate-900"}`}>{date.day}</span><span className="text-[9px] font-semibold uppercase text-slate-400">{date.day_name.slice(0, 3)}</span></div>
      <div className="mt-1 flex flex-col gap-1">{dateSites.length ? dateSites.map(({ register, detail }) => <button key={register.site.id} type="button" onClick={() => openWorkEditor(register, detail)} title={`${register.site.name}: ${detail.work_description}`} className="mx-auto block w-full truncate rounded-md border border-white/80 bg-white/80 px-1 py-1 text-left text-[9px] font-semibold text-slate-600 hover:border-slate-300">{register.site.code || register.site.name}: {detail.work_description}</button>) : <span className="rounded-md border border-dashed border-slate-200 bg-white/70 px-1 py-1 text-[9px] text-slate-400">No site work</span>}</div>
      <span className="mt-1 inline-block text-[8px] font-bold uppercase tracking-wide text-slate-400">Week {week + 1}</span>
    </div>
  }

  const renderAttendanceCell = (worker, date, compact = false) => {
    const cell = worker.attendance?.[date.date] || {}
    const present = cell.status === "PRESENT"; const absent = cell.status === "ABSENT"
    const paid = paymentMarks[workerKey(worker)]?.[date.date]
    const week = weekNumber(date)
    return <button key={date.date} type="button" onClick={() => openCellEditor(worker, date)} title={`${worker.name} · ${date.date}${paid ? " · Paid" : ""}`} className={`relative flex ${compact ? "min-h-[58px] w-[66px]" : "min-h-[68px] w-full"} flex-col items-center justify-center gap-1 overflow-hidden rounded-lg border border-white/70 px-1 py-2 transition hover:z-10 hover:ring-2 hover:ring-slate-300 ${absent ? "bg-red-50" : present ? weekClass(week) : `${weekClass(week)} opacity-80`}`}>
      {present ? <span className="text-xl font-black leading-none text-slate-900">X</span> : absent ? <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500 text-base font-black leading-none text-black">A</span> : <span className="text-lg font-medium text-slate-400">—</span>}
      {present && <span className="max-w-full truncate text-[9px] font-semibold text-slate-600">{currency(cell.earnings)}</span>}
      {paid && <><span className={`pointer-events-none absolute left-[7%] top-1/2 z-[2] h-[3px] w-[86%] -rotate-[28deg] rounded-full ${paymentColorClass(paid.colorIndex)}`} /><span className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${paymentColorClass(paid.colorIndex)}`} /></>}
    </button>
  }

  return <div className="min-h-screen bg-[#f6f7f9] px-2.5 py-4 text-slate-900 sm:px-5 sm:py-6 lg:px-8">
    <div className="mx-auto max-w-[1900px]">
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
        <div><div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-slate-400 sm:text-xs"><ClipboardList size={14} /> Workforce management</div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Attendance register</h1><p className="mt-1 text-xs text-slate-500 sm:text-sm">One combined monthly register for every site, labour and mesthiri.</p></div>
        <div className="flex gap-2"><div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"><Building2 size={15} /><span>All {siteCount} sites</span></div><button type="button" onClick={() => { loadRegister(); refreshPaymentMarks(workers) }} disabled={loading || loadingSites} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">Refresh</span></button></div>
      </div>

      <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-5 sm:flex sm:items-center sm:justify-between sm:p-4">
        <div className="flex items-center gap-2.5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white"><CalendarDays size={19} /></div><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Selected month</p><h2 className="text-lg font-black sm:text-xl">{monthLabel}</h2></div></div>
        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-0 sm:justify-end"><button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="rounded-xl border border-slate-200 p-2.5 text-slate-600"><ChevronLeft size={19} /></button><button type="button" onClick={() => setMonthDate(new Date(now.getFullYear(), now.getMonth(), 1))} disabled={isCurrentMonth} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 disabled:opacity-40">Current month</button><button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="rounded-xl border border-slate-200 p-2.5 text-slate-600"><ChevronRight size={19} /></button></div>
      </section>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500 sm:mb-4 sm:text-xs"><span className="mr-1">Week colours:</span><span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1"><i className="h-2.5 w-2.5 rounded-sm bg-indigo-200" /> Sunday–Saturday</span><span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1"><i className="h-2.5 w-2.5 rounded-sm bg-amber-200" /> Next week</span><span className="ml-auto inline-flex items-center gap-1.5"><i className="h-[3px] w-4 rounded bg-rose-500" /> Payment 1 <i className="ml-1 h-[3px] w-4 rounded bg-sky-600" /> Payment 2</span></div>
      {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-700 sm:text-sm"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</div>}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:mb-5 sm:grid-cols-4 sm:gap-3"><StatCard label="Workers" value={summary.workers} hint="Across all active sites" icon={Users} /><StatCard label="Present days" value={summary.present} hint="Recorded work days" icon={Check} /><StatCard label="Absent days" value={summary.absent} hint="Assigned days without entry" icon={AlertCircle} /><StatCard label="Total earnings" value={currency(summary.earnings)} hint="Wages this month" icon={IndianRupee} /></div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3.5">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"><button type="button" onClick={() => setGroup("labour")} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold sm:flex-none sm:text-sm ${group === "labour" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><Users size={15} /> Labour</button><button type="button" onClick={() => setGroup("mesthiri")} className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold sm:flex-none sm:text-sm ${group === "mesthiri" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}><HardHat size={15} /> Mesthiri</button></div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 focus-within:border-slate-400"><Search size={15} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search worker or site..." className="w-full min-w-0 bg-transparent text-xs outline-none sm:w-64 sm:text-sm" /></label>
        </div>

        {loading || loadingSites ? <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-slate-500"><Loader2 size={20} className="animate-spin" /> Loading all sites...</div> : !sites.length ? <div className="px-6 py-16 text-center"><Building2 className="mx-auto text-slate-300" size={30} /><p className="mt-3 font-semibold text-slate-700">Create a site to view attendance</p><button type="button" onClick={() => navigate("/dashboard")} className="mt-3 text-sm font-bold text-blue-700">Go to dashboard</button></div> : !activeWorkers.length ? <div className="px-6 py-14 text-center"><Users className="mx-auto text-slate-300" size={30} /><p className="mt-3 text-sm font-semibold text-slate-700">{search ? "No workers match your search." : "No workers found for this month."}</p><p className="mt-1 text-xs text-slate-400">Workers appear when they have an assignment or daily entry at a site.</p></div> : <>
          {/* Desktop/tablet register */}
          <div className="hidden overflow-auto md:block">
            <table className="w-full border-separate border-spacing-0" style={{ minWidth: `${270 + dates.length * 104}px` }}>
              <thead><tr><th className="sticky left-0 top-0 z-30 w-[270px] min-w-[270px] border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-left"><span className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500">Worker / Site</span></th>{dates.map((date) => <th key={date.date} className={`sticky top-0 z-20 w-[104px] min-w-[104px] border-b border-r border-slate-200 px-1.5 py-2 align-top ${weekClass(weekNumber(date))} ${date.is_today ? "ring-inset ring-2 ring-blue-300" : ""}`}>{renderDayHeader(date)}</th>)}</tr></thead>
              <tbody>{activeWorkers.map((worker) => <tr key={workerKey(worker)} className="group"><th className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-3 py-2.5 text-left group-hover:bg-slate-50"><div className="flex items-center gap-2.5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{worker.name.trim().charAt(0).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{worker.name}</span><span className="block truncate text-[10px] font-semibold text-indigo-600">{worker.siteCode ? `${worker.siteCode} · ` : ""}{worker.siteName}</span></span><button type="button" onClick={() => openPaymentEditor(worker)} title="Record payment and mark paid days" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:border-slate-400 hover:bg-slate-50"><Wallet size={15} /></button></div></th>{dates.map((date) => <td key={date.date} className={`border-b border-r border-slate-100 p-1 ${weekClass(weekNumber(date))}`}>{renderAttendanceCell(worker, date)}</td>)}</tr>)}</tbody>
            </table>
          </div>

          {/* Mobile-first worker cards */}
          <div className="space-y-3 p-2.5 md:hidden">
            {activeWorkers.map((worker) => <article key={workerKey(worker)} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2.5 px-3 py-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{worker.name.trim().charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{worker.name}</p><p className="truncate text-[10px] font-semibold text-indigo-600">{worker.siteCode ? `${worker.siteCode} · ` : ""}{worker.siteName}</p></div><button type="button" onClick={() => openPaymentEditor(worker)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-bold text-white"><Wallet size={13} /> Pay</button></div>
              <div className="overflow-x-auto border-t border-slate-100"><div className="flex min-w-max gap-1 p-2">{dates.map((date) => <div key={date.date} className={`w-[68px] shrink-0 rounded-lg p-1 ${weekClass(weekNumber(date))} ${date.is_today ? "ring-2 ring-inset ring-blue-300" : ""}`}><div className="mb-1 text-center"><span className="text-sm font-black">{date.day}</span><span className="ml-1 text-[9px] font-semibold uppercase text-slate-500">{date.day_name.slice(0, 3)}</span></div>{(() => { const register = getRegister(worker.siteId); const siteDate = register?.dates?.find((item) => item.date === date.date); return <button type="button" onClick={() => siteDate && openWorkEditor(register, siteDate)} className="mb-1 block min-h-[30px] w-full truncate rounded-md border border-white/80 bg-white/80 px-1 py-1 text-left text-[8px] font-medium leading-3 text-slate-500" title={siteDate?.work_description || "Add site work"}>{siteDate?.work_description || "+ Work"}</button> })()}{renderAttendanceCell(worker, date, true)}</div>)}</div></div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2"><span className="text-[10px] text-slate-500">Monthly wage: <strong className="text-slate-800">{currency(Object.values(worker.attendance || {}).reduce((sum, cell) => sum + (cell.status === "PRESENT" ? Number(cell.earnings || 0) : 0), 0))}</strong></span><span className="text-[9px] text-slate-400">Swipe dates sideways →</span></div>
            </article>)}
          </div>
        </>}
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-3 py-3 sm:px-4"><div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold text-slate-500 sm:gap-4 sm:text-xs"><span className="inline-flex items-center gap-1"><b className="text-base text-slate-900">X</b> Present</span><span className="inline-flex items-center gap-1"><b className="rounded bg-red-500 px-1 text-black">A</b> Absent</span><span>— No record</span><span className="inline-flex items-center gap-1"><i className="h-[3px] w-4 rounded bg-rose-500" /> Paid day</span></div><p className="text-[9px] text-slate-400">{paymentLoading ? "Checking payment marks..." : "Tap a date to edit attendance · Pay to mark covered days"}</p></footer>
      </section>
    </div>
    {editor && <RegisterModal editor={editor} onClose={() => !saving && setEditor(null)} onSave={saveEditor} saving={saving} />}
  </div>
}

export default AttendanceRegister