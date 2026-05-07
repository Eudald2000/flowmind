import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, ListTodo } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface Props {
  params: Promise<{ id: string }>
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Hecho',
  cancelled: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-[#F4F4F5] text-[#71717A]',
  in_progress: 'bg-blue-50 text-blue-700',
  done: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-500',
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('id, name, description, workspace_id, workspaces(name, slug)')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const workspace = project.workspaces as { name: string; slug: string } | null

  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#E4E4E7] bg-white px-4">
        <SidebarTrigger className="cursor-pointer text-[#71717A] hover:text-[#09090B]" />
        <Separator orientation="vertical" className="h-4 bg-[#E4E4E7]" />
        {workspace && (
          <>
            <Link
              href={`/workspace/${workspace.slug}`}
              className="text-sm text-[#71717A] hover:text-[#09090B] transition-colors"
            >
              {workspace.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#A1A1AA]" />
          </>
        )}
        <span className="text-sm font-medium text-[#09090B]">{project.name}</span>
      </header>

      <main className="flex-1 px-6 py-8 max-w-3xl">
        <div className="mb-8 space-y-1">
          <h1 className="text-xl font-semibold text-[#09090B] tracking-tight">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-[#71717A]">{project.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-[#09090B]">
              Tareas <span className="ml-1 text-[#71717A] font-normal">({tasks?.length ?? 0})</span>
            </h2>
          </div>

          {!tasks?.length ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-white py-16 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F4F5]">
                <ListTodo className="h-5 w-5 text-[#71717A]" />
              </div>
              <p className="mt-3 text-sm font-medium text-[#09090B]">Sin tareas todavía</p>
              <p className="mt-1 text-xs text-[#71717A]">
                La gestión de tareas llega muy pronto.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E4E7] rounded-xl border border-[#E4E4E7] bg-white">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#09090B] truncate">{task.title}</p>
                  </div>
                  <Badge className={`shrink-0 text-[10px] font-medium border-0 ${STATUS_COLORS[task.status]}`}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
