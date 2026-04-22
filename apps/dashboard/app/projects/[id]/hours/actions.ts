'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type HoursState = {
  success?: boolean
  error?: string
}

export async function updateHoursAction(
  prevState: HoursState,
  formData: FormData
): Promise<HoursState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in.' }

  const projectId = formData.get('project_id') as string
  if (!projectId) return { error: 'Missing project ID.' }

  const admin = createAdminClient()
  const days = [0, 1, 2, 3, 4, 5, 6]

  for (const dow of days) {
    const isClosed = formData.get(`closed_${dow}`) === 'on'
    const openTime = formData.get(`open_${dow}`) as string
    const closeTime = formData.get(`close_${dow}`) as string

    const { error } = await admin
      .from('project_hours')
      .update({
        open_time: isClosed ? null : openTime || null,
        close_time: isClosed ? null : closeTime || null,
        is_closed: isClosed,
      })
      .eq('project_id', projectId)
      .eq('day_of_week', dow)

    if (error) {
      return { error: `Failed to update ${dow}: ${error.message}` }
    }
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
