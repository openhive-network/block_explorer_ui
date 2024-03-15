import type { ReactNode } from "react";
import Footer from "./footer";
import Navbar from "./navbar";
import { Toaster } from "sonner";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main className="flex flex-col min-h-screen justify-between items-center max-w-[100vw] mt-16 md:mt-20">
      <Navbar />
      {children}
      <Toaster richColors/>
      <Footer />
    </main>
  );
}
