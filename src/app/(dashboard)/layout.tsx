import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),
    supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name, slug)')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle(),
  ])

  if (!membership?.workspaces) redirect('/onboarding')

  const workspace = membership.workspaces as { id: string; name: string; slug: string }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name')
    .eq('workspace_id', workspace.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: user.id,
          email: user.email ?? '',
          displayName: profile?.display_name ?? user.email ?? 'Usuario',
          avatarUrl: profile?.avatar_url ?? null,
        }}
        workspace={workspace}
        projects={projects ?? []}
      />
      <SidebarInset className="bg-[#FAFAFA]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
