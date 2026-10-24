import type { ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { ChatWidget } from "@/components/layout/chat-widget";
import { CommandMenu } from "@/components/shared/command-menu";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-full bg-background flex flex-col justify-between overflow-x-hidden text-foreground">
      <div className="w-full">
        <Navbar />
        <main className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1840px] min-w-0 px-4 pt-4 pb-16 sm:px-6 sm:pt-6 lg:px-8 xl:px-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Institutional Academic Footer matching generated UI */}
      <footer className="w-full border-t border-border/70 bg-card/60 backdrop-blur-sm py-6 mt-16 text-xs text-muted-foreground">
        <div className="mx-auto flex w-full max-w-[1720px] 2xl:max-w-[1840px] flex-col md:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex flex-wrap items-center gap-2.5 text-center md:text-left">
            <span className="font-bold text-foreground tracking-tight">LibrisAI</span>
            <span className="text-border">|</span>
            <span className="font-medium">Academic Repository</span>
            <span className="hidden lg:inline ml-3 text-muted-foreground/80">
              © 2026 LibrisAI Academic Repository. Open Knowledge Initiative. All rights reserved.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Access
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Open Repository Protocol
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Citation Index
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Ethics & Privacy
            </Link>
            <Link href="/admin" className="font-semibold text-primary hover:underline transition-colors">
              Librarian Portal
            </Link>
          </div>
        </div>
      </footer>

      <ChatWidget />
      <CommandMenu />
    </div>
  );
}
