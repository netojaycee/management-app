import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/local/sidebar/AdminSidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="bg-gray-100">
      <AdminSidebar />
      <SidebarTrigger />

      <main className="flex-1 px-4 py-8 ">{children}</main>
    </SidebarProvider>
  );
}
