import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex min-h-svh flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            FlowMind
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {profile?.display_name ?? user.email}
            </span>
            <form action={logout}>
              <Button variant="outline" size="sm" type="submit">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Bienvenido, {profile?.display_name ?? 'usuario'}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Auth funcionando correctamente. Próximo paso: workspaces y proyectos.
        </p>
      </main>
    </div>
  )
}
