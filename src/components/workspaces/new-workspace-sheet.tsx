'use client'

import { useActionState, useState } from 'react'
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
import { createWorkspace } from '@/app/onboarding/actions'

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'workspace'
  )
}

interface Props {
  /** If provided the sheet is controlled externally (no trigger rendered) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NewWorkspaceSheet({ open, onOpenChange }: Props) {
  const [name, setName] = useState('')
  const [state, action, pending] = useActionState(createWorkspace, null)
  const controlled = open !== undefined

  const slug = generateSlug(name)

  return (
    <Sheet open={controlled ? open : undefined} onOpenChange={onOpenChange}>
      {!controlled && (
        <SheetTrigger className="inline-flex items-center gap-2 rounded-lg bg-[#18181B] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#27272A]">
          <Plus className="h-4 w-4" />
          Nuevo workspace
        </SheetTrigger>
      )}

      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-[#09090B]">Nuevo workspace</SheetTitle>
          <SheetDescription className="text-[#71717A]">
            Crea un espacio de trabajo para un equipo o proyecto.
          </SheetDescription>
        </SheetHeader>

        <form action={action} className="mt-6 flex flex-col gap-4 px-4">
          <input type="hidden" name="slug" value={slug} />

          {state && 'error' in state && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-sm font-medium text-[#09090B]">
              Nombre
            </Label>
            <Input
              id="ws-name"
              name="name"
              placeholder="Mi equipo"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-[#E4E4E7]"
            />
            {name && (
              <p className="text-[11px] text-[#A1A1AA]">
                URL: <span className="font-mono">/workspace/{slug}</span>
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={pending || !name.trim()}
            className="mt-2 w-full bg-[#18181B] text-white hover:bg-[#27272A]"
          >
            {pending ? 'Creando...' : 'Crear workspace'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
