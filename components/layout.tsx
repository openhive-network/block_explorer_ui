import { ReactElement } from "react";
import Footer from "./footer";
import Navbar from "./navbar";

interface LayoutProps {
  children: ReactElement;
}

export default function Layout ({children}: LayoutProps) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )

}