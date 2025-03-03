"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create an instance of QueryClient with options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Retry failed queries 2 times
      refetchOnWindowFocus: false, // Don't refetch queries on window focus
    },
    mutations: {
      retry: 2, // Retry failed mutations 2 times
    },
  },
});

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
