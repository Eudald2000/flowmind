import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { FolderOpen, CheckSquare, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { NewProjectSheet } from './new-project-sheet'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function WorkspacePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id, name, slug')
    .eq('slug', slug)
    .single()

  if (!workspace) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, description, created_at')
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const projectIds = (projects ?? []).map((p) => p.id)

  const taskCounts: Record<string, { total: number; done: number }> = {}
  if (projectIds.length > 0) {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('project_id, status')
      .in('project_id', projectIds)

    for (const task of tasks ?? []) {
      if (!taskCounts[task.project_id]) taskCounts[task.project_id] = { total: 0, done: 0 }
      taskCounts[task.project_id].total++
      if (task.status === 'done') taskCounts[task.project_id].done++
    }
  }

  return (
    <div className="flex flex-col min-h-svh">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E4E4E7] bg-white px-4">
        <SidebarTrigger className="cursor-pointer text-[#71717A] hover:text-[#09090B]" />
        <Separator orientation="vertical" className="h-4 bg-[#E4E4E7]" />
        <span className="text-sm font-medium text-[#09090B]">{workspace.name}</span>
        <div className="ml-auto">
          <NewProjectSheet workspaceId={workspace.id} workspaceSlug={workspace.slug} />
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-xl font-semibold text-[#09090B] tracking-tight">Proyectos</h1>
          <p className="text-sm text-[#71717A]">
            {projects?.length ?? 0} proyecto{(projects?.length ?? 0) !== 1 ? 's' : ''} activo{(projects?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>

        {!projects?.length ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#E4E4E7] bg-white py-20 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F4F4F5]">
              <FolderOpen className="h-6 w-6 text-[#71717A]" />
            </div>
            <p className="mt-4 text-sm font-medium text-[#09090B]">Sin proyectos todavía</p>
            <p className="mt-1 text-xs text-[#71717A]">
              Crea tu primer proyecto para empezar a gestionar tareas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const counts = taskCounts[project.id] ?? { total: 0, done: 0 }
              const progress = counts.total > 0
                ? Math.round((counts.done / counts.total) * 100)
                : 0

              return (
                <Link
                  key={project.id}
                  href={`/project/${project.id}`}
                  className="group flex flex-col rounded-xl border border-[#E4E4E7] bg-white p-5 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-semibold text-[#09090B] group-hover:text-[#18181B] line-clamp-1">
                      {project.name}
                    </h2>
                    <Badge variant="secondary" className="shrink-0 bg-[#F4F4F5] text-[#71717A] text-[10px]">
                      {progress}%
                    </Badge>
                  </div>

                  {project.description && (
                    <p className="mt-1.5 text-xs text-[#71717A] line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-xs text-[#A1A1AA]">
                    <span className="flex items-center gap-1">
                      <CheckSquare className="h-3 w-3" />
                      {counts.done}/{counts.total} tareas
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {project.created_at ? new Date(project.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—'}
                    </span>
                  </div>

                  {counts.total > 0 && (
                    <div className="mt-3 h-1 rounded-full bg-[#F4F4F5]">
                      <div
                        className="h-1 rounded-full bg-[#18181B] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
