import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, business_name, status, pos_type, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Projects</h1>
            <p className="mt-1 text-sm text-neutral-400">Signed in as {user.email}</p>
          </div>
          <Link href="/projects/new"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
            + New Project
          </Link>
        </header>

        {projects && projects.length > 0 ? (
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`}
                  className="block rounded-xl border border-neutral-800 bg-neutral-900 p-4 transition hover:border-neutral-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-medium text-white">{p.name}</h2>
                      <p className="text-sm text-neutral-400">{p.business_name}</p>
                      <p className="mt-1 text-xs text-neutral-500">Created {new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded bg-neutral-800 px-2 py-1 text-neutral-300">{p.pos_type}</span>
                      <span className="rounded bg-emerald-900/50 px-2 py-1 text-emerald-300">{p.status}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 p-12 text-center">
            <p className="text-neutral-400">No projects yet.</p>
            <p className="mt-1 text-sm text-neutral-500">
              Click <strong className="text-neutral-300">+ New Project</strong> to create your first one.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
