
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { IDELogo } from '@/components/ide-logo';
import { NavMenu } from '@/components/nav-menu';
import { ideNavItems } from '@/config/ide';
import { Button } from '@/components/ui/button';
import { UserCircle2, Settings, LogOutIcon } from 'lucide-react'; // Using LogOutIcon as LogOut may not exist

export default function IDEAppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <div className="group-data-[collapsible=icon]:hidden">
            <IDELogo />
          </div>
          <SidebarTrigger className="md:hidden" />
        </SidebarHeader>
        <SidebarContent>
          <NavMenu items={ideNavItems} />
        </SidebarContent>
        <SidebarFooter className="p-4 mt-auto border-t">
           <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
             <UserCircle2 className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
             <span className="group-data-[collapsible=icon]:hidden">User Profile</span>
           </Button>
           <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center">
             <Settings className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
             <span className="group-data-[collapsible=icon]:hidden">IDE Settings</span>
           </Button>
            <Button variant="ghost" className="w-full justify-start group-data-[collapsible=icon]:justify-center text-destructive hover:text-destructive hover:bg-destructive/10">
             <LogOutIcon className="h-5 w-5 mr-2 group-data-[collapsible=icon]:mr-0" />
             <span className="group-data-[collapsible=icon]:hidden">Exit IDE</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <div className="md:hidden">
            <SidebarTrigger />
          </div>
          {/* Breadcrumbs or current tool title could go here */}
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
