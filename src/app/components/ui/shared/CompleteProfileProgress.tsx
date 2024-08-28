"use client";

import { getStripeConnectAccount } from "@/app/lib/api";
import { useUserContext } from "@/app/providers/UserProvider";
import { classNames } from "@/app/utils";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Props {
  userInfo?: any;
  isShowAtDashboard?: boolean;
}
export default function CompleteProfileProgress({
  userInfo,
  isShowAtDashboard = false,
}: Props) {
  const { user }: any = useUserContext();
  const [percentage, setPercentage] = useState(0);
  const [toggleChecklist, setToggleChecklist] = useState(false);
  const [sections, setSections] = useState([
    {
      id: "profileImg",
      name: "Add your Profile Picture",
      completed: false,
      link: "/settings/freelancer",
    },
    {
      id: "overview",
      name: "Make your Profile Summary at least 50 characters",
      completed: false,
      link: "/settings/freelancer/profile",
    },
    {
      id: "account_charges_enabled",
      name: "Set up your payouts account",
      completed: false,
      link: "/settings/freelancer/payments",
    },
    {
      id: "portfolio",
      name: "Add Portfolio",
      completed: false,
      link: "/settings/freelancer/portfolio",
    },
  ]);

  useEffect(() => {
    const totalSections = sections.length;
    const completedSections = sections.filter(
      (section) => section.completed
    ).length;
    const completionPercentage = (completedSections / totalSections) * 100;
    setPercentage(completionPercentage);
  }, [sections]);

  const updateSections = (user: any, freelancerProfile: any) => {
    setSections((prevSections) => {
      return prevSections.map((section) => {
        if (user?.[section.id]) {
          return { ...section, completed: true };
        }
        if (
          section.id === "portfolio" &&
          Array.isArray(freelancerProfile?.[section.id])
        ) {
          return {
            ...section,
            completed: freelancerProfile?.[section.id].length > 0,
          };
        } else if (freelancerProfile?.[section.id]) {
          return { ...section, completed: true };
        }
        return section;
      });
    });
  };

  useEffect(() => {
    if (userInfo) {
      const { freelancerProfile } = userInfo;
      updateSections(userInfo, freelancerProfile);
    }
  }, [userInfo]);

  useEffect(() => {
    if (!userInfo) {
      const { freelancerProfile } = user;

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
          updateSections(user, freelancerProfile);
        } catch (err) {
          console.log(err);
        } finally {
        }
      };

      getData();
    }
  }, [user]);

  const handleToggleChecklist = () => {
    setToggleChecklist(!toggleChecklist);
  };

  return (
    <Link
      href={isShowAtDashboard ? "/settings/freelancer" : ""}
      className={isShowAtDashboard ? "cursor-pointer" : "cursor-default"}
      onClick={(e: any) => (isShowAtDashboard ? null : e.preventDefault())}
    >
      <div
        className={classNames(
          "bg-white px-4 py-5 sm:px-6",
          isShowAtDashboard ? "" : "shadow"
        )}
      >
        {isShowAtDashboard ? (
          <span className="text-base font-semibold leading-6 text-gray-500">
            Complete your profile
          </span>
        ) : (
          <h3 className="flex items-center justify-between text-base font-semibold leading-6 border-b border-gray-200 text-gray-900 pb-3">
            <span>Complete your profile</span>
            <button
              type="button"
              className="block sm:hidden"
              onClick={handleToggleChecklist}
            >
              {toggleChecklist ? (
                <ChevronUpIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              ) : (
                <ChevronDownIcon
                  className="h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
              )}
            </button>
          </h3>
        )}

        <div aria-hidden="true" className="my-4">
          <div className="relative">
            <span
              className="absolute text-xs top-2"
              style={{
                left:
                  percentage > 95
                    ? `calc(${percentage}% - 25px)`
                    : percentage < 5
                    ? `calc(${percentage}% - 0px)`
                    : `calc(${percentage}% - 10px)`,
              }}
            >
              {percentage}%
            </span>
            <div className="overflow-hidden rounded-full bg-gray-200">
              <div
                style={{ width: `${percentage}%` }}
                className="h-2 rounded-full bg-black"
              />
            </div>
          </div>
          {/* <div className="mt-6 hidden grid-cols-4 text-sm font-medium text-gray-600 sm:grid">
          <div className="text-gray-600">Copying files</div>
          <div className="text-center text-gray-600">Migrating database</div>
          <div className="text-center">Compiling assets</div>
          <div className="text-right">Deployed</div>
        </div> */}
        </div>
        {!isShowAtDashboard && (
          <div
            className={classNames(
              "mt-8 divide-y divide-gray-200 border-b border-t border-gray-200 sm:block",
              toggleChecklist ? "block" : "hidden"
            )}
          >
            {sections.map((section: any, sectionIdx) => (
              <Link
                href={section.link}
                key={sectionIdx}
                className="relative flex items-start py-4"
              >
                <div className="min-w-0 flex-1 text-sm leading-6">
                  <label
                    htmlFor={section.id}
                    className="select-none font-medium text-gray-900 cursor-pointer"
                  >
                    {section.name}
                  </label>
                </div>
                <div className="ml-3 flex h-6 items-center relative">
                  <input
                    key={Math.random()}
                    id={section.id}
                    name={section.id}
                    type="checkbox"
                    defaultChecked={section.completed}
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-gray-500 focus:ring-white"
                  />
                  {/* Invisible clickable layer over the checkbox */}
                  <div className="absolute inset-0 cursor-pointer"></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
