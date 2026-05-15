import { createGroq } from '@ai-sdk/groq'
import { streamText, tool, jsonSchema, convertToModelMessages, stepCountIs } from 'ai'
import { createClient, createAdminClient } from '@/lib/supabase/server'

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { messages, projectId } = await req.json()
  if (!projectId) return new Response('projectId requerido', { status: 400 })

  const [{ data: project }, { data: tasks }] = await Promise.all([
    supabase
      .from('projects')
      .select('id, name, description')
      .eq('id', projectId)
      .single(),
    supabase
      .from('tasks')
      .select('id, title, description, status, priority, due_date')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),
  ])

  if (!project) return new Response('Proyecto no encontrado', { status: 404 })

  const userId = user.id

  const systemPrompt = `Eres FlowMind AI, asistente de gestión de proyectos para "${project.name}".
Puedes leer, crear, editar y eliminar tareas del proyecto.
Responde siempre en español. Sé conciso y útil. No uses markdown excesivo.
Hoy es ${new Date().toISOString().split('T')[0]}.

Estado actual del proyecto (${tasks?.length ?? 0} tareas):
${JSON.stringify(tasks ?? [], null, 2)}`

  const admin = createAdminClient()

  const result = streamText({
    model: createGroq({ apiKey: process.env.GROQ_API_KEY })('llama-3.3-70b-versatile'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: {
      get_tasks: tool({
        description: 'Obtiene las tareas del proyecto. Usa filtros opcionales por estado o prioridad.',
        inputSchema: jsonSchema<{ status?: TaskStatus; priority?: TaskPriority }>({
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          },
        }),
        execute: async ({ status, priority }) => {
          const { data } = await admin
            .from('tasks')
            .select('id, title, description, status, priority, due_date')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

          let result = data ?? []
          if (status) result = result.filter(t => t.status === status)
          if (priority) result = result.filter(t => t.priority === priority)
          return result
        },
      }),

      create_task: tool({
        description: 'Crea una nueva tarea en el proyecto.',
        inputSchema: jsonSchema<{
          title: string
          description?: string
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: string
        }>({
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 5000 },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            due_date: { type: 'string' },
          },
        }),
        execute: async ({ title, description, status, priority, due_date }) => {
          const { data, error } = await admin
            .from('tasks')
            .insert({
              title,
              description: description ?? null,
              status: status ?? 'todo',
              priority: priority ?? 'medium',
              due_date: due_date ?? null,
              project_id: projectId,
              created_by: userId,
            })
            .select('id, title, status, priority')
            .single()

          if (error) return { success: false, error: error.message }
          return { success: true, task: data }
        },
      }),

      update_task: tool({
        description: 'Actualiza campos de una tarea existente. Pasa solo los campos a cambiar.',
        inputSchema: jsonSchema<{
          task_id: string
          title?: string
          description?: string
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: string
        }>({
          type: 'object',
          required: ['task_id'],
          properties: {
            task_id: { type: 'string', format: 'uuid' },
            title: { type: 'string', minLength: 1, maxLength: 200 },
            description: { type: 'string', maxLength: 5000 },
            status: { type: 'string', enum: ['todo', 'in_progress', 'done', 'cancelled'] },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            due_date: { type: 'string' },
          },
        }),
        execute: async ({ task_id, title, description, status, priority, due_date }) => {
          const { error } = await admin
            .from('tasks')
            .update({
              ...(title !== undefined && { title }),
              ...(description !== undefined && { description }),
              ...(status !== undefined && { status }),
              ...(priority !== undefined && { priority }),
              ...(due_date !== undefined && { due_date }),
              updated_at: new Date().toISOString(),
            })
            .eq('id', task_id)
            .eq('project_id', projectId)

          if (error) return { success: false, error: error.message }
          return { success: true }
        },
      }),

      delete_task: tool({
        description: 'Elimina una tarea. Solo usar si el usuario lo ha pedido explícitamente.',
        inputSchema: jsonSchema<{ task_id: string }>({
          type: 'object',
          required: ['task_id'],
          properties: {
            task_id: { type: 'string', format: 'uuid' },
          },
        }),
        execute: async ({ task_id }) => {
          const { error } = await admin
            .from('tasks')
            .delete()
            .eq('id', task_id)
            .eq('project_id', projectId)

          if (error) return { success: false, error: error.message }
          return { success: true }
        },
      }),
    },
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
