"use client";
import FreelancerSlideOver from "@/app/components/FreelancerSlideOver";
import Navbar from "@/app/components/ui/nav/Navbar";
import Loader from "@/app/components/ui/shared/Loader";
import FreelancerSlideOverProvider from "@/app/providers/FreelancerSlideOverProvider";
import UserProvider, { useUserContext } from "@/app/providers/UserProvider";

import { usePathname, useRouter } from "next/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { AlertProvider } from "@/app/providers/AlertProvider";
import { classNames } from "@/app/utils";
import { Provider } from "react-redux";
import { store } from "./messages/store";
import MessagesProvider from "@/app/providers/MessagesProvider";
import ProfileBanner from "@/app/components/ui/banners/ProfileBanner";
import { Suspense } from "react";
import JobDetailSlideout from "./job/search/JobDetailSlideout";
import AccountOnHoldBanner from "@/app/components/ui/banners/AccountOnHoldBanner";
import { NotificationProvider } from "@/app/providers/NotificationProvider";
import HiredForJobBannerProvider from "@/app/providers/HiredForJobBannerProvider";

export default function AuthenticatedPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  console.log(pathname);

  // if (status === "loading") {
  //   return (
  //     <div className="h-screen w-full flex justify-center items-center">
  //       <Loader />
  //     </div>
  //   );
  // }

  // if (status === "unauthenticated") {
  //   router.replace("/auth/login");
  // }

  return (
    <Provider store={store}>
      <ClerkProvider>
        <FreelancerSlideOverProvider>
          <UserProvider>
            <MessagesProvider>
              <NotificationProvider>
                <AlertProvider>
                  <Navbar />
                  <HiredForJobBannerProvider>
                    <ProfileBanner />
                    <AccountOnHoldBanner />
                    <div
                      className={classNames(
                        pathname?.includes("messages")
                          ? ""
                          : "mt-4 lg:mt-12 p-6 lg:px-8 max-w-6xl mx-auto"
                      )}
                    >
                      {children}
                    </div>
                  </HiredForJobBannerProvider>
                </AlertProvider>
              </NotificationProvider>
            </MessagesProvider>
            <Suspense>
              <JobDetailSlideout />
            </Suspense>
          </UserProvider>
          <Suspense>
            <FreelancerSlideOver />
          </Suspense>
        </FreelancerSlideOverProvider>
      </ClerkProvider>
    </Provider>
  );
}
