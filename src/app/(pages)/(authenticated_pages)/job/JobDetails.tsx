import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Job } from "@prisma/client";
import { JOBDURATION } from "@/app/constants";
import { useUserContext } from "@/app/providers/UserProvider";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const JobDetails = ({
  job,
  setOpen,
  onApplyNow,
  isSavedJob = false, // This prop will determine whether the job passes into the JobDetails component is a saved job or not
  handleJobSaveStatus,
}: {
  job: any;
  setOpen: (val: boolean) => void;
  onApplyNow: (e: React.MouseEvent<HTMLButtonElement>, data: Job) => void;
  isSavedJob?: boolean;
  handleJobSaveStatus?: (
    e: React.MouseEvent<HTMLButtonElement>,
    jobId: string,
    type: string
  ) => void;
}) => {
  const [loadingSaveAction, setLoadignSaveAction] = useState(false);
  const { user } = useUserContext();
  const status: any = ["ACTIVE"];

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

        <div className="pb-6 pt-2">
          {/* <div className="h-24 bg-black sm:h-20 lg:h-28" /> */}
          <div className="-mt-12 flow-root sm:-mt-8 sm:flex sm:items-end lg:-mt-16 ">
            <div className="mt-10 sm:flex-1 ">
              <div className="h-24 bg-black sm:h-20 lg:h-24 text-white flex items-center pl-8">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                      {job?.title}
                    </h3>
                  </div>
                  <p className="text-sm text-white">{`@${job?.createdBy.client.companyName ||
                    job?.createdBy.client.user.firstName
                    }`}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0 px-8">
                <button
                  type="button"
                  disabled={job?.hasProposals}
                  className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1 disabled:bg-gray-300"
                  onClick={(e) => onApplyNow(e, job)}
                >
                  {job?.hasProposals ?
                    <span>Applied</span> :
                    <span>Apply Now</span>
                  }
                </button>
                {status.includes(user?.freelancerProfile?.status) && (
                  <button
                    type="button"
                    onClick={(e) =>
                      handleJobSaveStatus &&
                      handleJobSaveStatus(
                        e,
                        job?.id,
                        job?.isSavedJob ? "UNSAVE" : "SAVE"
                      )
                    }
                    className={classNames(
                      "inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:bg-slate-50",
                      loadingSaveAction ? "cursor-wait" : "cursor-pointer"
                    )}
                  >
                    {job?.isSavedJob ? "Unsave" : "Save Job"}
                  </button>
                )}
                
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

export default JobDetails;
