import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/projects')
}

export const dynamic = 'force-dynamic'
