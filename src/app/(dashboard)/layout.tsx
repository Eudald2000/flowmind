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

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          id: user.id,
          email: user.email ?? '',
          displayName: profile?.display_name ?? user.email ?? 'Usuario',
          avatarUrl: profile?.avatar_url ?? null,
        }}
      />
      <SidebarInset className="bg-[#FAFAFA]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
