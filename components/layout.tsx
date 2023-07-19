import { ReactElement } from "react";
import Footer from "./footer";
import Navbar from "./navbar";

interface LayoutProps {
  children: ReactElement;
}

export default function Layout ({children}: LayoutProps) {
  return (
    <main className="flex flex-col min-h-screen justify-between items-center">
      <Navbar />
        {children}
      <Footer />
    </ main>
  )

}