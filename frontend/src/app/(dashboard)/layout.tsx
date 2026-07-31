import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8FBFD] dark:bg-slate-900">
      <Sidebar />
      {/* Spacer that reserves collapsed-sidebar width in the flex flow */}
      <div className="w-16 shrink-0 flex-none" aria-hidden="true" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#F8FBFD] dark:bg-slate-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
