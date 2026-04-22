'use client'

import { useActionState } from 'react'
import { use, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { addMenuItemAction, deleteMenuItemAction, toggleAvailabilityAction, type MenuState } from './actions'
import { createClient } from '@/lib/supabase/client'

type MenuItem = {
  id: string
  name: string
  description: string | null
  price_cents: number
  category: string
  available: boolean
}

export default function MenuEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [menuVersionId, setMenuVersionId] = useState<string>('')
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [state, formAction, pending] = useActionState(addMenuItemAction, {} as MenuState)
  const [actionPending, startTransition] = useTransition()

  async function loadItems() {
    const supabase = createClient()
    const { data: version } = await supabase
      .from('menu_versions')
      .select('id')
      .eq('project_id', id)
      .eq('is_active', true)
      .single()

    if (version) {
      setMenuVersionId(version.id)
      const { data } = await supabase
        .from('project_menu_items')
        .select('*')
        .eq('menu_version_id', version.id)
        .order('category')
        .order('sort_order')
        .order('name')
      if (data) setItems(data)
    }
    setLoading(false)
  }

  useEffect(() => { loadItems() }, [id])
  useEffect(() => { if (state.success) loadItems() }, [state.success])

  function handleDelete(itemId: string) {
    startTransition(async () => {
      await deleteMenuItemAction(itemId, id)
      loadItems()
    })
  }

  function handleToggle(itemId: string, currentlyAvailable: boolean) {
    startTransition(async () => {
      await toggleAvailabilityAction(itemId, !currentlyAvailable, id)
      loadItems()
    })
  }

  const categories = [...new Set(items.map(i => i.category))].sort()

  if (loading) {
    return <main className="min-h-screen bg-neutral-950 p-8"><p className="text-neutral-400">Loading...</p></main>
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <Link href={`/projects/${id}`} className="text-sm text-neutral-400 hover:text-neutral-200">Back to project</Link>
          <h1 className="mt-4 text-2xl font-semibold text-white">Menu Editor</h1>
          <p className="mt-1 text-sm text-neutral-400">{items.length} items</p>
        </div>

        <form action={formAction} className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Add Item</h2>
          <input type="hidden" name="project_id" value={id} />
          <input type="hidden" name="menu_version_id" value={menuVersionId} />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Name</label>
              <input name="name" type="text" required placeholder="Chicken Sandwich"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Price ($)</label>
              <input name="price" type="number" step="0.01" min="0" required placeholder="12.99"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Category</label>
              <input name="category" type="text" placeholder="Sandwiches" defaultValue="Other"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-300">Description (optional)</label>
              <input name="description" type="text" placeholder="Grilled chicken, lettuce, tomato"
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>

          {state.error ? <div className="mt-3 rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-200">{state.error}</div> : null}
          {state.success ? <div className="mt-3 rounded-lg border border-emerald-800 bg-emerald-950 p-3 text-sm text-emerald-200">Item added.</div> : null}

          <div className="mt-4 flex justify-end">
            <button type="submit" disabled={pending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
              {pending ? 'Adding...' : 'Add item'}
            </button>
          </div>
        </form>

        {items.length > 0 ? (
          <div className="space-y-6">
            {categories.map(cat => (
              <div key={cat}>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-neutral-500">{cat}</h3>
                <ul className="space-y-2">
                  {items.filter(i => i.category === cat).map(item => (
                    <li key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${item.available ? 'text-white' : 'text-neutral-500 line-through'}`}>
                            {item.name}
                          </span>
                          {!item.available && <span className="rounded bg-red-900/50 px-1.5 py-0.5 text-xs text-red-300">86d</span>}
                        </div>
                        {item.description && <p className="text-xs text-neutral-500">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-neutral-300">${(item.price_cents / 100).toFixed(2)}</span>
                        <button onClick={() => handleToggle(item.id, item.available)}
                          className={`rounded px-2 py-1 text-xs ${item.available ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700' : 'bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900'}`}>
                          {item.available ? '86 it' : 'Un-86'}
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="rounded bg-neutral-800 px-2 py-1 text-xs text-red-400 hover:bg-red-900/50">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 p-12 text-center">
            <p className="text-neutral-400">No menu items yet.</p>
            <p className="mt-1 text-sm text-neutral-500">Add items using the form above.</p>
          </div>
        )}
      </div>
    </main>
  )
}
