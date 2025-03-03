import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import QueryProvider from "@/lib/QueryProvider";
import ReduxProvider from "@/lib/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Employee Management App",
  description: "An application used to manage employee activities in a firm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <QueryProvider>
          {children}
          <Toaster richColors closeButton />
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryProvider> */}
        <ReduxProvider>

          {children}
        </ReduxProvider>{" "}
        <Toaster richColors closeButton />{" "}
      </body>
    </html>
  );
}
