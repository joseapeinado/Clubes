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
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  Settings,
  Trophy,
  Calendar,
  CreditCard,
  FileText,
  LogOut
} from "lucide-react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { Role } from "@prisma/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export async function AppSidebar() {
  const session = await auth()
  const user = session?.user
  const role = user?.role as Role | undefined

  // Define menus based on role
  const menus = []

  // Overview is for everyone
  menus.push({
    title: "General",
    items: [
      { title: "Panel Principal", url: "/dashboard", icon: LayoutDashboard },
    ]
  })

  if (role === Role.SUPER_ADMIN) {
    menus.push({
      title: "Administración",
      items: [
        { title: "Clubes", url: "/dashboard/clubs", icon: Trophy },
        { title: "Usuarios", url: "/dashboard/users", icon: Users },
        { title: "Configuración", url: "/dashboard/settings", icon: Settings },
      ]
    })
  }

  if (role === Role.CLUB_ADMIN) {
    menus.push({
      title: "Gestión",
      items: [
        { title: "Disciplinas", url: "/dashboard/disciplines", icon: Trophy },
        { title: "Categorías", url: "/dashboard/categories", icon: Trophy }, // Maybe sub-item?
        { title: "Profesores", url: "/dashboard/professors", icon: Users },
        { title: "Alumnos", url: "/dashboard/students", icon: Users },
      ]
    })
    menus.push({
      title: "Finanzas",
      items: [
        { title: "Pagos", url: "/dashboard/payments", icon: CreditCard },
        { title: "Reportes", url: "/dashboard/reports", icon: FileText },
      ]
    })
  }

  if (role === Role.PROFESSOR) {
    menus.push({
      title: "Académico",
      items: [
        { title: "Mis Clases", url: "/dashboard/classes", icon: Calendar },
        { title: "Alumnos", url: "/dashboard/my-students", icon: Users },
      ]
    })
  }

  if (role === Role.STUDENT) {
    menus.push({
      title: "Mi Club",
      items: [
        { title: "Mis Clases", url: "/dashboard/enrollments", icon: Calendar },
        { title: "Pagos", url: "/dashboard/my-payments", icon: CreditCard },
      ]
    })
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            C
          </div>
          <span className="font-bold">Clubes App</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {menus.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {(user?.name || 'U').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs">{role}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="top" align="end" sideOffset={4}>
                <form action={async () => {
                  "use server"
                  await signOut()
                }}>
                  <button className="w-full text-left" type="submit">
                    <DropdownMenuItem>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
