"use client";
import React, { Fragment, useEffect, useState, FormEvent } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/app/utils";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  UserButton,
  SignOutButton,
  //UserProfile,
  //useUser,
} from "@clerk/nextjs";
import { useUserContext } from "@/app/providers/UserProvider";
import SearchHandler from "../../search/SearchHandler";

import { useSelector } from "react-redux";
import { AppState } from "@/app/(pages)/(authenticated_pages)/messages/store";

declare const Intercom: any;

const menuItems = {
  freelancer: [
    { name: "Settings", href: "/settings/freelancer" },
    // { name: "Client Dashboard", href: "/client-dashboard" },
    // { name: "Security-temp", href: "/clerk-profile" },
  ],
  client: [
    { name: "Settings", href: "/settings/client" },
    // { name: "Freelancer Dashboard", href: "/freelancer-dashboard" },
    // { name: "Security-temp", href: "/clerk-profile" },
  ],
};

type HeaderTab = {
  name: string;
  href: string;
};

export type SearchBarType = {
  placeholder: string;
  handleSubmit?: (e: FormEvent<HTMLFormElement> | string) => void;
};
const freelancerHeaderTabs: HeaderTab[] =
  [
    { name: "Dashboard", href: "/freelancer-dashboard" },
    { name: "Find Work", href: "/job/search" },
    { name: "Timesheets", href: "/timesheets/freelancer" },
    { name: "Messages", href: "/messages" },
  ] 
const clientHeaderTabs: HeaderTab[] =
  [
    { name: "Dashboard", href: "/client-dashboard" },
    { name: "Find Talent", href: "/client-dashboard/freelancer/search" },
    { name: "Timesheets", href: "/timesheets/client?contractId=All" },
    { name: "Messages", href: "/messages" },
  ] 

const SignOutBtnWithRef = React.forwardRef((props: any, ref) => (
  <SignOutButton
  redirectUrl="/"
    // signOutCallback={() => {
    //   props.router.push("/");
    // }}
  >
    <button
      type="button"
      className={classNames(
        props.active ? "bg-gray-100" : "",
        "block px-4 py-2 text-sm text-gray-700 w-full text-left"
      )}
    >
      Sign out
    </button>
  </SignOutButton>
));

SignOutBtnWithRef.displayName = "SignOutBtnWithRef";

