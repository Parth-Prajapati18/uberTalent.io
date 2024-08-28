"use client";
import { useEffect, useState } from "react";
import {
  BellIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  FingerPrintIcon,
  PhotoIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/app/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { disable } from "mixpanel-browser";
import CompleteProfileProgress from "@/app/components/ui/shared/CompleteProfileProgress";
import { useUserContext } from "@/app/providers/UserProvider";
import { getStripeConnectAccount } from "@/app/lib/api";

const navigation = [
  {
    name: "Account",
    href: "/settings/freelancer",
    icon: Cog6ToothIcon,
    disabled: false,
  },
  {
    name: "Your Profile",
    href: "/settings/freelancer/profile",
    icon: UserCircleIcon,
    disabled: false,
  },
  // {
  //   name: "Notifications",
  //   href: "/settings/freelancer/notifications",
  //   icon: BellIcon,
  //   disabled: true,
  // },
  // {
  //   name: "Payouts",
  //   href: "/settings/freelancer/payments",
  //   icon: CreditCardIcon,
  //   disabled: true,
  // },
  // {
  //   name: "Password & Security",
  //   href: "/settings/freelancer/security",
  //   icon: FingerPrintIcon,
  //   disabled: false,
  // },
];

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, userType } = useUserContext();
  const [userInfo, setUserInfo] = useState(user);

  if (userType === "FREELANCER") {
    const index = navigation.findIndex((n: any) => n.name === "Portfolio");
    if (index === -1) {
      navigation.push({
        name: "Portfolio",
        href: "/settings/freelancer/portfolio",
        icon: PhotoIcon,
        disabled: false,
      });
    }
  }

  if (userType && process.env.NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED === "true") {
    const index = navigation.findIndex((n: any) => n.name === "Payouts");
    if (index === -1) {
      navigation.push({
        name: "Payouts",
        href: "/settings/freelancer/payments",
        icon: CreditCardIcon,
        disabled: false,
      });
    }
  }

  useEffect(() => {
    const { freelancerProfile }: any = user;

    const getData = async () => {
      try {
        if (freelancerProfile?.stripe_acct_id) {
          const acctInfo = await getStripeConnectAccount(
            freelancerProfile?.stripe_acct_id
          );
          if (acctInfo) {
            freelancerProfile.account_charges_enabled =
              acctInfo.account_charges_enabled;
          }
        }
        setUserInfo(user);
      } catch (err) {
        console.log(err);
      } finally {
      }
    };

    getData();
  }, [user]);

  return (
    <>
      <div className="mx-auto max-w-7xl lg:flex lg:gap-x-8">
        <aside className="flex-none overflow-x-auto border-b border-gray-900/5 py-2 lg:block lg:w-44 lg:max-w-44 lg:min-w-44 lg:border-0">
          <nav className="flex-none px-4 sm:px-6 lg:px-0">
            <ul
              role="list"
              className="flex gap-x-3 gap-y-1 whitespace-nowrap lg:flex-col"
            >
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.disabled ? "" : item.href}
                    className={classNames(
                      pathname === item.href
                        ? "bg-gray-50 text-black"
                        : "text-gray-700  ",
                      item.disabled
                        ? "hover:text-gray-600 cursor-not-allowed"
                        : "hover:text-black hover:bg-gray-50",
                      "group flex gap-x-3 rounded-md py-2 pl-2 pr-3 text-sm leading-6 font-semibold"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        pathname === item.href
                          ? "text-black"
                          : "text-gray-400 ",
                        item.disabled ? "" : "group-hover:text-black",
                        "h-6 w-6 shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="block lg:hidden mt-4">
          <CompleteProfileProgress userInfo={userInfo} />
        </div>
        <main className="px-4 py-2 sm:px-6 lg:flex-auto lg:px-0">
          {children}
        </main>
        <div className="hidden lg:block lg:w-72 lg:max-w-72 lg:min-w-72">
          <CompleteProfileProgress userInfo={userInfo} />
        </div>
      </div>
    </>
  );
}
