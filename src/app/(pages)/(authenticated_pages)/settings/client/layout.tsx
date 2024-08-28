"use client";
import { useState } from "react";
import {
  BellIcon,
  CreditCardIcon,
  FingerPrintIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/app/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Account", href: "/settings/client", icon: UserCircleIcon, disabled: false },

  // {
  //   name: "Notifications",
  //   href: "/settings/client/notifications",
  //   icon: BellIcon,
  //   disabled: true,
  // },
  // {
  //   name: "Payments",
  //   href: "/settings/client/payments",
  //   icon: CreditCardIcon,
  // },
  // {
  //   name: "Password & Security",
  //   href: "/settings/client/security",
  //   icon: FingerPrintIcon,
  //   disabled: false,
  // },
];
if (process.env.NEXT_PUBLIC_FEATURE_PAYMENTS_ENABLED === "true") {
  navigation.push({
    name: "Payments",
    href: "/settings/client/payments",
    icon: CreditCardIcon,
    disabled: false,
  });
}

export default function SettingsPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <>
      <div className="mx-auto max-w-7xl lg:flex lg:gap-x-16">
        <aside className="flex overflow-x-auto border-b border-gray-900/5 py-2 lg:block lg:w-64 lg:flex-none lg:border-0">
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

        <main className="px-4 py-2 sm:px-6 lg:flex-auto lg:px-0">
          {children}
        </main>
      </div>
    </>
  );
}
