'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      router.push('/projects')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Truesman</h1>
        <p className="mb-8 text-sm text-neutral-400">Sign in to your dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-neutral-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@truesman.com"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-neutral-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
          >
            {status === 'sending' ? 'Signing in...' : 'Sign in'}
          </button>

          {status === 'error' ? (
            <p className="text-sm text-red-400">{errorMsg}</p>
          ) : null}
        </form>
      </div>
    </main>
  )
}
