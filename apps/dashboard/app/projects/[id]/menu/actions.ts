'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export type MenuState = { success?: boolean; error?: string }

export async function addMenuItemAction(
  prevState: MenuState,
  formData: FormData
): Promise<MenuState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not logged in.' }

  const projectId = formData.get('project_id') as string
  const menuVersionId = formData.get('menu_version_id') as string
  const name = (formData.get('name') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() || null
  const priceStr = formData.get('price') as string
  const category = (formData.get('category') as string)?.trim() || 'Other'

  if (!name || name.length < 1) return { error: 'Item name is required.' }

  const priceCents = Math.round(parseFloat(priceStr) * 100)
  if (isNaN(priceCents) || priceCents < 0) return { error: 'Invalid price.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('project_menu_items')
    .insert({
      project_id: projectId,
      menu_version_id: menuVersionId,
      name,
      description,
      price_cents: priceCents,
      category,
      available: true,
    })

  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/menu`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function deleteMenuItemAction(itemId: string, projectId: string): Promise<MenuState> {
  const admin = createAdminClient()
  const { error } = await admin.from('project_menu_items').delete().eq('id', itemId)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/menu`)
  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}

export async function toggleAvailabilityAction(itemId: string, available: boolean, projectId: string): Promise<MenuState> {
  const admin = createAdminClient()
  const { error } = await admin.from('project_menu_items').update({ available }).eq('id', itemId)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}/menu`)
  return { success: true }
}
