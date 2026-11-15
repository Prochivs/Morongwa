import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "aos/dist/aos.css";
import "./globals.css";

export const metadata: Metadata = { title: { default: "QueueMate — We Queue. You Save Time.", template: "%s | QueueMate" }, description: "Professional queue assistance in Gaborone, Botswana, subject to institutional rules and availability." };

const themeScript = `
  (function () {
    try {
      var saved = localStorage.getItem("queuemate-theme");
      var dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
    } catch (_) {}
  })();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><Providers>{children}</Providers></body></html>;
}