export default function Navbar() {
  const { user, userType } = useUserContext();
  //const {isLoaded, user } = useUser();
  const path = usePathname();
  const router = useRouter();
  const [tabsToDisplay, setTabsToDisplay] = useState<HeaderTab[]>([]);
  const [logoHref, setLogoHref] = useState<string>("/");

  const showProfile =
    !path.includes("onboarding") && !path.includes("account-type");

  const isClientProfile = userType === "CLIENT";
  const isFreelancerProfile = userType == "FREELANCER";
  //const isClientProfile = path.includes("client") || (path.includes("job") && !path.includes("job/search"));

  useEffect(() => {
    if (isClientProfile) {
      setTabsToDisplay(clientHeaderTabs);
      setLogoHref("/client-dashboard");
    } else if (isFreelancerProfile) {
      setTabsToDisplay(freelancerHeaderTabs);
      setLogoHref("/freelancer-dashboard");
    } else {
      setTabsToDisplay([]);
    }
  }, [isClientProfile, isFreelancerProfile]);

  const pathname = usePathname();
  const unreadMessages = useSelector((state: AppState) => state.unreadMessages);
  const unreadMessagesCount =
    unreadMessages && typeof unreadMessages === "object"
      ? Object.values(unreadMessages)?.reduce((acc, curr) => (acc += curr), 0)
      : 0;

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex w-5/6">
                <Link
                  href={logoHref}
                  className="flex flex-shrink-0 items-center"
                >
                  <Image
                    src="/logos/UberTalent.svg"
                    alt="UberTalent"
                    height={220}
                    width={40}
                    className="h-10 w-auto"
                  />
                </Link>
                {showProfile && (
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {tabsToDisplay.map((tab) => (
                      <Link
                        href={tab.href}
                        className={classNames(
                          "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium",
                          path === `${tab.href}`
                            ? "border-black text-black"
                            : "border-transparent text-black hover:border-gray-500 hover:text-gray-500"
                        )}
                        key={tab.name}
                      >
                        {tab.name}{" "}
                        {tab.name === "Messages" && unreadMessagesCount ? (
                          <span className="bg-red-600 text-white ml-2 text-xs h-5 w-5 rounded-2xl flex justify-center items-center">
                            {unreadMessagesCount}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {showProfile && (
                <div className="hidden sm:ml-6 sm:flex sm:items-center flex-grow w-1/4 justify-end">
                  {/* <SearchBar {...searchBarData} /> */}
                  {/* <SearchHandler /> */}
                  {isClientProfile && (
                    <Link
                      href="/job/add"
                      className="mx-2 inline-flex items-center rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                      Post Job
                    </Link>
                  )}
                  <a
                    href="https://docs.ubertalent.io"
                    target="_blank"
                    className="relative rounded-full bg-white p-1 text-black focus:outline-none hover:text-gray-500"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View Help Docs</span>
                    <QuestionMarkCircleIcon
                      className="h-6 w-6"
                      aria-hidden="true"
                    />
                  </a>
                  <button
                    type="button"
                    disabled
                    className="relative rounded-full bg-white p-1 text-black focus:outline-none"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button
                      className={classNames(
                        "relative flex rounded-full bg-white text-sm focus:outline-none",
                        path.includes("/settings")
                          ? "text-gray-700"
                          : "text-black hover:text-gray-500"
                      )}
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <div className="inline-flex overflow-hidden rounded border-white h-8 w-8 flex-shrink-0">
                        {user?.profileImg ? (
                          <Image
                            className="rounded-full object-cover"
                            src={user?.profileImg || ""}
                            alt={user?.email!}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <UserCircleIcon />
                          // <svg
                          //   xmlns="http://www.w3.org/2000/svg"
                          //   fill="none"
                          //   viewBox="0 0 24 24"
                          //   strokeWidth={1.5}
                          //   stroke="currentColor"
                          //   className="w-9 h-9"
                          // >
                          //   <path
                          //     strokeLinecap="round"
                          //     strokeLinejoin="round"
                          //     d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          //   />
                          // </svg>
                        )}
                      </div>
                    </Menu.Button>
                    {/* </div> */}
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {menuItems[
                          isClientProfile ? "client" : "freelancer"
                        ].map((item) => (
                          <Menu.Item key={item.href}>
                            {({ active }) => (
                              <a
                                href={item.href}
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "block px-4 py-2 text-sm text-gray-700"
                                )}
                              >
                                {item.name}
                              </a>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => Intercom("showNewMessage")}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block w-full text-left px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Feedback
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="https://docs.ubertalent.io"
                              target="_blank"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block w-full text-left px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Help
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            // <SignOutButton
                            //   signOutCallback={() => {
                            //     router.push("/");
                            //   }}
                            // >
                            //   <button
                            //     type="button"
                            //     className={classNames(
                            //       active ? "bg-gray-100" : "",
                            //       "block px-4 py-2 text-sm text-gray-700 w-full text-left"
                            //     )}
                            //   >
                            //     Sign out
                            //   </button>
                            // </SignOutButton>
                            <div className="p-0 m-0">
                              <SignOutBtnWithRef
                                active={active}
                                router={router}
                              />
                            </div>
                          )}
                        </Menu.Item>
                        {/* <Menu.Item>
                          {({ active }) => (
                     
                           <UserProfile/>
                        
                          )}
                        </Menu.Item> */}
                        {/* <Menu.Item>
                          {({ active }) => (
                     
                            <UserButton afterSignOutUrl="/"/>
                        
                          )}
                        </Menu.Item> */}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              )}

              {showProfile && (
                <div className="-mr-2 flex items-center sm:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {tabsToDisplay.map(({ name, href }) => (
                <Disclosure.Button
                  as={Link}
                  key={href}
                  href={href}
                  className={classNames(
                    "block border-l-4 py-2 pl-3 pr-4 text-base font-medium ",
                    path === `${href}`
                      ? "border-gray-500 bg-gray-50 text-gray-700"
                      : "hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <div className="flex items-center">
                    {name}
                    {name === "Messages" && unreadMessagesCount ? (
                      <span className="bg-red-600 text-white ml-2 text-xs h-5 w-5 rounded-2xl flex justify-center items-center">
                        {unreadMessagesCount}
                      </span>
                    ) : null}
                  </div>
                </Disclosure.Button>
              ))}
            </div>
            {/* <div className="pb-8  px-4">
              <SearchBar {...searchBarData} />
             <SearchHandler /> 
            </div> */}
            <div className="border-t border-gray-200 pb-3 pt-4">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  {user?.profileImg ? (
                    <Image
                      className="h-10 w-10 rounded-full object-cover"
                      src={user?.profileImg || ""}
                      alt={user?.email!}
                      height={40}
                      width={40}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full">
                      <UserCircleIcon />
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {`${user?.firstName} ${user.lastName}`}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {`${user?.email}`}
                  </div>
                </div>
                <button
                  type="button"
                  className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 space-y-1">
                {menuItems[isClientProfile ? "client" : "freelancer"].map(
                  ({ name, href }) => (
                    <Disclosure.Button
                      as={Link}
                      key={href}
                      href={href}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {name}
                    </Disclosure.Button>
                  )
                )}
                {isClientProfile && (
                  <Disclosure.Button
                    as={Link}
                    href="/job/add"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Post Job
                  </Disclosure.Button>
                )}
                <Disclosure.Button
                  as="button"
                  onClick={() => Intercom("showNewMessage")}
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Feedback
                </Disclosure.Button>
                <Disclosure.Button
                  as={Link}
                  href="https://docs.ubertalent.io"
                  target="_blank"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                >
                  Help
                </Disclosure.Button>
                <SignOutButton
                  redirectUrl="/"
                  // signOutCallback={() => {
                  //   router.push("/");
                  // }}
                >
                  <Disclosure.Button
                    as="button"
                    className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                  >
                    Sign out
                  </Disclosure.Button>
                </SignOutButton>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
