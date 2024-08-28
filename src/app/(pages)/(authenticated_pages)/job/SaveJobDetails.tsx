import { useState } from "react";
import {  XMarkIcon } from "@heroicons/react/24/outline";
import { Job } from "@prisma/client";
import { useRouter } from "next/navigation";
import { UserType } from "@/app/types";
import { JOBDURATION } from "@/app/constants";
import { useUserContext } from "@/app/providers/UserProvider";
import Tooltip from "@/app/components/ui/shared/Tooltip";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const SaveJobDetails = ({
  job,
  setOpen,
  onApplyNow,
  isSavedJob = false, // This prop will determine whether the job passes into the JobDetails component is a saved job or not
  handleJobSaveStatus,
  hasApplied = false,
}: {
  job: Job & { createdBy: UserType };
  setOpen: (val: boolean) => void;
  onApplyNow: (e: React.MouseEvent<HTMLButtonElement>, data: Job) => void;
  isSavedJob?: boolean;
  hasApplied?: boolean;
  handleJobSaveStatus?: (
    e: React.MouseEvent<HTMLButtonElement>,
    jobId: string,
    type: string
  ) => void;
}) => {
  const router = useRouter();
  const [loadingSaveAction, setLoadignSaveAction] = useState(false);
  const { user } = useUserContext();
  const status: any = ["ACTIVE"];
  const [copied, setCopied] = useState<any>({});

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
    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
      <div className="px-4 py-6 sm:px-6">
        <div className="grid justify-items-end">
          <div className="ml-3 flex h-7 items-center">
            <button
              type="button"
              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={() => setOpen(false)}
            >
              <span className="absolute -inset-2.5" />
              <span className="sr-only">Close panel</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        <div className="py-6">
          {/* <div className="h-24 bg-black sm:h-20 lg:h-28" /> */}
          <div className="-mt-12 flow-root sm:-mt-8 sm:flex sm:items-end lg:-mt-16">
            <div className="mt-6 sm:flex-1">
              <div className="h-24 bg-black sm:h-20 lg:h-28 flex items-center pl-8">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      {job?.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white">{`@${
                    job?.createdBy?.client?.companyName || job?.createdBy?.firstName
                  }`}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0 px-8">
                <button
                  type="button"
                  className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1 disabled:bg-gray-300 disabled:cursor-default"
                  onClick={(e) => onApplyNow(e, job)}
                  disabled={hasApplied}
                >
                  {hasApplied ? "Applied" : "Apply Now"}
                </button>
                {status.includes(user?.freelancerProfile?.status) && !hasApplied && <button
                  type="button"
                  onClick={(e) =>
                    handleJobSaveStatus &&
                    handleJobSaveStatus(
                      e,
                      job?.id,
                      isSavedJob ? "UNSAVE" : "SAVE"
                    )
                  }
                  className={classNames(
                    "inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-slate-50",
                    loadingSaveAction ? "cursor-wait" : "cursor-pointer"
                  )}
                >
                  {isSavedJob ? "Unsave" : "Save"}
                </button>}
                {job?.status === "ACTIVE" &&
                  <Tooltip message={copied[job?.id] ? "Link Copied" : "Copy Link"}>
                    <button
                      type="button"
                      onClick={() => copyUrlToClipboard(job)}
                      className="rounded-md bg-gray-50 px-2.5 py-1.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-100 mr-4"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                    </button>
                  </Tooltip>
                }
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-5 sm:px-0 sm:py-0">
          <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
            <div className="sm:flex sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Job description
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                <p className="whitespace-pre-wrap">{job?.description}</p>
              </dd>
            </div>
            <div className="sm:flex sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Budget
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                {job?.compType === "HOURLY" ? (
                  <>
                    Hourly: $
                    {`${job?.hourlyMinRate} - 
                            $${job?.hourlyMaxRate}`}
                  </>
                ) : (
                  <>Fixed price: ${job?.projectCost}</>
                )}
              </dd>
            </div>
            <div className="sm:flex sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Project length
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                {JOBDURATION[job?.duration]}
              </dd>
            </div>
            <div className="sm:flex sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Skills
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                {job?.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="mr-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                  >
                    {skill}
                  </span>
                ))}
              </dd>
            </div>
            <div className="sm:flex sm:px-6 sm:py-5">
              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                Category
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                {job?.categories?.join(", ")}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SaveJobDetails;
