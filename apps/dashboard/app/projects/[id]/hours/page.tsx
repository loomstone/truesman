'use client'

import { useActionState } from 'react'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { updateHoursAction, type HoursState } from './actions'
import { createClient } from '@/lib/supabase/client'

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type HourRow = {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export default function HoursEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [hours, setHours] = useState<HourRow[]>([])
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(updateHoursAction, {} as HoursState)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('project_hours')
        .select('day_of_week, open_time, close_time, is_closed')
        .eq('project_id', id)
        .order('day_of_week')
      if (data) setHours(data)
      setLoading(false)
    }
    load()
  }, [id])

  function toggleClosed(dow: number) {
    setHours(prev => prev.map(h =>
      h.day_of_week === dow ? { ...h, is_closed: !h.is_closed } : h
    ))
  }

  function updateTime(dow: number, field: 'open_time' | 'close_time', value: string) {
    setHours(prev => prev.map(h =>
      h.day_of_week === dow ? { ...h, [field]: value } : h
    ))
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 p-8">
        <p className="text-neutral-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href={`/projects/${id}`} className="text-sm text-neutral-400 hover:text-neutral-200">
            ← Back to project
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">Edit Hours</h1>
          <p className="mt-1 text-sm text-neutral-400">Set operating hours for each day of the week.</p>
        </div>

        <form action={formAction} className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <input type="hidden" name="project_id" value={id} />

          {hours.map((h) => (
            <div key={h.day_of_week} className="flex items-center gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              <span className="w-24 text-sm font-mediutext-neutral-300">{dayNames[h.day_of_week]}</span>

              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <input
                  type="checkbox"
                  name={`closed_${h.day_of_week}`}
                  checked={h.is_closed}
                  onChange={() => toggleClosed(h.day_of_week)}
                  className="rounded border-neutral-600 bg-neutral-800"
                />
                Closed
              </label>

              {!h.is_closed && (
                <>
                  <input
                    type="time"
                    name={`open_${h.day_of_week}`}
                    value={h.open_time?.slice(0, 5) || ''}
                    onChange={(e) => updateTime(h.day_of_week, 'open_time', e.target.value)}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-white"
                  />
                  <span className="text-neutral-500">to</span>
                  <input
                    type="time"
                    name={`close_${h.day_of_week}`}
                    value={h.close_time?.slice(0, 5) || ''}
                    onChange={(e) => updateTime(h.day_of_week, 'close_time', e.target.value)}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-2 py-1 text-sm text-white"
                  />
                </>
              )}
            </div>
          ))}

          {state.error ? (
            <div className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200">{state.error}</div>
          ) : null}

          {state.success ? (
            <div className="rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-200">Hours updated.</div>
          ) : null}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {pending ? 'Saving...' : 'Save hours'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
