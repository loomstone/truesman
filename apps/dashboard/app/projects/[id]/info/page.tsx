'use client'

import { useActionState } from 'react'
import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { updateInfoAction, type InfoState } from './actions'
import { createClient } from '@/lib/supabase/client'

export default function InfoEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(updateInfoAction, {} as InfoState)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('projects').select('*').eq('id', id).single()
      if (data) setProject(data)
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    if (state.success) {
      async function reload() {
        const supabase = createClient()
        const { data } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()
        if (data) setProject(data)
      }
      reload()
    }
  }, [state.success])

  if (loading || !project) {
    return <main className="min-h-screen bg-neutral-950 p-8"><p className="text-neutral-400">Loading...</p></main>
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href={`/projects/${id}`} className="text-sm text-neutral-400 hover:text-neutral-200">Back to project</Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">Edit Business Info</h1>
        </div>

        <form action={formAction} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <input type="hidden" name="project_id" value={id} />

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Project name</label>
            <input name="name" type="text" required defaultValue={project.name}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Business name</label>
            <input name="business_name" type="text" required defaultValue={project.business_name}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Phone</label>
            <input name="business_phone" type="tel" defaultValue={project.business_phone || ''}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Address</label>
            <input name="business_address" type="text" defaultValue={project.business_address || ''}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">Timezone</label>
            <select name="timezone" defaultValue={project.timezone}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
              <option value="America/Los_Angeles">Pacific (Los Angeles)</option>
              <option value="America/Denver">Mountain (Denver)</option>
              <option value="America/Chicago">Central (Chicago)</option>
              <option value="America/New_York">Eastern (New York)</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-neutral-300">POS System</label>
            <select name="pos_type" defaultValue={project.pos_type}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
              <option value="manual">Manual</option>
              <option value="square">Square</option>
              <option value="clover">Clover</option>
              <option value="toast">Toast</option>
              <option value="lightspeed">Lightspeed</option>
              <option value="touchbistro">TouchBistro</option>
              <option value="revel">Revel</option>
              <option value="aloha">Aloha (NCR)</option>
              <option value="micros">Oracle MICROS</option>
              <option value="other">Other</option>
            </select>
          </div>

          {state.error ? <div className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200">{state.error}</div> : null}
          {state.success ? <div className="rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-200">Info updated.</div> : null}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {pending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
