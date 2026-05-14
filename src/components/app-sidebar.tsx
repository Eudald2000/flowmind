'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BrainCircuit,
  LayoutDashboard,
  FolderOpen,
  Settings,
  LogOut,
  ChevronsUpDown,
  ChevronRight,
  Check,
  Plus,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { logout } from '@/app/(auth)/actions'
import { NewWorkspaceSheet } from '@/components/workspaces/new-workspace-sheet'
import { deleteWorkspace } from '@/app/(dashboard)/workspace/[slug]/actions'

interface AppSidebarProps {
  user: {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
  }
  workspace: {
    id: string
    name: string
    slug: string
    role: string
  }
  workspaces: {
    id: string
    name: string
    slug: string
    role: string
  }[]
  projects: {
    id: string
    name: string
  }[]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AppSidebar({ user, workspace, workspaces, projects }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [newWorkspaceOpen, setNewWorkspaceOpen] = useState(false)
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false)
  const [confirmDeleteWorkspace, setConfirmDeleteWorkspace] = useState(false)
  const [isDeletingWorkspace, startDeleteWorkspace] = useTransition()

  const activeWorkspace =
    workspaces.find((ws) => pathname.startsWith(`/workspace/${ws.slug}`)) ?? workspace

  return (
    <Sidebar collapsible="icon" className="border-r border-[#E4E4E7] bg-white">
      {/* Header — logo + workspace switcher */}
      <SidebarHeader className="border-b border-[#E4E4E7] px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton size="lg" className="cursor-pointer data-[popup-open]:bg-[#F4F4F5]" />}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#18181B]">
                  <BrainCircuit className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-[#09090B] tracking-tight">
                    FlowMind
                  </span>
                  <span className="text-[10px] text-[#71717A] truncate max-w-28">
                    {activeWorkspace.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-[#A1A1AA]" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="bottom"
                align="start"
                className="w-56 rounded-xl border-[#E4E4E7] bg-white text-sm shadow-lg"
              >
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    className="cursor-pointer gap-2 text-[#3F3F46] focus:bg-[#F4F4F5] focus:text-[#09090B]"
                    onClick={() => router.push(`/workspace/${ws.slug}`)}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F4F4F5] text-[10px] font-semibold text-[#71717A]">
                      {ws.name[0].toUpperCase()}
                    </div>
                    <span className="flex-1 truncate">{ws.name}</span>
                    {ws.id === activeWorkspace.id && (
                      <Check className="h-3.5 w-3.5 text-[#09090B]" />
                    )}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator className="bg-[#E4E4E7]" />

                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-[#3F3F46] focus:bg-[#F4F4F5] focus:text-[#09090B]"
                  onClick={() => setNewWorkspaceOpen(true)}
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#F4F4F5]">
                    <Plus className="h-3 w-3 text-[#71717A]" />
                  </div>
                  Nuevo workspace
                </DropdownMenuItem>

                {activeWorkspace.role === 'owner' && (
                  <>
                    <DropdownMenuSeparator className="bg-[#E4E4E7]" />
                    <DropdownMenuItem
                      className="cursor-pointer gap-2 text-red-600 focus:bg-red-50 focus:text-red-600"
                      onClick={() => setDeleteWorkspaceOpen(true)}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-red-50">
                        <LogOut className="h-3 w-3 text-red-500" />
                      </div>
                      Eliminar workspace
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <NewWorkspaceSheet open={newWorkspaceOpen} onOpenChange={setNewWorkspaceOpen} />

        {/* Delete workspace confirmation sheet — only mounted for owners */}
        {activeWorkspace.role === 'owner' && (
          <Sheet open={deleteWorkspaceOpen} onOpenChange={(v) => { setDeleteWorkspaceOpen(v); if (!v) setConfirmDeleteWorkspace(false) }}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-[#09090B]">Eliminar workspace</SheetTitle>
                <SheetDescription className="text-[#71717A]">
                  Elimina permanentemente <span className="font-medium text-[#09090B]">{activeWorkspace.name}</span> y todo su contenido.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 px-4 space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-y-1">
                  <p className="font-medium">Esta acción no se puede deshacer.</p>
                  <p className="text-red-600">Se eliminarán todos los proyectos, tareas y miembros del workspace.</p>
                </div>

                {!confirmDeleteWorkspace ? (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteWorkspace(true)}
                    className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 border border-red-200"
                  >
                    Quiero eliminar este workspace
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-[#71717A] text-center">¿Estás seguro? Esta acción es irreversible.</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteWorkspace(false)}
                        disabled={isDeletingWorkspace}
                        className="flex-1 rounded-lg border border-[#E4E4E7] bg-white px-3 py-1.5 text-sm text-[#09090B] hover:bg-[#F4F4F5] disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        disabled={isDeletingWorkspace}
                        onClick={() => {
                          startDeleteWorkspace(async () => {
                            const result = await deleteWorkspace(activeWorkspace.id)
                            if (result?.error) toast.error(result.error)
                          })
                        }}
                        className="flex-1 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {isDeletingWorkspace ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-[#A1A1AA] px-2 mb-1">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/dashboard" />}
                  isActive={pathname === '/dashboard'}
                  className="cursor-pointer rounded-lg text-sm font-medium text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B] data-[active=true]:bg-[#F4F4F5] data-[active=true]:text-[#09090B]"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href={`/workspace/${workspace.slug}`} />}
                  isActive={pathname === `/workspace/${workspace.slug}`}
                  className="cursor-pointer rounded-lg text-sm font-medium text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B] data-[active=true]:bg-[#F4F4F5] data-[active=true]:text-[#09090B]"
                >
                  <FolderOpen className="h-4 w-4 shrink-0" />
                  <span>Proyectos</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects list */}
        {projects.length > 0 && (
          <SidebarGroup className="mt-2">
            <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-widest text-[#A1A1AA] px-2 mb-1">
              Recientes
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      render={<Link href={`/project/${project.id}`} />}
                      isActive={pathname === `/project/${project.id}`}
                      className="cursor-pointer rounded-lg text-sm text-[#3F3F46] transition-colors hover:bg-[#F4F4F5] hover:text-[#09090B] data-[active=true]:bg-[#F4F4F5] data-[active=true]:text-[#09090B]"
                    >
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#A1A1AA]" />
                      <span className="truncate">{project.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
                  onClick={() => router.push('/settings')}
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
