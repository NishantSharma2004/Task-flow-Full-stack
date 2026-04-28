import { LayoutDashboard, ListTodo, CalendarDays, BarChart3, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Dashboard", url: "/",          icon: LayoutDashboard },
  { title: "Tasks",     url: "/tasks",     icon: ListTodo },
  { title: "Calendar",  url: "/calendar",  icon: CalendarDays },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

interface AppSidebarProps {
  onLogout?: () => void;
}

export function AppSidebar({ onLogout }: AppSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  // Read user name from localStorage for the profile chip
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("tf_user") || "{}"); }
    catch { return {}; }
  })();

  const displayName  = user.name  || "User";
  const displayEmail = user.email || user.phone || "";
  const initials     = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <Sidebar collapsible="icon">
      {/* ── Top: Logo ─────────────────────────────────────────────── */}
      <SidebarContent>
        <div className={`px-4 py-6 ${collapsed ? "px-2" : ""}`}>
          <h1 className={`font-display font-bold text-sidebar-primary ${collapsed ? "text-center text-lg" : "text-xl"}`}>
            {collapsed ? "⚡" : "TaskFlow"}
          </h1>
        </div>

        {/* ── Nav items ─────────────────────────────────────────────── */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Bottom: User profile + Logout ─────────────────────────── */}
      <SidebarFooter className="border-t border-sidebar-border">
        {/* User profile chip */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</p>
              {displayEmail && (
                <p className="text-xs text-muted-foreground truncate">{displayEmail}</p>
              )}
            </div>
          </div>
        )}

        {/* Logout button */}
        <SidebarMenu className="pb-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              className="hover:bg-red-500/10 hover:text-red-500 text-muted-foreground cursor-pointer w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
