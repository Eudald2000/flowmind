'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { toast } from 'sonner'
import { updateProject, deleteProject } from '@/app/(dashboard)/workspace/[slug]/actions'

interface Project {
  id: string
  name: string
  description: string | null
}

interface Props {
  project: Project
  workspaceSlug: string
  userRole?: string
}

export function EditProjectSheet({ project, workspaceSlug, userRole }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [state, action, pending] = useActionState(updateProject, null)
  const [isDeleting, startDelete] = useTransition()
  const router = useRouter()
  const canDelete = ['owner', 'admin'].includes(userRole ?? '')

  useEffect(() => {
    if (!state) return
    if ('success' in state) {
      toast.success('Proyecto actualizado')
      setOpen(false)
    }
  }, [state])

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteProject(project.id, workspaceSlug)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Proyecto eliminado')
        setOpen(false)
        router.push(`/workspace/${workspaceSlug}`)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmDelete(false) }}>
      <SheetTrigger className="relative z-10 inline-flex items-center justify-center rounded-md p-1.5 text-[#A1A1AA] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B]">
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar proyecto</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[#09090B]">Editar proyecto</SheetTitle>
          <SheetDescription className="text-[#71717A]">
            Modifica el nombre o la descripción del proyecto.
          </SheetDescription>
        </SheetHeader>

        <form key={project.id} action={action} className="mt-6 flex flex-col gap-4 px-4">
          <input type="hidden" name="id" value={project.id} />
          <input type="hidden" name="workspace_slug" value={workspaceSlug} />

          {state && 'error' in state && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="project-name" className="text-sm font-medium text-[#09090B]">
              Nombre
            </Label>
            <Input
              id="project-name"
              name="name"
              defaultValue={project.name}
              required
              className="border-[#E4E4E7]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="project-desc" className="text-sm font-medium text-[#09090B]">
              Descripción <span className="font-normal text-[#71717A]">(opcional)</span>
            </Label>
            <textarea
              id="project-desc"
              name="description"
              defaultValue={project.description ?? ''}
              rows={3}
              className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] placeholder:text-[#A1A1AA] outline-none focus:ring-2 focus:ring-[#18181B] resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={pending || isDeleting}
            className="mt-2 w-full bg-[#18181B] text-white hover:bg-[#27272A]"
          >
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </Button>

          {canDelete && (
            <div className="border-t border-[#E4E4E7] pt-4">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  disabled={pending || isDeleting}
                  className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                >
                  Eliminar proyecto
                </button>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                  <p className="text-sm font-medium text-red-700">¿Eliminar este proyecto?</p>
                  <p className="text-xs text-red-500">Se eliminarán todas las tareas. Esta acción no se puede deshacer.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      disabled={isDeleting}
                      className="flex-1 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-sm text-[#09090B] hover:bg-[#F4F4F5] disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>
      </SheetContent>
    </Sheet>
  )
}
