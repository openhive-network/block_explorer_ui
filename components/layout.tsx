import type { ReactNode } from 'react';
import Footer from "./footer";
import Navbar from "./navbar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout ({children}: LayoutProps) {
  return (
    <main className="flex flex-col min-h-screen justify-between items-center max-w-[100vw] overflow-x-hidden">
      <Navbar />
        {children}
      <Footer />
    </ main>
  )

}