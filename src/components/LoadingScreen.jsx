function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <p className="text-sm font-medium text-slate-500">
          Loading BuildLedger...
        </p>
      </div>
    </div>
  )
}

export default LoadingScreen