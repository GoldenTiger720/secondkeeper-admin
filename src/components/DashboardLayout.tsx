import { MainNav } from "./MainNav";
import { Logo } from "./Logo";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="container py-4 md:py-6">{children}</div>
      </main>
      <footer className="py-4 md:py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-sm text-muted-foreground">
          <div className="flex items-center">
            <Logo className="scale-75" />
            <p className="ml-2">© 2025 All rights reserved.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-4">
            <a href="#" className="hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:underline">
              Terms of Service
            </a>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
