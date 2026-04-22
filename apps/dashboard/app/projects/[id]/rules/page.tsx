'use client'

import { useActionState } from 'react'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { updateRulesAction, type RulesState } from './actions'
import { createClient } from '@/lib/supabase/client'

export default function RulesEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [rules, setRules] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(updateRulesAction, {} as RulesState)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('project_reservation_rules').select('*').eq('project_id', id).single()
      if (data) setRules(data)
      setLoading(false)
    }
    load()
  }, [id])

  if (loading || !rules) {
    return <main className="min-h-screen bg-neutral-950 p-8"><p className="text-neutral-400">Loading...</p></main>
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href={`/projects/${id}`} className="text-sm text-neutral-400 hover:text-neutral-200">Back to project</Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">Edit Reservation Rules</h1>
        </div>

        <form action={formAction} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <input type="hidden" name="project_id" value={id} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm text-neutral-300">Min party size</label>
              <input name="party_size_min" type="number" min="1" defaultValue={rules.party_size_min}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-neutral-300">Max party size</label>
              <input name="party_size_max" type="number" min="1" defaultValue={rules.party_size_max}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Slot duration (minutes)</label>
            <input name="slot_duration_min" type="number" min="15" step="15" defaultValue={rules.slot_duration_min}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
            <p className="mt-1 text-xs text-neutral-500">How long each reservation slot lasts.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Max reservations per slot</label>
            <input name="max_concurrent_per_slot" type="number" min="1" defaultValue={rules.max_concurrent_per_slot}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Advance booking (days)</label>
            <input name="advance_days" type="number" min="1" defaultValue={rules.advance_days}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
            <p className="mt-1 text-xs text-neutral-500">How far in advance customers can book.</p>
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Buffer before close (minutes)</label>
            <input name="buffer_before_close_min" type="number" min="0" step="15" defaultValue={rules.buffer_before_close_min}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
            <p className="mt-1 text-xs text-neutral-500">Stop taking reservations this many minutes before closing.</p>
          </div>

          {state.error ? <div className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200">{state.error}</div> : null}
          {state.success ? <div className="rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-200">Rules updated.</div> : null}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {pending ? 'Saving...' : 'Save rules'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
