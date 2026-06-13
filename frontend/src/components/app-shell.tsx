import { useState, useEffect, createContext, useContext } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import {
  Home,
  Sparkles,
  Users,
  Target,
  Megaphone,
  LineChart,
  Bell,
  Search,
  Settings,
  CreditCard,
  LogOut,
  User,
  Check,
  Command as CmdIcon
} from "lucide-react";
import * as Popover from '@radix-ui/react-popover';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Command } from 'cmdk';
import { toast } from 'sonner';
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Overview", icon: Home },
  { to: "/ai-studio", label: "AI Campaign Studio", icon: Sparkles },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/segments", label: "Segments", icon: Target },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/analytics", label: "Analytics", icon: LineChart },
] as const;

export const WorkspaceContext = createContext<{ workspace: string; setWorkspace: (w: string) => void }>({
  workspace: "Production",
  setWorkspace: () => {},
});

export const useWorkspace = () => useContext(WorkspaceContext);

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const [openCommand, setOpenCommand] = useState(false);
  const [workspace, setWorkspace] = useState("Production");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenCommand((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { data: stats } = useQuery({
    queryKey: ['app-shell-stats', workspace],
    queryFn: async () => {
      const res = await api.get('/dashboard/overview');
      
      let data = res.data;
      if (workspace === "Staging") {
         data.activeCustomers = Math.floor(data.activeCustomers * 0.3);
      } else if (workspace === "Sandbox") {
         data.activeCustomers = 42;
      }
      return data;
    },
    refetchInterval: 30000
  });

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      <div className="flex h-screen w-full bg-[#000000] text-slate-300 font-sans selection:bg-white/20 relative overflow-hidden">
      {/* Pure Black Grid Background */}
      <div className="absolute inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#ffffff0a,transparent)]" />

      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-white/5 bg-[#000000]/50 backdrop-blur-xl z-20">
        <div className="flex h-14 items-center px-4 border-b border-white/5">
          <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-white text-black shadow-sm">
              <Sparkles className="h-3 w-3" />
            </div>
            <span className="text-base font-semibold text-white tracking-wide">XenoPilot</span>
            <span className="ml-1 text-sm font-mono text-white/40 bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-wider">OS</span>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-5 space-y-0.5 flex flex-col">
          <div className="px-3 text-sm font-bold text-white/30 mb-2 tracking-widest uppercase">Platform</div>
          {nav.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 group",
                  active
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/50 hover:bg-white/5 hover:text-white/90",
                ].join(" ")}
              >
                <Icon 
                  className={["h-4 w-4 flex-shrink-0 transition-colors", active ? "text-white" : "text-white/40 group-hover:text-white/70"].join(" ")} 
                  strokeWidth={active ? 2 : 1.5}
                />
                <span className="text-base font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-colors cursor-default">
            <div className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white/90 leading-tight">System Online</span>
              <span className="text-sm text-white/40 font-mono mt-0.5">{stats?.activeCustomers ? stats.activeCustomers.toLocaleString() : '...'} nodes active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 min-w-0 flex-col relative z-10 overflow-hidden bg-transparent">
        
        <header className="flex h-16 items-center justify-between gap-8 border-b border-white/5 bg-transparent px-8 backdrop-blur-md z-40 relative">
          <div 
            onClick={() => setOpenCommand(true)}
            className="flex-1 max-w-3xl flex items-center gap-2 text-sm text-white/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 rounded-xl px-3 py-2 border border-white/10 hover:border-white/20 cursor-pointer group shadow-inner ring-1 ring-white/5"
          >
            <Search className="h-4 w-4 text-white/30 group-hover:text-white/70 transition-colors shrink-0" />
            <div className="w-full text-white/30 font-medium text-sm text-left">Search customers, segments, campaigns...</div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-white/40 tracking-widest shrink-0">
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-[#111] border border-white/10 shadow-[0_2px_0_0_rgba(255,255,255,0.05)] text-white/50">⌘</span>
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded bg-[#111] border border-white/10 shadow-[0_2px_0_0_rgba(255,255,255,0.05)] text-white/50">K</span>
            </div>
          </div>
          
          <div className="flex items-center gap-5 shrink-0">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white/70 transition-colors cursor-pointer group outline-none">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></span>
                  </span>
                  Workspace: {workspace}
                  <svg className="w-3 h-3 text-white/40 group-hover:text-white/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-[200px] bg-[#0A0A0A] border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-2xl">
                  {["Production", "Staging", "Sandbox"].map(env => (
                    <DropdownMenu.Item 
                      key={env} 
                      onSelect={() => {
                        setWorkspace(env);
                        toast.success(`Switched to ${env} Workspace`, {
                          description: "Database connection established and synced."
                        });
                      }} 
                      className="flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg outline-none cursor-pointer"
                    >
                       {env}
                       {workspace === env && <Check className="w-4 h-4 text-emerald-400" />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
            
            <Popover.Root>
              <Popover.Trigger asChild>
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] transition-all relative cursor-pointer outline-none">
                  <Bell className="h-4 w-4 text-white/50 hover:text-white/90 transition-colors" />
                  <span className="absolute top-[8px] right-[9px] h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] border border-[#000000]"></span>
                </div>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content align="end" sideOffset={8} className="z-50 w-80 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden">
                   <div className="px-4 py-3 border-b border-white/5 font-semibold text-sm">Notifications</div>
                   <div className="p-2 flex flex-col gap-1">
                      <div className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-default">
                        <div className="text-xs text-rose-400 font-bold uppercase tracking-widest mb-1">Anomaly</div>
                        <div className="text-sm text-white/90">Reactivation drop-off detected in Segment A.</div>
                        <div className="text-[10px] text-white/40 mt-1">2 mins ago</div>
                      </div>
                      <div className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-default">
                        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-1">System</div>
                        <div className="text-sm text-white/90">Daily global analytics sync completed.</div>
                        <div className="text-[10px] text-white/40 mt-1">1 hour ago</div>
                      </div>
                   </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-emerald-400 p-[2px] cursor-pointer hover:shadow-[0_0_20px_rgba(167,139,250,0.4)] transition-all group outline-none">
                   <div className="h-full w-full rounded-full bg-[#050505] flex items-center justify-center text-[11px] font-bold text-white tracking-widest group-hover:bg-[#111] transition-colors">
                      SD
                   </div>
                </div>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-[200px] bg-[#0A0A0A] border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-2xl">
                   <div className="px-3 py-2 text-xs text-white/40 font-medium border-b border-white/5 mb-1">Signed in as sd@xenopilot.com</div>
                   <DropdownMenu.Item 
                      onSelect={() => toast("Profile settings opened")}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg outline-none cursor-pointer"
                   >
                      <User className="w-4 h-4" /> Profile
                   </DropdownMenu.Item>
                   <DropdownMenu.Item 
                      onSelect={() => toast("Account settings opened")}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg outline-none cursor-pointer"
                   >
                      <Settings className="w-4 h-4" /> Settings
                   </DropdownMenu.Item>
                   <DropdownMenu.Item 
                      onSelect={() => toast("Billing dashboard opened")}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg outline-none cursor-pointer"
                   >
                      <CreditCard className="w-4 h-4" /> Billing
                   </DropdownMenu.Item>
                   <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
                   <DropdownMenu.Item 
                      onSelect={() => toast("Logged out successfully")}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg outline-none cursor-pointer"
                   >
                      <LogOut className="w-4 h-4" /> Log out
                   </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </header>
        
        <main className="flex-1 min-w-0 p-8 overflow-y-auto relative z-10">
          <Outlet />
          {children}
        </main>
      </div>
      <Command.Dialog 
        open={openCommand} 
        onOpenChange={setOpenCommand}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      >
        <div className="w-full max-w-2xl bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <Command.Input 
            placeholder="What do you need?" 
            className="w-full bg-transparent px-5 py-4 text-lg text-white placeholder:text-white/30 outline-none border-b border-white/5"
          />
          <Command.List className="max-h-[60vh] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-white/40">No results found.</Command.Empty>
            
            <Command.Group heading="Navigation" className="text-xs font-bold text-white/30 px-2 py-1 uppercase tracking-widest">
              {nav.map(item => (
                <Command.Item 
                  key={item.to} 
                  onSelect={() => { navigate(item.to); setOpenCommand(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Quick Actions" className="text-xs font-bold text-white/30 px-2 pt-4 pb-1 uppercase tracking-widest">
              <Command.Item 
                onSelect={() => {
                  setOpenCommand(false);
                  toast("Creating new campaign...", { description: "Redirecting to AI Studio" });
                  setTimeout(() => navigate('/ai-studio'), 800);
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
              >
                <Megaphone className="w-4 h-4 text-emerald-400" />
                Create new campaign
              </Command.Item>
              <Command.Item 
                onSelect={() => {
                  setOpenCommand(false);
                  toast.success("AI Analysis Started", { description: "Running deep data scan on global metrics." });
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 aria-selected:bg-white/10 aria-selected:text-white cursor-pointer transition-colors"
              >
                <CmdIcon className="w-4 h-4 text-indigo-400" />
                Run global AI analysis
              </Command.Item>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </div>
    </WorkspaceContext.Provider>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-base text-muted-foreground mt-0.5">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
