'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createProjectAction, type CreateProjectState } from './actions'

const initialState: CreateProjectState = {}

export default function NewProjectPage() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState)

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/projects" className="text-sm text-neutral-400 hover:text-neutral-200">
            back to projects
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">New Project</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Create a new customer project for the voicebot platform.
          </p>
        </div>

        <form action={formAction} className="space-y-5 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-neutral-300">Project name</label>
            <input id="name" name="name" type="text" required placeholder="Rays Deli - SF"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
            <p className="mt-1 text-xs text-neutral-500">Internal name, shown only to admins.</p>
          </div>

          <div>
            <label htmlFor="business_name" className="mb-2 block text-sm text-neutral-300">Business name</label>
            <input id="business_name" name="business_name" type="text" required placeholder="Rays Deli"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
            <p className="mt-1 text-xs text-neutral-500">How the bot will refer to this business out loud.</p>
          </div>

          <div>
            <label htmlFor="business_phone" className="mb-2 block text-sm text-neutral-300">Business phone</label>
            <input id="business_phone" name="business_phone" type="tel" placeholder="+1 555 123 4567"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label htmlFor="business_address" className="mb-2 block text-sm text-neutral-300">Business address</label>
            <input id="business_address" name="business_address" type="text" placeholder="123 Main St, San Francisco, CA"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label htmlFor="timezone" className="mb-2 block text-sm text-neutral-300">Timezone</label>
            <select id="timezone" name="timezone" defaultValue="America/Los_Angeles"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
              <option value="America/Los_Angeles">Pacific (Los Angeles)</option>
              <option value="America/Denver">Mountain (Denver)</option>
              <option value="America/Chicago">Central (Chicago)</option>
              <option value="America/New_York">Eastern (New York)</option>
            </select>
          </div>

          <div>
            <label htmlFor="pos_type" className="mb-2 block text-sm text-neutral-300">POS system</label>
            <select id="pos_type" name="pos_type" defaultValue="manual"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
              <option value="manual">Manual (no POS - use the dashboard)</option>
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
            <p className="mt-1 text-xs text-neutral-500">Start on Manual. Switch to Square once connected.</p>
          </div>

          {state.error ? (
            <div className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200">
              {state.error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/projects" className="rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800">
              Cancel
            </Link>
            <button type="submit" disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {pending ? 'Creating...' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
