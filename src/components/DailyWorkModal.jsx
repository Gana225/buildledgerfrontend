import { useEffect, useMemo, useState } from "react"
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  Users,
  X,
} from "lucide-react"

import api from "../api/axios"
import DailyWorkPersonCard from "./DailyWorkPersonCard"

function DailyWorkModal({
  siteId,
  siteName,
  onClose,
  onSaved,
}) {
  const getToday = () => {
    const now = new Date()

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const [selectedDate, setSelectedDate] = useState(getToday())

  const [availableLabour, setAvailableLabour] = useState([])
  const [todayLabour, setTodayLabour] = useState([])

  const [availableMesthiri, setAvailableMesthiri] = useState([])
  const [todayMesthiri, setTodayMesthiri] = useState([])

  const [labourDefaultWage, setLabourDefaultWage] = useState("")
  const [mesthiriDefaultWage, setMesthiriDefaultWage] =
    useState("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [dragOverType, setDragOverType] = useState("")

  const formatDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
  }

  const loadDailyWork = async () => {
    try {
      setLoading(true)
      setError("")

      const response = await api.get(
        `/labour/sites/${siteId}/daily-work/`,
        {
          params: {
            date: selectedDate,
          },
        }
      )

      const data = response.data

      setAvailableLabour(
        (data.available_labour || []).map((person) => ({
          ...person,
        }))
      )

      setTodayLabour(
        (data.today_labour || []).map((person) => ({
          ...person,
          id: person.labour_id,
        }))
      )

      setAvailableMesthiri(
        (data.available_mesthiri || []).map((person) => ({
          ...person,
        }))
      )

      setTodayMesthiri(
        (data.today_mesthiri || []).map((person) => ({
          ...person,
          id: person.mesthiri_id,
        }))
      )

      // Use previous day's/common wage as UI default only.
      const firstLabour =
        data.today_labour?.[0]?.wage

      const firstMesthiri =
        data.today_mesthiri?.[0]?.wage

      if (firstLabour && !labourDefaultWage) {
        setLabourDefaultWage(firstLabour)
      }

      if (firstMesthiri && !mesthiriDefaultWage) {
        setMesthiriDefaultWage(firstMesthiri)
      }
    } catch (err) {
      console.error(
        "Daily work loading failed:",
        err
      )

      setError(
        err.response?.data?.detail ||
          "Unable to load daily work."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDailyWork()
  }, [siteId, selectedDate])

  const totalLabour = useMemo(() => {
    return todayLabour.reduce(
      (sum, person) =>
        sum + Number(person.wage || 0),
      0
    )
  }, [todayLabour])

  const paidLabour = useMemo(() => {
    return todayLabour.reduce(
      (sum, person) =>
        sum + Number(person.paid_amount || 0),
      0
    )
  }, [todayLabour])

  const totalMesthiri = useMemo(() => {
    return todayMesthiri.reduce(
      (sum, person) =>
        sum + Number(person.wage || 0),
      0
    )
  }, [todayMesthiri])

  const paidMesthiri = useMemo(() => {
    return todayMesthiri.reduce(
      (sum, person) =>
        sum + Number(person.paid_amount || 0),
      0
    )
  }, [todayMesthiri])

  const total = totalLabour + totalMesthiri
  const paid = paidLabour + paidMesthiri
  const remaining = total - paid

  const addLabour = (person) => {
    const wage =
      labourDefaultWage ||
      person.wage ||
      ""

    setTodayLabour((current) => [
      ...current,
      {
        id: person.id,
        labour_id: person.id,
        name: person.name,
        wage,
        paid_amount: "0",
      },
    ])

    setAvailableLabour((current) =>
      current.filter(
        (item) => item.id !== person.id
      )
    )
  }

  const addMesthiri = (person) => {
    const wage =
      mesthiriDefaultWage ||
      person.wage ||
      ""

    setTodayMesthiri((current) => [
      ...current,
      {
        id: person.id,
        mesthiri_id: person.id,
        name: person.name,
        wage,
        paid_amount: "0",
      },
    ])

    setAvailableMesthiri((current) =>
      current.filter(
        (item) => item.id !== person.id
      )
    )
  }

  const removeLabour = (person) => {
    setTodayLabour((current) =>
      current.filter(
        (item) => item.id !== person.id
      )
    )

    setAvailableLabour((current) => [
      ...current,
      {
        id: person.id,
        name: person.name,
      },
    ])
  }

  const removeMesthiri = (person) => {
    setTodayMesthiri((current) =>
      current.filter(
        (item) => item.id !== person.id
      )
    )

    setAvailableMesthiri((current) => [
      ...current,
      {
        id: person.id,
        name: person.name,
      },
    ])
  }

  const handleDrop = (event, targetType) => {
    event.preventDefault()

    setDragOverType("")

    try {
      const data = JSON.parse(
        event.dataTransfer.getData(
          "application/json"
        )
      )

      if (data.type !== targetType) {
        return
      }

      if (targetType === "labour") {
        const person = availableLabour.find(
          (item) => item.id === data.id
        )

        if (person) {
          addLabour(person)
        }
      }

      if (targetType === "mesthiri") {
        const person = availableMesthiri.find(
          (item) => item.id === data.id
        )

        if (person) {
          addMesthiri(person)
        }
      }
    } catch {
      // Ignore invalid drag payloads.
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError("")

      const labour = todayLabour.map(
        (person) => ({
          labour: person.labour_id,
          wage: Number(person.wage || 0),
          paid_amount: Number(
            person.paid_amount || 0
          ),
        })
      )

      const mesthiri = todayMesthiri.map(
        (person) => ({
          mesthiri: person.mesthiri_id,
          wage: Number(person.wage || 0),
          paid_amount: Number(
            person.paid_amount || 0
          ),
        })
      )

      await api.post(
        `/labour/sites/${siteId}/daily-work/`,
        {
          date: selectedDate,
          labour,
          mesthiri,
        }
      )

      await loadDailyWork()

      if (onSaved) {
        onSaved()
      }
    } catch (err) {
      console.error(
        "Saving daily work failed:",
        err
      )

      const data = err.response?.data

      if (typeof data === "string") {
        setError(data)
      } else if (data) {
        const messages = Object.values(data)
          .flat()
          .filter(Boolean)

        setError(
          messages.join(" ") ||
            "Unable to save daily work."
        )
      } else {
        setError(
          "Unable to save daily work."
        )
      }
    } finally {
      setSaving(false)
    }
  }

  const changeDate = (days) => {
    const date = new Date(
      `${selectedDate}T00:00:00`
    )

    date.setDate(
      date.getDate() + days
    )

    const year = date.getFullYear()
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0")
    const day = String(
      date.getDate()
    ).padStart(2, "0")

    setSelectedDate(
      `${year}-${month}-${day}`
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex max-h-[96vh] w-full flex-col overflow-hidden rounded-t-3xl bg-slate-50 shadow-2xl sm:max-w-6xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Daily Work
            </p>

            <h2 className="mt-1 truncate text-xl font-bold text-slate-900 sm:text-2xl">
              {siteName}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={22} />
          </button>
        </div>

        {/* Date */}
        <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarDays
                size={19}
                className="text-slate-500"
              />

              <span className="text-sm font-semibold text-slate-700">
                Work date
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeDate(-1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <ChevronLeft size={17} />
              </button>

              <input
                type="date"
                value={selectedDate}
                onChange={(event) =>
                  setSelectedDate(
                    event.target.value
                  )
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-slate-400"
              />

              <button
                type="button"
                onClick={() => changeDate(1)}
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <ChevronRight size={17} />
              </button>
            </div>

            <p className="w-full text-xs text-slate-400 sm:w-auto">
              {formatDate(selectedDate)}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="text-center">
                <Loader2
                  className="mx-auto animate-spin text-slate-500"
                  size={30}
                />
                <p className="mt-3 text-sm text-slate-500">
                  Loading daily work...
                </p>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* Defaults */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Default Labour Wage
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={labourDefaultWage}
                      onChange={(event) =>
                        setLabourDefaultWage(
                          event.target.value
                        )
                      }
                      placeholder="700"
                      className="w-full bg-transparent text-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Applied when a labourer is added.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Default Mesthiri Wage
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={mesthiriDefaultWage}
                      onChange={(event) =>
                        setMesthiriDefaultWage(
                          event.target.value
                        )
                      }
                      placeholder="950"
                      className="w-full bg-transparent text-2xl font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Applied when a mesthiri is added.
                  </p>
                </div>
              </div>

              {/* Labour */}
              <section className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Labour
                    </h3>

                    <p className="text-xs text-slate-400">
                      Drag available workers into today's work.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Users size={14} />
                    {todayLabour.length} selected
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Available */}
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <GripVertical
                        size={16}
                        className="text-slate-400"
                      />
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Available
                      </span>
                    </div>

                    <div className="space-y-2">
                      {availableLabour.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                          <p className="text-sm font-medium text-slate-500">
                            No available labour
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Workers assigned to this site appear here.
                          </p>
                        </div>
                      ) : (
                        availableLabour.map(
                          (person) => (
                            <div
                              key={person.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData(
                                  "application/json",
                                  JSON.stringify({
                                    type: "labour",
                                    id: person.id,
                                  })
                                )
                              }}
                              className="flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                            >
                              <GripVertical
                                size={18}
                                className="text-slate-300"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {person.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  Drag to today's work
                                </p>
                              </div>

                              {/* Mobile add */}
                              <button
                                type="button"
                                onClick={() =>
                                  addLabour(
                                    person
                                  )
                                }
                                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white lg:hidden"
                              >
                                Add
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>

                  {/* Today */}
                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDragOverType("labour")
                    }}
                    onDragLeave={() =>
                      setDragOverType("")
                    }
                    onDrop={(event) =>
                      handleDrop(
                        event,
                        "labour"
                      )
                    }
                    className={`min-h-[180px] rounded-2xl border-2 border-dashed p-3 transition ${
                      dragOverType === "labour"
                        ? "border-slate-500 bg-slate-100"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Today's Labour
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        {todayLabour.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {todayLabour.length === 0 ? (
                        <div className="flex min-h-[130px] flex-col items-center justify-center text-center">
                          <GripVertical
                            size={24}
                            className="text-slate-300"
                          />

                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            Drop labour here
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Or use Add on mobile
                          </p>
                        </div>
                      ) : (
                        todayLabour.map(
                          (person) => (
                            <DailyWorkPersonCard
                              key={person.id}
                              person={person}
                              type="labour"
                              onUpdate={(updated) =>
                                setTodayLabour(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        updated.id
                                          ? updated
                                          : item
                                    )
                                )
                              }
                              onRemove={
                                removeLabour
                              }
                            />
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Mesthiri */}
              <section className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Mesthiri
                    </h3>

                    <p className="text-xs text-slate-400">
                      Drag available mesthiris into today's work.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Users size={14} />
                    {todayMesthiri.length} selected
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {/* Available */}
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/70 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <GripVertical
                        size={16}
                        className="text-slate-400"
                      />

                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Available
                      </span>
                    </div>

                    <div className="space-y-2">
                      {availableMesthiri.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
                          <p className="text-sm font-medium text-slate-500">
                            No available mesthiri
                          </p>
                        </div>
                      ) : (
                        availableMesthiri.map(
                          (person) => (
                            <div
                              key={person.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData(
                                  "application/json",
                                  JSON.stringify({
                                    type: "mesthiri",
                                    id: person.id,
                                  })
                                )
                              }}
                              className="flex cursor-grab items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm transition hover:shadow-md active:cursor-grabbing"
                            >
                              <GripVertical
                                size={18}
                                className="text-slate-300"
                              />

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-800">
                                  {person.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  Drag to today's work
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  addMesthiri(
                                    person
                                  )
                                }
                                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white lg:hidden"
                              >
                                Add
                              </button>
                            </div>
                          )
                        )
                      )}
                    </div>
                  </div>

                  {/* Today */}
                  <div
                    onDragOver={(event) => {
                      event.preventDefault()
                      setDragOverType("mesthiri")
                    }}
                    onDragLeave={() =>
                      setDragOverType("")
                    }
                    onDrop={(event) =>
                      handleDrop(
                        event,
                        "mesthiri"
                      )
                    }
                    className={`min-h-[180px] rounded-2xl border-2 border-dashed p-3 transition ${
                      dragOverType === "mesthiri"
                        ? "border-slate-500 bg-slate-100"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Today's Mesthiri
                      </span>

                      <span className="text-xs font-semibold text-slate-400">
                        {todayMesthiri.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {todayMesthiri.length === 0 ? (
                        <div className="flex min-h-[130px] flex-col items-center justify-center text-center">
                          <GripVertical
                            size={24}
                            className="text-slate-300"
                          />

                          <p className="mt-2 text-sm font-semibold text-slate-500">
                            Drop mesthiri here
                          </p>
                        </div>
                      ) : (
                        todayMesthiri.map(
                          (person) => (
                            <DailyWorkPersonCard
                              key={person.id}
                              person={person}
                              type="mesthiri"
                              onUpdate={(updated) =>
                                setTodayMesthiri(
                                  (current) =>
                                    current.map(
                                      (item) =>
                                        item.id ===
                                        updated.id
                                          ? updated
                                          : item
                                    )
                                )
                              }
                              onRemove={
                                removeMesthiri
                              }
                            />
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="mt-8 rounded-2xl bg-slate-900 p-4 text-white sm:p-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-xs text-slate-400">
                      Labour
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      ₹
                      {totalLabour.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Mesthiri
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      ₹
                      {totalMesthiri.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Paid
                    </p>

                    <p className="mt-1 text-lg font-bold">
                      ₹
                      {paid.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Remaining
                    </p>

                    <p className="mt-1 text-lg font-bold text-amber-300">
                      ₹
                      {remaining.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Check size={17} />
                Save Today's Work
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DailyWorkModal