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

  const [{ data: profile }, { data: memberships }] = await Promise.all([
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),
    supabase
      .from('workspace_members')
      .select('workspace_id, role, workspaces(id, name, slug)')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true }),
  ])

  const workspaces = (memberships ?? [])
    .map((m) => {
      const ws = m.workspaces as { id: string; name: string; slug: string } | null
      if (!ws) return null
      return { ...ws, role: m.role as string }
    })
    .filter((w): w is { id: string; name: string; slug: string; role: string } => w !== null)

  if (!workspaces.length) redirect('/onboarding')

  const workspace = workspaces[0]

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
        workspaces={workspaces}
        projects={projects ?? []}
      />
      <SidebarInset className="bg-[#FAFAFA]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
