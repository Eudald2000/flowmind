'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CreateProjectSchema, UpdateProjectSchema } from '@/validations/project'

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

export async function updateProject(
  _prev: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = UpdateProjectSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const description = (formData.get('description') as string)?.trim() || null
  const workspaceSlug = formData.get('workspace_slug') as string

  const { error } = await supabase
    .from('projects')
    .update({
      name: parsed.data.name,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id)

  if (error) {
    console.error('[updateProject]', error.message)
    return { error: 'Error al actualizar el proyecto' }
  }

  revalidatePath(`/workspace/${workspaceSlug}`)
  revalidatePath(`/project/${parsed.data.id}`)
  return { success: true }
}

export async function deleteProject(
  id: string,
  workspaceSlug: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', id)
    .single()

  if (!project) return { error: 'Proyecto no encontrado' }

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', project.workspace_id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return { error: 'Sin permisos para eliminar este proyecto' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('projects').delete().eq('id', id)
  if (error) return { error: 'Error al eliminar el proyecto' }

  revalidatePath(`/workspace/${workspaceSlug}`)
  return null
}

export async function deleteWorkspace(
  workspaceId: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'owner') {
    return { error: 'Solo el propietario puede eliminar el workspace' }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('workspaces').delete().eq('id', workspaceId)
  if (error) {
    console.error('[deleteWorkspace]', error.message)
    return { error: 'Error al eliminar el workspace' }
  }

  const { data: next } = await supabase
    .from('workspace_members')
    .select('workspaces(slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  const nextSlug = (next?.workspaces as { slug: string } | null)?.slug
  redirect(nextSlug ? `/workspace/${nextSlug}` : '/onboarding')
}
