"use client";
import { useUserContext } from "@/app/providers/UserProvider";
import { ExclamationCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function WelcomeBanner() {
  const { user, userType } = useUserContext();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);

  useEffect(() => {
    if(!localStorage.getItem("showWelcomeMessage")) {
      setShowWelcomeMessage(true);
    }
  }, [user]);

  const handleWelcomeMessage = async () => {
    try {
      localStorage.setItem("showWelcomeMessage", `false`);
      setShowWelcomeMessage(false);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  return (
    <>
      {showWelcomeMessage ? (
        <div className="bg-gray-800 mb-10 -mt-5 rounded-lg">
          <div className="mx-auto max-w-7xl px-6 py-6 sm:py-6 lg:px-6">
            <h2 className="text-xl tracking-tight text-white  sm:text-xl flex justify-between items-start">
              <span>Welcome to UberTalent!</span>
              <div className="flex flex-1 justify-end">
                <button
                  type="button"
                  className="-m-3 p-3 focus-visible:outline-offset-[-4px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWelcomeMessage();
                  }}
                >
                  <span className="sr-only">Dismiss</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </h2>
            <p className="mx-auto mt-2 text-sm leading-6 text-white">
              Here’s what to expect:
            </p>
            {userType === "FREELANCER" ? (
              <ul className="list-disc pl-4 mt-2 text-sm text-white">
                <li className="p-1">
                  <strong>Find Work:</strong> Head over to the Find Work page to
                  search for the latest job postings. Apply for the projects
                  that match your skills and interests.
                </li>
                <li className="p-1">
                  <strong>Communication:</strong> Once you apply for a job, you
                  can communicate directly with clients through our messaging
                  system to negotiate the contract terms and payment
                  arrangements.
                </li>
                <li className="p-1">
                  <strong>Track Your Time:</strong> After securing a contract,
                  use the Timesheets page to track the hours you work. Accurate
                  time tracking ensures transparency and helps in maintaining
                  trust with your clients.
                </li>
                <li className="p-1">
                  <strong>Get Paid:</strong> You can arrange for payment either
                  through the platform or directly with your clients.
                </li>
              </ul>
            ) : userType === "CLIENT" ? (
              <ul className="list-disc pl-4 mt-2 text-sm text-white">
                <li className="p-1">
                  <strong>Post a Job:</strong> Start by posting your job
                  requirements to attract top talent.
                </li>
                <li className="p-1">
                  <strong>Find Talent:</strong> Use the Find Talent page to
                  invite freelancers to apply for your job.
                </li>
                <li className="p-1">
                  <strong>Manage Proposals:</strong> View and organize the
                  proposals you receive from freelancers.
                </li>
                <li className="p-1">
                  <strong>Communication:</strong> Communicate directly with freelancers through our messaging
                  system to negotiate contract terms and payment arrangements.
                </li>
                <li className="p-1">
                  <strong>Track Progress:</strong> After finalizing a contract,
                  you can monitor the freelancer’s work hours on the timesheets
                  page.
                </li>
                <li className="p-1">
                  <strong>Payments:</strong> Arrange for payment either through
                  the platform or directly with freelancers.
                </li>
              </ul>
            ) : (
              <></>
            )}
            {/* <p className="mx-auto mt-2 flex gap-2 items-center">
              <ExclamationCircleIcon
                className="h-5 w-5 text-white"
                aria-hidden="true"
              />
              <span className="leading-6 text-white text-sm">
                Payment processing is coming soon! Stay tuned for this exciting
                update.
              </span>
            </p> */}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
