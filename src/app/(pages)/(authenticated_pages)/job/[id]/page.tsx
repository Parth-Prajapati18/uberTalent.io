"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import { formatDistance } from "date-fns";
// import { projects as jobPosts } from "../../client-dashboard/JobPostings";
import {
  CheckIcon,
  ChevronDownIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import { Menu, Transition } from "@headlessui/react";
import { classNames } from "@/app/utils";
import Link from "next/link";
import { Job } from "@prisma/client";
import {
  getJobById,
  patchJobStatus,
  removeJob,
  updateSaveJobStatus,
} from "@/app/lib/api";
import { JOBDURATION } from "@/app/constants";
import { useUserContext } from "@/app/providers/UserProvider";
import SubmitProposalSlideout from "../../freelancer-dashboard/proposals/SubmitPropsalSlideout";
import SubmitProposalForm from "../../freelancer-dashboard/proposals/SubmitProposalForm";
import JobDetails from "../JobDetails";
import { JobType } from "@/app/types";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import Loader from "@/app/components/ui/shared/Loader";
import OnHoldPopup from "@/app/components/ui/shared/OnHoldPopup";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Tooltip from "@/app/components/ui/shared/Tooltip";
import { useNotification } from "@/app/providers/NotificationProvider";
import ClientHiredForJobBanner from "../ClientHiredForJobBanner";

const JobPage = () => {
  const router = useRouter();
  const params = useParams();
  const { setSearchParams, commit } = useParamsManager();
  const [data, setData] = useState<Job>({} as Job);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobType>();
  const [selectedProposal, setSelectedProposal] = useState<any>();
  const [showSubmitProposal, setShowSubmitProposal] = useState(false);
  const [type, setType] = useState("");
  const [showJobDesc, setShowJobDesc] = useState(false);
  const { user, userType } = useUserContext();
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [copied, setCopied] = useState<any>({});
  const showNotification = useNotification();

  useEffect(() => {
    (async () => {
      try {
        await handleFetchData();
        setIsLoading(false);
      } catch (err) {
        alert("Something went wrong");
        setIsLoading(false);
      }
    })();
  }, []);

  const handleFetchData = async () => {
    const data: Job = await getJobById(params.id as string);
    setData(data);
  };

  // const data = jobPosts?.find((post) => post.id === Number(params.id));
  if (!data) notFound();

  const StatusButton = ({
    buttonText,
    statusUpdate,
  }: {
    buttonText: string;
    statusUpdate: any;
  }) => (
    <span className="sm:ml-3">
      <button
        type="button"
        className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        onClick={statusUpdate}
      >
        {buttonText}
      </button>
    </span>
  );
  async function handleStatusUpdate(payload: any) {
    setIsLoading(true);
    const response = await patchJobStatus(data.id, payload);
    console.log("RESPONSE ", response);
    if (response.isError) {
      if (response.error.status === "invalid") {
        showNotification("error", response.error.message);
      } else {
        showNotification("error", "Something went wrong");
      }
      return;
    }
    router.push("/client-dashboard");
    setIsLoading(false);
  }

  const handleApplyNow = (e: React.MouseEvent<HTMLButtonElement>, job: any) => {
    e.stopPropagation();
    if (user?.freelancerProfile?.status === "ON_HOLD") {
      setShowOnHoldModal(true);
    } else {
      setSearchParams({ jobId: job.id, apply: "true" });
      commit();
    }
  };

  const handleJobSaveStatus = async (
    e: React.MouseEvent<HTMLButtonElement>,
    jobId: string,
    type: string
  ) => {
    e.stopPropagation();
    const response = await updateSaveJobStatus(jobId, type);
    if (response.isError) {
      alert("Something went wrong");
      return;
    }
    setShowJobDesc(false);
    router.refresh();
  };

  const handleJobTitleClick = () => {
    setType("saved");
    setShowJobDesc(true);
    setShowSubmitProposal(false);
  };

  async function handleRemoveJob() {
    try {
      const response = await removeJob(data.id);
      if (response.isError) {
        alert("Something went wrong");
        return;
      }
      router.push("/client-dashboard");
    } catch (error) {
      console.error(error);
    }
  }

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

  const statuses: any = {
    ACTIVE: "text-green-700 bg-green-50 ring-green-600/20",
    DRAFT: "text-yellow-800 bg-yellow-50 ring-yellow-600/20",
    CLOSED: "text-red-800 bg-red-50 ring-red-600/20",
  };

  return (
    <>
      <ClientHiredForJobBanner job={data} />
      {data?.status ? (
        <div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="-mt-1 -ml-1.5 block flex flex-col w-auto">
                <button
                  onClick={() => router.back()}
                  className="text-sm flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-4 hover:italic"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Back
                </button>
              </div>
            </div>
            <div className="mt-5 flex lg:ml-4 lg:mt-0 px-0 mb-8 lg:mb-0">
              {data?.status === "ACTIVE" && (
                <span className="hidden sm:block">
                  <Tooltip message={copied[data?.id] ? "Copied!" : "Copy URL"}>
                    <button
                      type="button"
                      onClick={() => copyUrlToClipboard(data)}
                      className="rounded-md bg-gray-50 px-2.5 py-1.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-100 mr-4"
                    >
                      Share Public Posting
                    </button>
                  </Tooltip>
                </span>
              )}
              {data?.status !== "DRAFT" && userType === "CLIENT" && (
                <span className="hidden sm:block">
                  <Link
                    href={`/job/${data.id}/proposals`}
                    className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 mr-4"
                  >
                    View Proposals
                  </Link>
                </span>
              )}
              {data?.status !== "CLOSED" && userType === "CLIENT" && (
                <span className="hidden sm:block">
                  <Link
                    href={`/job/${data.id}/edit`}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                </span>
              )}

              {data?.status !== "CLOSED" && userType === "FREELANCER" && (
                <span className="hidden sm:block">
                  <button
                    type="button"
                    onClick={(e) => handleApplyNow(e, data)}
                    className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Apply Now
                  </button>
                </span>
              )}

              {data?.status === "DRAFT" && (
                // <StatusButton
                //   buttonText="Post Job"
                //   statusUpdate={() =>
                //     handleStatusUpdate({ status: "ACTIVE", isPublished: true })
                //   }
                // />
                <span className="sm:ml-3">
                    <Link
                    href={`/job/${data.id}/edit`}
                    className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                  >
                    Post Job
                  </Link>
                </span>
              )}

              {/* {data?.status === "CLOSED" && (
            <StatusButton
              buttonText="Unpublish"
              statusUpdate={() => handleStatusUpdate({ isPublished: false })}
            />
          )} */}

              {/* Dropdown */}
              <Menu as="div" className="relative ml-3 sm:hidden">
                <Menu.Button className="inline-flex items-center rounded-md bg-white py-2 text-sm font-semibold text-gray-900">
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 -mr-1 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    {data?.status !== "CLOSED" && userType === "CLIENT" && (
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href={`/job/${data.id}/edit`}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            Edit
                          </a>
                        )}
                      </Menu.Item>
                    )}
                    {data?.status === "ACTIVE" && (
                      <Menu.Item>
                        {({ active, close }) => (
                          <Tooltip
                            message={copied[data?.id] ? "Copied!" : "Copy URL"}
                          >
                            <div
                              onClick={() => {
                                copyUrlToClipboard(data);
                                setTimeout(() => close(), 1000);
                              }}
                              className={classNames(
                                active ? "bg-gray-50" : "",
                                "block px-4 py-2 text-sm leading-6 text-gray-900 cursor-pointer"
                              )}
                            >
                              Share Public Posting
                            </div>
                          </Tooltip>
                        )}
                      </Menu.Item>
                    )}
                    {data?.status !== "DRAFT" && userType === "CLIENT" && (
                      <Menu.Item>
                        {({ active }) => (
                          <a
                            href={`/job/${data.id}/proposals`}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block px-4 py-2 text-sm text-gray-700"
                            )}
                          >
                            View Proposals
                          </a>
                        )}
                      </Menu.Item>
                    )}
                    {data?.status !== "DRAFT" &&
                      data?.status !== "CLOSED" &&
                      userType === "CLIENT" && (
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              onClick={(event) => {
                                event.preventDefault();
                                handleStatusUpdate({ status: "CLOSED" });
                              }}
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Close Job
                            </a>
                          )}
                        </Menu.Item>
                      )}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
          <div className="px-4 sm:px-0">
            <div className="flex items-start gap-x-3">
              <h3 className="text-base font-semibold leading-7 text-gray-900">
                {data.title}
              </h3>
              <p
                className={classNames(
                  statuses[data.status],
                  "rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset"
                )}
              >
                {data.status}
              </p>
            </div>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Posted{" "}
              {data.createdAt &&
                formatDistance(new Date(data?.createdAt), new Date(), {
                  addSuffix: true,
                })}
            </p>
          </div>
          <div className="mt-6 border-t border-gray-100">
            <dl className="divide-y divide-gray-100">
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Category
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex gap-2 flex-wrap">
                  {data.categories?.map((skill) => (
                    <div
                      className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      key={skill}
                    >
                      {skill}
                    </div>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Skills
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex gap-2 flex-wrap">
                  {data.skills?.map((skill) => (
                    <div
                      className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                      key={skill}
                    >
                      {skill}
                    </div>
                  ))}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Compensation
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {data.compType === "HOURLY" &&
                    `Hourly: $${data.hourlyMinRate?.toFixed(
                      2
                    )} - $${data.hourlyMaxRate?.toFixed(2)}`}
                  {data.compType === "FIXED" &&
                    `Fixed price: $${data.projectCost?.toFixed(2)}`}
                  {!data.compType && "Not ready to set a budget"}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Project Length
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {JOBDURATION[data.duration]}
                </dd>
              </div>
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                <dt className="text-sm font-medium leading-6 text-gray-900">
                  Job Description
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
                  {data.description}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex justify-end">
            {data?.status !== "CLOSED" &&
              data?.status !== "DRAFT" &&
              userType === "CLIENT" && (
                <span className="hidden sm:block">
                  <Link
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      handleStatusUpdate({ status: "CLOSED" });
                    }}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 border border-red-600 shadow-sm hover:bg-red-100 hover:border-red-100"
                  >
                    Close Job
                  </Link>
                </span>
              )}
            {data?.status === "DRAFT" && userType === "CLIENT" && (
              <Link
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleRemoveJob();
                }}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 border border-red-600 shadow-sm hover:bg-red-100 hover:border-red-100"
              >
                DELETE
              </Link>
            )}
          </div>
          <SubmitProposalSlideout
            open={type === "submit" ? showSubmitProposal : showJobDesc}
            setOpen={type === "submit" ? setShowSubmitProposal : setShowJobDesc}
          >
            {type === "submit" && selectedJob && (
              <SubmitProposalForm
                setOpen={setShowSubmitProposal}
                jobDetails={selectedJob}
                proposal={selectedProposal}
                handleJobTitleClick={handleJobTitleClick}
                fetchData={handleFetchData}
              />
            )}
            {type === "saved" && selectedJob && (
              <JobDetails
                setOpen={setShowJobDesc}
                job={selectedJob}
                onApplyNow={handleApplyNow}
                isSavedJob={true}
                handleJobSaveStatus={handleJobSaveStatus}
              />
            )}
          </SubmitProposalSlideout>
        </div>
      ) : (
        <div className="w-full flex justify-center">
          <Loader />
        </div>
      )}
      <OnHoldPopup
        showOnHoldModal={showOnHoldModal}
        setShowOnHoldModal={setShowOnHoldModal}
      />
    </>
  );
};

export default JobPage;
