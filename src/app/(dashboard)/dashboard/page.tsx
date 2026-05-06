import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { FolderOpen, CheckSquare, Users, BrainCircuit } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? 'Usuario'
  const firstName = displayName.split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="flex flex-col min-h-svh">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E4E4E7] bg-white px-4">
        <SidebarTrigger className="cursor-pointer text-[#71717A] hover:text-[#09090B]" />
        <Separator orientation="vertical" className="h-4 bg-[#E4E4E7]" />
        <span className="text-sm font-medium text-[#09090B]">Dashboard</span>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 py-8 max-w-4xl">
        {/* Greeting */}
        <div className="mb-8 space-y-1">
          <h1 className="text-2xl font-semibold text-[#09090B] tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-[#71717A]">
            Aquí tienes un resumen de tu actividad
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
          {[
            { label: 'Proyectos activos', value: '0', icon: FolderOpen, color: 'text-[#2563EB]', bg: 'bg-blue-50' },
            { label: 'Tareas pendientes', value: '0', icon: CheckSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Miembros del workspace', value: '1', icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className="rounded-xl border border-[#E4E4E7] bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-[#71717A]">{label}</p>
                  <p className="text-2xl font-semibold text-[#09090B]">{value}</p>
                </div>
                <div className={`rounded-lg p-2 ${bg}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* AI CTA */}
        <div className="rounded-xl border border-[#E4E4E7] bg-[#18181B] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Agente IA listo para ayudarte
              </p>
              <p className="text-xs leading-relaxed text-[#A1A1AA]">
                Crea tareas, consulta el estado del proyecto y busca en tus documentos — todo con lenguaje natural.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
