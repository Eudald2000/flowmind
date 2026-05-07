import { redirect } from 'next/navigation'
import { BrainCircuit } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OnboardingForm } from './onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('workspaces(slug)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (membership?.workspaces) {
    const ws = membership.workspaces as { slug: string }
    redirect(`/workspace/${ws.slug}`)
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[#FAFAFA] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#18181B]">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-[#09090B] tracking-tight">
              Crea tu workspace
            </h1>
            <p className="text-sm text-[#71717A]">
              Un workspace agrupa todos tus proyectos y miembros del equipo.
            </p>
          </div>
        </div>
        <OnboardingForm />
      </div>
    </div>
  )
}
