'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(50).trim(),
})

export async function login(_prev: unknown, formData: FormData) {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: 'Email o contraseña inválidos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    return { error: 'Credenciales incorrectas. Inténtalo de nuevo.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(_prev: unknown, formData: FormData) {
  const parsed = RegisterSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
  })

  if (!parsed.success) {
    return { error: 'Datos inválidos. Revisa los campos.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.displayName },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Ya existe una cuenta con ese email.' }
    }
    return { error: 'No se pudo crear la cuenta. Inténtalo de nuevo.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function loginWithGoogle() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) redirect('/login?error=oauth')
  if (data.url) redirect(data.url)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
