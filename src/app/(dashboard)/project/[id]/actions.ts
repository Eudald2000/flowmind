'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { TASK_STATUSES } from '@/constants'
import { CreateTaskSchema, UpdateTaskSchema, DeleteTaskSchema } from '@/validations/task'

type ActionState = { error: string } | null

export async function createTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projectId = formData.get('project_id') as string

  const parsed = CreateTaskSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    status: formData.get('status') || 'todo',
    priority: formData.get('priority') || 'medium',
    due_date: formData.get('due_date') || undefined,
    project_id: projectId,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  if (parsed.data.due_date) {
    const today = new Date().toISOString().split('T')[0]
    if (parsed.data.due_date < today) {
      return { error: 'La fecha límite no puede ser anterior a hoy' }
    }
  }

  const admin = createAdminClient()
  const { error } = await admin.from('tasks').insert({
    title: parsed.data.title,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.due_date ?? null,
    project_id: parsed.data.project_id,
    created_by: user.id,
  })

  if (error) {
    console.error('[createTask] error:', error.message, error.code)
    return { error: 'Error al crear la tarea' }
  }

  revalidatePath(`/project/${projectId}`)
  return null
}

export async function updateTask(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projectId = formData.get('project_id') as string

  const parsed = UpdateTaskSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    status: formData.get('status'),
    priority: formData.get('priority'),
    due_date: formData.get('due_date') || undefined,
    project_id: projectId,
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const description = (formData.get('description') as string)?.trim() || null

  const admin = createAdminClient()
  const { error } = await admin
    .from('tasks')
    .update({
      title: parsed.data.title,
      description,
      status: parsed.data.status,
      priority: parsed.data.priority,
      due_date: parsed.data.due_date ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.id)

  if (error) {
    console.error('[updateTask] error:', error.message, error.code)
    return { error: 'Error al actualizar la tarea' }
  }

  revalidatePath(`/project/${projectId}`)
  return null
}

export async function deleteTask(id: string, projectId: string): Promise<ActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = DeleteTaskSchema.safeParse({ id, project_id: projectId, confirmed: true })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('tasks')
    .delete()
    .eq('id', parsed.data.id)

  if (error) {
    console.error('[deleteTask] error:', error.message, error.code)
    return { error: 'Error al eliminar la tarea' }
  }

  revalidatePath(`/project/${projectId}`)
  return null
}

export async function updateTaskStatus(
  taskId: string,
  status: string,
  projectId: string
): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (!TASK_STATUSES.includes(status as (typeof TASK_STATUSES)[number])) {
    return { error: 'Estado inválido' }
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('tasks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', taskId)

  if (error) {
    console.error('[updateTaskStatus]', error.message)
    return { error: 'Error al actualizar el estado' }
  }

  revalidatePath(`/project/${projectId}`)
  return null
}
