'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type RulesState = { success?: boolean; error?: string }

export async function updateRulesAction(
  prevState: RulesState,
  formData: FormData
): Promise<RulesState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in.' }

  const projectId = formData.get('project_id') as string
  const partySizeMin = parseInt(formData.get('party_size_min') as string) || 1
  const partySizeMax = parseInt(formData.get('party_size_max') as string) || 12
  const slotDuration = parseInt(formData.get('slot_duration_min') as string) || 30
  const maxConcurrent = parseInt(formData.get('max_concurrent_per_slot') as string) || 4
  const advanceDays = parseInt(formData.get('advance_days') as string) || 30
  const bufferBeforeClose = parseInt(formData.get('buffer_before_close_min') as string) || 60

  const admin = createAdminClient()
  const { error } = await admin
    .from('project_reservation_rules')
    .update({
      party_size_min: partySizeMin,
      party_size_max: partySizeMax,
      slot_duration_min: slotDuration,
      max_concurrent_per_slot: maxConcurrent,
      advance_days: advanceDays,
      buffer_before_close_min: bufferBeforeClose,
    })
    .eq('project_id', projectId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
