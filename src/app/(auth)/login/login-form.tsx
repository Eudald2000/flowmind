'use client'

import { use, useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { login, loginWithGoogle } from '../actions'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = use(searchParams)
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <div className="space-y-5">
      {/* Google OAuth */}
      <form action={loginWithGoogle}>
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-lg border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-medium text-[#09090B] transition-colors hover:bg-[#F4F4F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
        >
          <GoogleIcon />
          Continuar con Google
        </button>
      </form>

      <div className="flex items-center gap-3">
        <Separator className="flex-1 bg-[#E4E4E7]" />
        <span className="text-xs text-[#71717A]">o continúa con email</span>
        <Separator className="flex-1 bg-[#E4E4E7]" />
      </div>

      {/* Email/password */}
      <form action={formAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-medium text-[#3F3F46]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            required
            className="h-10 border-[#E4E4E7] bg-white text-sm placeholder:text-[#A1A1AA] focus-visible:ring-[#2563EB]"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-medium text-[#3F3F46]">
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="h-10 border-[#E4E4E7] bg-white text-sm placeholder:text-[#A1A1AA] focus-visible:ring-[#2563EB]"
          />
        </div>

        {(state?.error || params.error) && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
            <p className="text-xs text-red-600">
              {state?.error ?? 'Error de autenticación. Inténtalo de nuevo.'}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  )
}
