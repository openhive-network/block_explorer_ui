import { ClientProviders } from "@/components/clientProviders";
import { siteConfig } from "@/utils/seo";

export const metadata = {
  title: siteConfig.name,
  description: "",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
