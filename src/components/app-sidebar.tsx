'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BrainCircuit,
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  ChevronsUpDown,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logout } from '@/app/(auth)/actions'

interface AppSidebarProps {
  user: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
  }
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'Proyectos', icon: FolderOpen },
]

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <Sidebar collapsible="icon" className="border-r border-[#E4E4E7] bg-white">
      {/* Header — logo */}
      <SidebarHeader className="border-b border-[#E4E4E7] px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#18181B]">
                <BrainCircuit className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-[#09090B] tracking-tight">
                FlowMind
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-[#A1A1AA] px-2 mb-1">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={
                      pathname === href ||
                      (href !== '/dashboard' && pathname.startsWith(href))
                    }
                    className="cursor-pointer rounded-lg text-sm font-medium text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B] data-[active=true]:bg-[#F4F4F5] data-[active=true]:text-[#09090B]"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — user menu */}
      <SidebarFooter className="border-t border-[#E4E4E7] p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer rounded-lg data-[popup-open]:bg-[#F4F4F5]"
                  />
                }
              >
                <Avatar className="h-7 w-7 rounded-lg">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.displayName} />
                  <AvatarFallback className="rounded-lg bg-[#18181B] text-[10px] font-medium text-white">
                    {getInitials(user.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-left leading-tight">
                  <span className="truncate text-xs font-medium text-[#09090B]">
                    {user.displayName}
                  </span>
                  <span className="truncate text-[10px] text-[#71717A]">
                    {user.email}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-[#A1A1AA]" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="end"
                className="w-52 rounded-xl border-[#E4E4E7] bg-white text-sm shadow-lg"
              >
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[#3F3F46] focus:bg-[#F4F4F5] focus:text-[#09090B]"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <Settings className="h-3.5 w-3.5" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E4E4E7]" />
                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                  onClick={async () => { await logout() }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
