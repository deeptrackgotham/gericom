// app/ClientProviders.tsx
"use client";

import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { CartProvider } from "./CartProvider";
import { WishlistProvider } from "./WishlistProvider";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must be present in .env (NEXT_PUBLIC_ prefix)
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      frontendApi={process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}
    >
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </ClerkProvider>
  );
}
