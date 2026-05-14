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
import { createProject } from './actions'

interface Props {
  workspaceId: string
  workspaceSlug: string
}

export function NewProjectSheet({ workspaceId, workspaceSlug }: Props) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createProject, null)

  useEffect(() => {
    // Close sheet after successful server action — valid external state sync
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state && 'success' in state) setOpen(false)
  }, [state])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-600">
        <Plus className="h-4 w-4" />
        Nuevo proyecto
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[#09090B]">Nuevo proyecto</SheetTitle>
          <SheetDescription className="text-[#71717A]">
            Crea un proyecto para organizar tareas con tu equipo.
          </SheetDescription>
        </SheetHeader>

        <form action={action} className="mt-6 flex flex-col gap-4 px-4">
          <input type="hidden" name="workspace_id" value={workspaceId} />
          <input type="hidden" name="workspace_slug" value={workspaceSlug} />

          {state && 'error' in state && state.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="proj-name" className="text-sm font-medium text-[#09090B]">
              Nombre
            </Label>
            <Input
              id="proj-name"
              name="name"
              placeholder="Mi Proyecto"
              required
              className="border-[#E4E4E7]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-desc" className="text-sm font-medium text-[#09090B]">
              Descripción <span className="font-normal text-[#71717A]">(opcional)</span>
            </Label>
            <textarea
              id="proj-desc"
              name="description"
              placeholder="Describe brevemente el proyecto..."
              rows={3}
              className="w-full rounded-lg border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#09090B] placeholder:text-[#A1A1AA] outline-none focus:ring-2 focus:ring-zinc-700 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="mt-2 w-full bg-zinc-700 text-white hover:bg-zinc-600"
          >
            {pending ? 'Creando...' : 'Crear proyecto'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
