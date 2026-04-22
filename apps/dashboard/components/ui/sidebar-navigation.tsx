'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

type NavItem = {
  label: string
  href: string
  icon: ReactNode
}

type NavSection = {
  title: string
  items: NavItem[]
}

const iconClassName = 'h-4 w-4'

const sections: NavSection[] = [
  {
    title: 'OPERATE',
    items: [
      { label: 'Dashboard', href: '/ui/dashboard', icon: <DashboardIcon /> },
      { label: 'Calls', href: '/ui/calls', icon: <PhoneIcon /> },
      { label: 'Reservations', href: '/ui/reservations', icon: <CalendarIcon /> },
      { label: 'Orders', href: '/ui/orders', icon: <BagIcon /> },
    ],
  },
  {
    title: 'CONFIGURE',
    items: [
      { label: 'Menu', href: '/ui/menu', icon: <MenuIcon /> },
      { label: 'Hours', href: '/ui/hours', icon: <ClockIcon /> },
      { label: 'Rules', href: '/ui/rules', icon: <ShieldIcon /> },
      { label: 'Integration', href: '/ui/integration', icon: <PlugIcon /> },
      { label: 'AI Agent', href: '/ui/ai-agent', icon: <SparklesIcon /> },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Billing', href: '/ui/billing', icon: <CardIcon /> },
      { label: 'Team', href: '/ui/team', icon: <UsersIcon /> },
      { label: 'Settings', href: '/ui/settings', icon: <SettingsIcon /> },
    ],
  },
]

export function SidebarNavigation() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-6 py-6">
        <Link
          href="/ui/dashboard"
          className="inline-flex items-center rounded-md text-xl font-semibold text-white transition hover:text-emerald-300"
        >
          Truesman
        </Link>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="px-2 text-xs font-semibold tracking-[0.14em] text-neutral-500">{section.title}</h2>
            <ul className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                        active
                          ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/40'
                          : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span className={`${active ? 'text-emerald-300' : 'text-neutral-500 group-hover:text-neutral-300'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M22 16.9v2a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 4.2 2 2 0 0 1 5 2h2a2 2 0 0 1 2 1.7l.4 3a2 2 0 0 1-.6 1.7l-1.3 1.3a16 16 0 0 0 6.8 6.8l1.3-1.3a2 2 0 0 1 1.7-.6l3 .4a2 2 0 0 1 1.7 2Z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M8 2v4M16 2v4M3 10h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M6 8h12l-1 12H7L6 8ZM9 8a3 3 0 1 1 6 0" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6l4 2" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M12 3 5 6v6c0 5 3.4 8.7 7 9.9 3.6-1.2 7-4.9 7-9.9V6l-7-3Z" />
    </svg>
  )
}

function PlugIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M9 7V3M15 7V3M8 11h8a1 1 0 0 1 1 1 5 5 0 0 1-10 0 1 1 0 0 1 1-1ZM12 17v4" />
    </svg>
  )
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="m12 3 1.7 3.8L18 8.5l-3.1 2.8.8 4.2L12 13.5l-3.7 2 .8-4.2L6 8.5l4.3-1.7L12 3ZM19 14l.8 1.8L22 16.5l-1.7 1.6.4 2.3-1.7-1-1.7 1 .4-2.3L16 16.5l2.2-.7L19 14ZM5 14l.8 1.8 2.2.7-1.7 1.6.4 2.3-1.7-1-1.7 1 .4-2.3L2 16.5l2.2-.7L5 14Z" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={iconClassName}>
      <path d="M12 9.5A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5ZM19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.1 1.1a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.6a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1.1-1.1a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.6a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4L5.9 4a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V3a1 1 0 0 1 1-1h1.6a1 1 0 0 1 1 1v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.6Z" />
    </svg>
  )
}
