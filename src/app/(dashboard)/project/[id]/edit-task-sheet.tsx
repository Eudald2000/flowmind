'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { Pencil } from 'lucide-react'
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
import { updateTask, deleteTask } from './actions'

const STATUS_OPTIONS = [
  { value: 'todo', label: 'Pendiente' },
  { value: 'in_progress', label: 'En progreso' },
  { value: 'done', label: 'Hecho' },
  { value: 'cancelled', label: 'Cancelado' },
]

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja' },
  { value: 'medium', label: 'Media' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
]

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  project_id: string
}

interface Props {
  task: Task
}

export function EditTaskSheet({ task }: Props) {
  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [state, action, pending] = useActionState(updateTask, null)
  const [isDeleting, startDelete] = useTransition()

  useEffect(() => {
    if (state === null && !pending) return
    if (state === null) {
      toast.success('Tarea actualizada')
      setOpen(false)
    }
  }, [state, pending])

  function handleDelete() {
    startDelete(async () => {
      const result = await deleteTask(task.id, task.project_id)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Tarea eliminada')
        setOpen(false)
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirmDelete(false) }}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-md p-1.5 text-[#A1A1AA] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B]">
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar tarea</span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[#09090B]">Editar tarea</SheetTitle>
          <SheetDescription className="text-[#71717A]">
            Modifica los detalles de esta tarea.
          </SheetDescription>
        </SheetHeader>

        <form key={task.id} action={action} className="mt-6 flex flex-col gap-4 px-4">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="project_id" value={task.project_id} />

          {state && 'error' in state && state.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-task-title" className="text-sm font-medium text-[#09090B]">
              Título
            </Label>
            <Input
              id="edit-task-title"
              name="title"
              defaultValue={task.title}
              required
              className="border-[#E4E4E7]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-task-desc" className="text-sm font-medium text-[#09090B]">
              Descripción <span className="font-normal text-[#71717A]">(opcional)</span>
            </Label>
            <textarea
              id="edit-task-desc"
              name="description"
              defaultValue={task.description ?? ''}
              rows={3}
              className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] placeholder:text-[#A1A1AA] outline-none focus:ring-2 focus:ring-[#18181B] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-task-status" className="text-sm font-medium text-[#09090B]">
                Estado
              </Label>
              <select
                id="edit-task-status"
                name="status"
                defaultValue={task.status}
                className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-task-priority" className="text-sm font-medium text-[#09090B]">
                Prioridad
              </Label>
              <select
                id="edit-task-priority"
                name="priority"
                defaultValue={task.priority}
                className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-task-due" className="text-sm font-medium text-[#09090B]">
              Fecha límite <span className="font-normal text-[#71717A]">(opcional)</span>
            </Label>
            <Input
              id="edit-task-due"
              name="due_date"
              type="date"
              defaultValue={task.due_date ?? ''}
              className="border-[#E4E4E7]"
            />
          </div>

          <Button
            type="submit"
            disabled={pending || isDeleting}
            className="mt-2 w-full bg-[#18181B] text-white hover:bg-[#27272A]"
          >
            {pending ? 'Guardando...' : 'Guardar cambios'}
          </Button>

          <div className="border-t border-[#E4E4E7] pt-4">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                disabled={pending || isDeleting}
                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                Eliminar tarea
              </button>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
                <p className="text-sm font-medium text-red-700">¿Eliminar esta tarea?</p>
                <p className="text-xs text-red-500">Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                    className="flex-1 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-sm text-[#09090B] transition-colors hover:bg-[#F4F4F5] disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
