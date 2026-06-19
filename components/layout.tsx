import type { ReactNode } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { Toaster } from "sonner";
import { useHiveChainContext } from "@/contexts/HiveChainContext";
import { useTheme } from "@/contexts/ThemeContext";
import WorkspaceRestorePrompt from "@/components/workspace/WorkspaceRestorePrompt";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { hiveChain } = useHiveChainContext();
  const { theme } = useTheme();
  if (!hiveChain) return null;
  return (
    <main className="flex flex-col min-h-screen justify-between items-center max-w-[100vw] mt-[72px] md:mt-20">
      <Navbar />
      {children}
      <Toaster
        richColors
        closeButton
        theme={theme === "dark" ? "dark" : "light"}
      />
      <WorkspaceRestorePrompt />
      <Footer />
    </main>
  );
}
