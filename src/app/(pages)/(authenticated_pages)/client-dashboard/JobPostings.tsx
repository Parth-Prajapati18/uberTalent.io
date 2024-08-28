"use client";
import React, { Fragment, useEffect, useState } from "react";
import { Menu, Transition, Dialog } from "@headlessui/react";
import { EllipsisVerticalIcon, UserIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/app/utils";
//import Toggle from "@/app/components/ui/shared/Toggle";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import SectionContainer from "@/app/components/ui/shared/SectionContainer";
import ComingSoonDialog from "@/app/components/ui/shared/ComingSoonDialog";
import NoDefaultPayment from "@/app/components/ui/modals/NoDefaultPayment";
import Link from "next/link";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { JobWithProposalCount } from "@/app/types";
import { useRouter } from "next/navigation";
import { patchJobStatus, getStripeCustomerHasDefPayment, removeJob } from "@/app/lib/api";
import { useUserContext } from "@/app/providers/UserProvider";
import Tooltip from "@/app/components/ui/shared/Tooltip";
import { useNotification } from "@/app/providers/NotificationProvider";


const tabs = [
  { name: "Active", value: "ACTIVE" },
  { name: "Drafts", value: "DRAFT" },
  { name: "Closed", value: "CLOSED" },
];
const statuses: any = {
  ACTIVE: "text-green-700 bg-green-50 ring-green-600/20",
  DRAFT: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
  CLOSED: "text-red-800 bg-red-50 ring-red-600/20",
};
const JobPostings = () => {
  const [currentValue, setCurrentValue] = useState(tabs[0].value);
  const [showJobPosts, setShowJobPosts] = useState(true);
  const [showCreateJobPopup, setShowCreateJobPopup] = useState(false);
  const [showNoPaymentModal, setShowNoPaymentModal] = useState(false);
  const [jobs, setJobs] = useState<JobWithProposalCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  //const [hasDefaultPayment, sethasDefaultPayment] = useState(false);
  const { user } = useUserContext();
  const router = useRouter();
  const [count, setCount] = useState<any>();
  const [copied, setCopied] = useState<any>({});
  const showNotification = useNotification();

  function onChange(val = "ACTIVE") {
    setCurrentValue(val);
  }

  useEffect(() => {

    const getJobs = async () => {
      try {
        const res = await fetch("/api/client/job");
        const data = await res.json();
        setJobs(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setIsLoading(false);
      }
    };

    getJobs();
  }, []);

  // useEffect(() => {
  //   const getStripeCustomerPayment = async () => {
  //     if (user?.client?.stripe_customer_id) {
  //       const hasPayment = await getStripeCustomerHasDefPayment(user?.client?.stripe_customer_id);
  //       sethasDefaultPayment(hasPayment);
  //     } else {
  //       sethasDefaultPayment(false);
  //     }
  //   }
  //   getStripeCustomerPayment();
  // }, [user]);

const checkForPaymentMethod = () => {
  // if (hasDefaultPayment) {
    router.replace("/job/add");
  // } else {
  //   setShowNoPaymentModal(true);
  // }
}

  const closeJob = async (jobId: string) => {
    const response = await patchJobStatus(jobId, { status: "CLOSED" });
    if (response.isError) {
      alert("Something went wrong");
      return;
    }
    setJobs((prevJobs) => {
      return prevJobs.map((job) => {
        if (job.id === jobId) {
          return { ...job, status: "CLOSED" };
        }
        return job;
      });
    });
    setCurrentValue("CLOSED");
  };

  const deleteJob = async (jobId: string) => {
    try {
      const response = await removeJob(jobId);
      if (response.isError) {
        alert("Something went wrong");
        return;
      }
      setJobs((prevJobs) => {
        return prevJobs.filter((job) => {
          return job.id !== jobId;
        });
      });
    } catch (error) {
      console.error(error);
    }
  };

  const postJob = async (jobId: string, title: string, description: string) => {
    const response = await patchJobStatus(jobId, { status: "ACTIVE", isPublished: true, title, description});
    if (response.isError) {
      if (response.error.status === "invalid") {
        showNotification("error", response.error.message);
      } else {
        showNotification("error", "Something went wrong");
      }
      return;
    }
    setJobs((prevJobs) => {
      return prevJobs.map((job) => {
        if (job.id === jobId) {
          return { ...job, status: "ACTIVE", isPublished: true };
        }
        return job;
      });
    });
    setCurrentValue("ACTIVE");
  };

  const calculateStatusCounts: any = (jobs: JobWithProposalCount[]) => {
    return jobs.reduce((acc: any, item: any) => {
      const status = item.status;
      if (status) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    }, {});
  };

  useEffect(() => {
    if(jobs?.length) {
      setCount(calculateStatusCounts(jobs));
    } else {
      setCount(null);
    }
  }, [jobs]);

  const copyUrlToClipboard = (job: any) => {
    // Construct the full URL
    const currentUrl = `${window.location.origin}/apply-job/${job.id}`;
    navigator.clipboard
      .writeText(currentUrl)
      .then(() => {
        setCopied((prevCopied: any) => {
          const newCopied = { ...prevCopied, [job.id]: true };
          return newCopied;
        });
        setTimeout(() => {
          setCopied((prevCopied: any) => {
            const newCopied = { ...prevCopied };
            delete newCopied[job.id];
            return newCopied;
          });
        }, 1000); 
      })
      .catch((err: any) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <>
      <div className="relative border-b border-gray-200 pb-5 sm:pb-0">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Job Postings
          </h3>
          <div className="flex md:absolute md:right-0 md:top-3 md:mt-0">
            <button
              onClick={checkForPaymentMethod}
              className="ml-3 inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Create New Job
            </button>
          </div>
        </div>
        <div className="mt-4">
          <div className="sm:hidden">
            <label htmlFor="current-tab" className="sr-only">
              Select a tab
            </label>
            <select
              id="current-tab"
              name="current-tab"
              onChange={(event) => onChange(event.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black"
              value={currentValue}
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.value}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  onClick={() => onChange(tab.value)}
                  className={classNames(
                    tab.value === currentValue
                      ? "border-gray-500 text-black"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer"
                  )}
                  aria-current={tab.name === currentValue ? "page" : undefined}
                >
                  {tab.name}
                  {count ? (
                    <span
                      className={classNames(
                        tab.value === currentValue
                          ? "bg-gray-100 text-black"
                          : "bg-gray-100 text-gray-900",
                        "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
                      )}
                    >
                      {count[tab.value] || 0}
                    </span>
                  ) : null}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      {jobs.filter((job) => job.status === currentValue).length > 0 ? (
        <ul role="list" className="divide-y divide-gray-100">
          {jobs
            .filter((job) => job.status === currentValue)
            .map((job) => (
              <li key={job.id}>
                <div
                  className="flex items-center justify-between gap-x-6 py-5 cursor-pointer"
                  onClick={(e: any) => {
                    e.preventDefault();
                    router.push(`/job/${job.id}`);
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-start gap-x-3">
                      <p className="text-sm font-semibold leading-6 text-gray-900">
                        {job.title}
                      </p>
                      <p
                        className={classNames(
                          statuses[job.status],
                          "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                        )}
                      >
                        {job.status}
                      </p>
                    </div>
                    {job.status !== "DRAFT" && (
                      <div className="block sm:flex gap-x-4">
                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                          <CalendarDaysIcon className="w-5 h-4 text-black" />
                          <p className="whitespace-nowrap">
                            Posted Date{" "}
                            {job.createdAt && (
                              <time
                                dateTime={new Date(
                                  job?.createdAt
                                ).toISOString()}
                              >
                                {new Date(job.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  }
                                )}
                              </time>
                            )}
                          </p>
                        </div>
                        <div className="mt-1 flex items-center gap-x-1 text-xs leading-5 text-gray-500">
                          <UserIcon className="w-5 h-4 text-black" />
                          <Link href={`/job/${job.id}/proposals`} onClick={(e: any) => e.stopPropagation()}>
                            <p className="whitespace-nowrap">
                              {job?._count?.proposal || 0} proposals
                            </p>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-none items-center gap-x-4">
                    <Link
                      href={`/job/${job.id}`}
                      onClick={(e: any) => e.stopPropagation()}
                      className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block"
                    >
                      View Job<span className="sr-only">, {job.title}</span>
                    </Link>
                    {job.status !== "DRAFT" && (
                      <Link
                        href={`/job/${job.id}/proposals`} //TODO: Use correct href once ddatabase is implemented
                        onClick={(e: any) => e.stopPropagation()}
                        className="hidden rounded-md px-2.5 py-1.5 text-sm font-semibold sm:block bg-black text-white shadow-sm hover:bg-stone-800 ocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        View Proposals
                        <span className="sr-only">, {job.title}</span>
                      </Link>
                    )}
                    {job.status === "DRAFT" && (
                      <Link
                        href={`/job/${job.id}/edit`}
                        onClick={(e: any) => e.stopPropagation()}
                        className="hidden rounded-md px-2.5 py-1.5 text-sm font-semibold sm:block bg-green-600 text-white shadow-sm hover:bg-green-500 ocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                        Post this job
                        <span className="sr-only">, {job.title}</span>
                      </Link>
                    )}
                    <Menu as="div" className="relative flex-none">
                      <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900" onClick={(e: any) => e.stopPropagation()}>
                        <span className="sr-only">Open options</span>
                        <EllipsisVerticalIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                href={`/job/${job.id}`}
                                onClick={(e: any) => e.stopPropagation()}
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900 sm:hidden"
                                )}
                              >
                                View
                                <span className="sr-only">, {job.title}</span>
                              </a>
                            )}
                          </Menu.Item>
                          {job.status === "DRAFT" && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/job/${job.id}/edit`}
                                  onClick={(e: any) => e.stopPropagation()}
                                  className={classNames(
                                    active ? "bg-gray-50" : "",
                                    "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                                  )}
                                >
                                  Post
                                  <span className="sr-only">, {job.title}</span>
                                </Link>
                              )}
                            </Menu.Item>
                          )}
                          {job.status !== "CLOSED" && (
                            <Menu.Item>
                              {({ active }) => (
                                <Link
                                  href={`/job/${job.id}/edit`}
                                  onClick={(e: any) => e.stopPropagation()}
                                  className={classNames(
                                    active ? "bg-gray-50" : "",
                                    "block px-3 py-1 text-sm leading-6 text-gray-900"
                                  )}
                                >
                                  Edit
                                  <span className="sr-only">, {job.title}</span>
                                </Link>
                              )}
                            </Menu.Item>
                          )}

                          {job.status !== "DRAFT" &&
                            job.status !== "CLOSED" && (
                              <Menu.Item>
                                {({ active }) => (
                                  <div
                                    onClick={(e: any) => {e.stopPropagation(); closeJob(job.id)}}
                                    className={classNames(
                                      active ? "bg-gray-50" : "",
                                      "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                                    )}
                                  >
                                    Close
                                    <span className="sr-only">
                                      , {job.title}
                                    </span>
                                  </div>
                                )}
                              </Menu.Item>
                            )}
                          {job.status === "DRAFT" && (
                            <Menu.Item>
                              {({ active }) => (
                                <div
                                  onClick={(e: any) => {e.stopPropagation(); deleteJob(job.id)}}
                                  className={classNames(
                                    active ? "bg-gray-50" : "",
                                    "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                                  )}
                                >
                                  Delete
                                  <span className="sr-only">, {job.title}</span>
                                </div>
                              )}
                            </Menu.Item>
                          )}
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                href={`/job/${job.id}/reuse`}
                                onClick={(e: any) => e.stopPropagation()}
                                className={classNames(
                                  active ? "bg-gray-50" : "",
                                  "block px-3 py-1 text-sm leading-6 text-gray-900"
                                )}
                              >
                                Reuse Posting
                                <span className="sr-only">, {job.title}</span>
                              </Link>
                            )}
                          </Menu.Item>
                          {job.status !== "DRAFT" && (
                            <Menu.Item>
                              {({ active }) => (
                                <a
                                  href={`/job/${job.id}/proposals`}
                                  onClick={(e: any) => e.stopPropagation()}
                                  className={classNames(
                                    active ? "bg-gray-50" : "",
                                    "block px-3 py-1 text-sm leading-6 text-gray-900 sm:hidden"
                                  )}
                                >
                                  View Proposals
                                  <span className="sr-only">, {job.title}</span>
                                </a>
                              )}
                            </Menu.Item>
                          )}
                          {job.status === "ACTIVE" && (
                              <Menu.Item>
                                {({ active, close }) => (
                                  <Tooltip
                                    message={
                                      copied[job?.id] ? "Copied!" : "Copy URL"
                                    }
                                  >
                                    <a
                                      href=""
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        copyUrlToClipboard(job);
                                        setTimeout(() => close(), 1000);
                                      }}
                                      className={classNames(
                                        active ? "bg-gray-50" : "",
                                        "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                                      )}
                                    >
                                      Share Public Posting
                                      <span className="sr-only">
                                        , {job.title}
                                      </span>
                                    </a>
                                  </Tooltip>
                                )}
                              </Menu.Item>
                            )}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      ) : (
        <SectionContainer>
          <EmptyState
            label={`NO ${currentValue.toUpperCase()} POSTING`}
            ctaText="New Posting"
            ctaHref="/job/add"
          />
        </SectionContainer>
      )}
      <ComingSoonDialog
        open={showCreateJobPopup}
        setOpen={setShowCreateJobPopup}
      />
      <NoDefaultPayment
        open={showNoPaymentModal}
        setOpen={setShowNoPaymentModal}
      />
    </>
  );
};

export default JobPostings;
