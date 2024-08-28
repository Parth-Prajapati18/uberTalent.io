"use client";

import AccountRemovedBanner from "@/app/components/ui/banners/AccountRemovedBanner";
import { ClerkProvider } from "@clerk/nextjs";

export default function GeneralPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AccountRemovedBanner />
      <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
        <div className="flex justify-center min-h-screen">
          <ClerkProvider>{children}</ClerkProvider>
        </div>
      </div>
    </>
  );
}
