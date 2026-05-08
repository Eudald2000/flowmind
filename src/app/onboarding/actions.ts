'use server'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { CreateWorkspaceSchema } from '@/validations/workspace'

type ActionState = { error: string } | null

export async function createWorkspace(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = CreateWorkspaceSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .insert({ name: parsed.data.name, slug: parsed.data.slug, owner_id: user.id })
    .select('id, slug')
    .single()

  if (error) {
    console.error('[createWorkspace] Supabase error:', error.message, '| code:', error.code, '| details:', error.details, '| hint:', error.hint)
    if (error.code === '23505') return { error: 'Ese slug ya está en uso, elige otro' }
    return { error: 'Error al crear el workspace' }
  }

  // Bootstrap: add owner as member using admin client (RLS chicken-and-egg)
  const admin = await createAdminClient()
  const { error: memberError } = await admin.from('workspace_members').insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: 'owner',
  })
  if (memberError) {
    console.error('[createWorkspace] workspace_members insert error:', memberError.message, '| code:', memberError.code, '| details:', memberError.details)
  }

  redirect(`/workspace/${workspace.slug}`)
}
