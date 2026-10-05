import { ArrowRight, BarChart3, Building2, HardHat, ReceiptIndianRupee, ShieldCheck, UsersRound } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const features = [
  { icon: Building2, title: "Site management", text: "Keep every project, location, and cost centre organised in one workspace." },
  { icon: UsersRound, title: "Workforce tracking", text: "Record labour and mesthiri work with a clear view of what is due." },
  { icon: ReceiptIndianRupee, title: "Cost control", text: "Follow materials, payments, expenses, and outstanding balances as they change." },
]

function Home() {


  const {
    isAuthenticated,
  } = useAuth()
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-black tracking-tight" aria-label="BuildLedger home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-black text-white"><img src="/Blogo.png" alt="logo"></img></span>
          BuildLedger
        </Link>
        <nav className="flex items-center gap-2" aria-label="Main navigation">
          {isAuthenticated ? <><Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 border border-black">Dashboard</Link></>:<><Link to="/register" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white border border-black hover:bg-slate-700">sign up</Link>
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 border border-black">Sign in</Link></>}
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pb-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700"><ShieldCheck size={14} /> Built for construction teams</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">Know every rupee, site, and worker at a glance.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">BuildLedger brings your construction sites, labour, materials, payments, and project expenses into one simple, reliable workspace.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {isAuthenticated ? <><Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 border border-black">Dashboard</Link></>:<><Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-sm hover:bg-blue-700">Create your free account <ArrowRight size={18} /></Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-100">Sign in</Link></>}
            </div>
          </div>
          <div className="rounded-3xl bg-slate-900 p-5 shadow-2xl sm:p-7">
            <div className="flex items-center justify-between text-white"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Project overview</p><p className="mt-1 text-xl font-black">This month</p></div><BarChart3 className="text-blue-300" size={28} /></div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Metric label="Active sites" value="12" />
              <Metric label="Paid this month" value="₹4.8L" />
              <Metric label="Materials" value="₹2.1L" />
              <Metric label="Outstanding" value="₹86K" />
            </div>
            <div className="mt-5 rounded-2xl bg-white/10 p-4"><div className="flex justify-between text-sm font-bold text-white"><span>Payment progress</span><span>76%</span></div><div className="mt-3 h-2 rounded-full bg-white/20"><div className="h-2 w-3/4 rounded-full bg-blue-400" /></div></div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6"><div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-wider text-blue-600">One workspace</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Less paperwork. Better project visibility.</h2></div><div className="mt-10 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 p-5 sm:p-6"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800"><Icon size={20} /></span><h3 className="mt-4 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6"><span>© {new Date().getFullYear()} BuildLedger</span><span>Construction management made clear.</span></footer>
    </div>
  )
}

function Metric({ label, value }) { return <div className="rounded-2xl bg-white p-4"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-900">{value}</p></div> }

export default Home
