'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type CreateProjectState = {
  error?: string
}

export async function createProjectAction(
  prevState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to create a project.' }
  }

  const name = (formData.get('name') as string)?.trim()
  const businessName = (formData.get('business_name') as string)?.trim()
  const businessPhone = (formData.get('business_phone') as string)?.trim() || null
  const businessAddress = (formData.get('business_address') as string)?.trim() || null
  const timezone = (formData.get('timezone') as string) || 'America/Los_Angeles'
  const posType = (formData.get('pos_type') as string) || 'manual'

  if (!name || name.length < 2) {
    return { error: 'Project name must be at least 2 characters.' }
  }
  if (!businessName || businessName.length < 2) {
    return { error: 'Business name must be at least 2 characters.' }
  }

  const slug =
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) +
    '-' + Math.random().toString(36).slice(2, 8)

  const admin = createAdminClient()

  const { data: project, error: projectError } = await admin
    .from('projects')
    .insert({
      name,
      slug,
      business_name: businessName,
      business_phone: businessPhone,
      business_address: businessAddress,
      timezone,
      pos_type: posType,
      status: 'draft',
      created_by: user.id,
    })
    .select()
    .single()

  if (projectError || !project) {
    return { error: 'Failed to create project: ' + (projectError?.message ?? 'unknown error') }
  }

  const { error: memberError } = await admin
    .from('project_members')
    .insert({
      project_id: project.id,
      user_id: user.id,
      role: 'owner',
    })

  if (memberError) {
    await admin.from('projects').delete().eq('id', project.id)
    return { error: 'Failed to grant access: ' + memberError.message }
  }

  await admin.from('project_reservation_rules').insert({ project_id: project.id })

  const hoursSeed = [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
    project_id: project.id,
    day_of_week: dow,
    open_time: dow === 6 ? null : '11:00:00',
    close_time: dow === 6 ? null : '22:00:00',
    is_closed: dow === 6,
  }))
  await admin.from('project_hours').insert(hoursSeed)

  await admin.from('menu_versions').insert({
    project_id: project.id,
    version_number: 1,
    is_active: true,
    published_at: new Date().toISOString(),
    published_by: user.id,
    notes: 'Initial empty menu',
  })

  revalidatePath('/projects')
  redirect('/projects')
}
