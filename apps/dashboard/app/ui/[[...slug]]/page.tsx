import { SidebarNavigation } from '@/components/ui/sidebar-navigation'

type UiPageProps = {
  params: Promise<{ slug?: string[] }>
}

export default async function UiSidebarPreviewPage({ params }: UiPageProps) {
  const resolvedParams = await params
  const slugParts = resolvedParams.slug ?? []
  const activeLabel = slugParts.length > 0 ? formatLabel(slugParts[slugParts.length - 1]) : 'Dashboard'

  return (
    <main className="flex min-h-screen bg-neutral-900 text-neutral-100">
      <SidebarNavigation />

      <section className="flex-1 p-10">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-8">
          <p className="text-xs font-semibold tracking-[0.16em] text-neutral-500">SAAS DASHBOARD</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{activeLabel}</h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-400">
            Sidebar preview mode. Click any nav item to switch the active state and validate interaction.
          </p>
        </div>
      </section>
    </main>
  )
}

function formatLabel(segment: string) {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
