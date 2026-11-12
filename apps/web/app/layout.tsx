import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = { title: { default: "QueueMate — We Queue. You Save Time.", template: "%s | QueueMate" }, description: "Professional queue assistance in Gaborone, Botswana, subject to institutional rules and availability." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers>{children}</Providers></body></html>;
}
