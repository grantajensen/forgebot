import { SupabaseProvider } from "@/providers/supabase-provider";
import { NavBar } from "@/components/nav-bar";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseProvider>
      <div className="min-h-screen bg-background">
        <NavBar />
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
      <Toaster richColors position="bottom-right" />
    </SupabaseProvider>
  );
}
