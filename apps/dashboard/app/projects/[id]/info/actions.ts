'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type InfoState = { success?: boolean; error?: string }

export async function updateInfoAction(
  prevState: InfoState,
  formData: FormData
): Promise<InfoState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in.' }

  const projectId = formData.get('project_id') as string
  const name = (formData.get('name') as string)?.trim()
  const businessName = (formData.get('business_name') as string)?.trim()
  const businessPhone = (formData.get('business_phone') as string)?.trim() || null
  const businessAddress = (formData.get('business_address') as string)?.trim() || null
  const timezone = formData.get('timezone') as string
  const posType = formData.get('pos_type') as string

  if (!name || name.length < 2) return { error: 'Project name is required.' }
  if (!businessName || businessName.length < 2) return { error: 'Business name is required.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('projects')
    .update({
      name,
      business_name: businessName,
      business_phone: businessPhone,
      business_address: businessAddress,
      timezone,
      pos_type: posType,
    })
    .eq('id', projectId)

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
