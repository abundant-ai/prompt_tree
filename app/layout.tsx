import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { NavBar } from "./components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <NavBar />
          <SignedIn>
            <main>{children}</main>
          </SignedIn>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
