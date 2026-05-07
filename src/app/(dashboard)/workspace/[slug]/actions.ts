'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { CreateProjectSchema } from '@/validations/project'

export type ProjectActionState = { error: string } | { success: true } | null

export async function createProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = CreateProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    workspace_id: formData.get('workspace_id'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase.from('projects').insert({
    name: parsed.data.name,
    description: parsed.data.description,
    workspace_id: parsed.data.workspace_id,
    created_by: user.id,
  })

  if (error) return { error: 'Error al crear el proyecto' }

  revalidatePath(`/workspace/${formData.get('workspace_slug')}`)
  return { success: true }
}

export async function deleteProject(id: string, workspaceSlug: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('projects').delete().eq('id', id)
  revalidatePath(`/workspace/${workspaceSlug}`)
}
