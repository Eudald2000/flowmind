'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWorkspace } from './actions'

function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export function OnboardingForm() {
  const [state, action, pending] = useActionState(createWorkspace, null)
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugEdited) setSlug(toSlug(e.target.value))
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlugEdited(true)
    setSlug(toSlug(e.target.value))
  }

  return (
    <form action={action} className="space-y-4 rounded-xl border border-[#E4E4E7] bg-white p-6">
      {state?.error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-sm font-medium text-[#09090B]">
          Nombre del workspace
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Mi Empresa"
          required
          onChange={handleNameChange}
          className="border-[#E4E4E7] focus-visible:ring-[#18181B]"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug" className="text-sm font-medium text-[#09090B]">
          URL del workspace
        </Label>
        <div className="flex items-center rounded-lg border border-[#E4E4E7] bg-[#FAFAFA] px-3 focus-within:outline-none focus-within:ring-2 focus-within:ring-[#18181B]">
          <span className="shrink-0 select-none text-sm text-[#71717A]">workspace/</span>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={handleSlugChange}
            placeholder="mi-empresa"
            required
            className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#09090B] outline-none placeholder:text-[#A1A1AA]"
          />
        </div>
        <p className="text-xs text-[#71717A]">Solo letras minúsculas, números y guiones.</p>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-[#18181B] text-white hover:bg-[#27272A]"
      >
        {pending ? 'Creando...' : 'Crear workspace'}
      </Button>
    </form>
  )
}
