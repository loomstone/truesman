import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function formatTime(t: string | null) {
  if (!t) return '-'
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${display}:${m} ${ampm}`
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const admin = createAdminClient()

  const { data: project } = await admin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  const { data: hours } = await admin
    .from('project_hours')
    .select('*')
    .eq('project_id', id)
    .order('day_of_week', { ascending: true })

  const { data: rules } = await admin
    .from('project_reservation_rules')
    .select('*')
    .eq('project_id', id)
    .single()

  const { data: menuVersion } = await admin
    .from('menu_versions')
    .select('*')
    .eq('project_id', id)
    .eq('is_active', true)
    .single()

  let menuItemCount = 0
  if (menuVersion) {
    const { count } = await admin
      .from('project_menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('menu_version_id', menuVersion.id)
    menuItemCount = count ?? 0
  }

  const { count: callCount } = await admin
    .from('calls')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  const { count: reservationCount } = await admin
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  const { count: orderCount } = await admin
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', id)

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Link href="/projects" className="text-sm text-neutral-400 hover:text-neutral-200">
            ← Back to projects
          </Link>
        </div>

        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">{project.name}</h1>
            <p className="mt-1 text-sm text-neutral-400">{project.business_name}</p>
          </div>
          <div className="flex gap-2 text-xs">
            <span className="rounded bg-neutral-800 px-2 py-1 text-neutral-300">{project.pos_type}</span>
            <span className="rounded bg-emerald-900/50 px-2 py-1 text-emerald-300">{project.status}</span>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Total Calls</p>
            <p className="mt-1 text-2xl font-semibold text-white">{callCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Reservations</p>
            <p className="mt-1 text-2xl font-semibold text-white">{reservationCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Orders</p>
            <p className="mt-1 text-2xl font-semibold text-white">{orderCount ?? 0}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">Menu Items</p>
            <p className="mt-1 text-2xl font-semibold text-white">{menuItemCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><h2 className="text-lg font-medium text-white">Business Info</h2><Link href={`/projects/${id}/info`} className="text-xs text-emerald-400 hover:text-emerald-300">Edit</Link></div>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-neutral-500">Phone</dt>
                <dd className="text-white">{project.business_phone || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Address</dt>
                <dd className="text-white">{project.business_address || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Timezone</dt>
                <dd className="text-white">{project.timezone}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">POS System</dt>
                <dd className="text-white capitalize">{project.pos_type}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Twilio Number</dt>
                <dd className="text-white">{project.twilio_phone_number || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-neutral-500">Retell Agent</dt>
                <dd className="text-white">{project.retell_agent_id || 'Not configured'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h2 className="text-lg font-medium text-white">Hours</h2>
                <Link href={`/projects/${id}/hours`} className="text-xs text-emerald-400 hover:text-emerald-300">Edit</Link>
              </div>
            </div>
            {hours && hours.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {hours.map((h) => (
                  <li key={h.day_of_week} className="flex justify-between">
                    <span className="text-neutral-400">{dayNames[h.day_of_week]}</span>
                    <span className="text-white">
                      {h.is_closed ? 'Closed' : `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">No hours configured.</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><h2 className="text-lg font-medium text-white">Reservation Rules</h2><Link href={`/projects/${id}/rules`} className="text-xs text-emerald-400 hover:text-emerald-300">Edit</Link></div>
            </div>
            {rules ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Party size</dt>
                  <dd className="text-white">{rules.party_size_min} - {rules.party_size_max} guests</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Slot duration</dt>
                  <dd className="text-white">{rules.slot_duration_min} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Max per slot</dt>
                  <dd className="text-white">{rules.max_concurrent_per_slot}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Advance booking</dt>
                  <dd className="text-white">{rules.advance_days} days</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Buffer before close</dt>
                  <dd className="text-white">{rules.buffer_before_close_min} min</dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">No rules configured.</p>
            )}
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3"><h2 className="text-lg font-medium text-white">Menu</h2><Link href={`/projects/${id}/menu`} className="text-xs text-emerald-400 hover:text-emerald-300">Edit</Link></div>
            </div>
            {menuVersion ? (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Active version</dt>
                  <dd className="text-white">v{menuVersion.version_number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Items</dt>
                  <dd className="text-white">{menuItemCount}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Published</dt>
                  <dd className="text-white">
                    {menuVersion.published_at ? new Date(menuVersion.published_at).toLocaleDateString() : 'Draft'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-neutral-500">No menu version.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
