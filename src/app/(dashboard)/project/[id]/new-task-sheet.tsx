'use client'

import { useActionState, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
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
import { createTask } from './actions'

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

interface Props {
  projectId: string
}

export function NewTaskSheet({ projectId }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createTask, null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state === null && !pending) return
    if (state === null) setOpen(false)
  }, [state, pending])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-lg bg-[#18181B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#27272A]">
        <Plus className="h-4 w-4" />
        Nueva tarea
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[#09090B]">Nueva tarea</SheetTitle>
          <SheetDescription className="text-[#71717A]">
            Añade una tarea a este proyecto.
          </SheetDescription>
        </SheetHeader>

        <form action={action} className="mt-6 flex flex-col gap-4 px-4">
          <input type="hidden" name="project_id" value={projectId} />

          {state && 'error' in state && state.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-sm font-medium text-[#09090B]">
              Título
            </Label>
            <Input
              id="task-title"
              name="title"
              placeholder="Nombre de la tarea"
              required
              className="border-[#E4E4E7]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc" className="text-sm font-medium text-[#09090B]">
              Descripción <span className="font-normal text-[#71717A]">(opcional)</span>
            </Label>
            <textarea
              id="task-desc"
              name="description"
              placeholder="Describe la tarea..."
              rows={3}
              className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] placeholder:text-[#A1A1AA] outline-none focus:ring-2 focus:ring-[#18181B] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-status" className="text-sm font-medium text-[#09090B]">
                Estado
              </Label>
              <select
                id="task-status"
                name="status"
                defaultValue="todo"
                className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-priority" className="text-sm font-medium text-[#09090B]">
                Prioridad
              </Label>
              <select
                id="task-priority"
                name="priority"
                defaultValue="medium"
                className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] outline-none focus:ring-2 focus:ring-[#18181B]"
              >
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due" className="text-sm font-medium text-[#09090B]">
              Fecha límite <span className="font-normal text-[#71717A]">(opcional)</span>
            </Label>
            <Input
              id="task-due"
              name="due_date"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              className="border-[#E4E4E7]"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="mt-2 w-full bg-[#18181B] text-white hover:bg-[#27272A]"
          >
            {pending ? 'Creando...' : 'Crear tarea'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
