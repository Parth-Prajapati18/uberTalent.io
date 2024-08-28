import React from "react";
import { JobType } from "@/app/types";
import { format } from "date-fns";
import { JOBDURATION } from "@/app/constants";
import { useUserContext } from "@/app/providers/UserProvider";

const JobCard = ({
  dataItem,
  onApplyNow,
  handleJobSaveStatus,
}: {
  dataItem: JobType | any;
  onApplyNow: (e: React.MouseEvent<HTMLButtonElement>, data: any) => void;
  handleJobSaveStatus?: (
    e: React.MouseEvent<HTMLButtonElement>,
    jobId: string,
    type: string
  ) => void;
}) => {
  const { user } = useUserContext();
  const status: any = ["ACTIVE"];

  return (
    <div key={dataItem.id} className="block hover:bg-gray-50">
        <div className="px-4 py-4 sm:px-6 flex flex-col sm:flex-row justify-between gap-2">
          <div className="flex flex-col justify-between">
            <div className="truncate mb-4 text-sm font-medium text-black">
              {dataItem.title}
            </div>
            <div className="flex flex-col md:flex-row gap-2 flex-wrap">
              <div className="sm:flex">
                <div className="flex items-center text-sm text-gray-500">
                  <svg
                    className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z"></path>
                  </svg>
                  {dataItem.categories?.join(", ")}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                  />
                </svg>

                {dataItem.compType === "HOURLY" ? (
                  <>
                    Hourly:{" "}
                    {`$${dataItem.hourlyMinRate} - $${dataItem.hourlyMaxRate}`}
                  </>
                ) : (
                  <>Fixed: ${dataItem.projectCost}</>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>

                {JOBDURATION[dataItem.duration]}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                  />
                </svg>
                Posted {format(dataItem?.createdAt, "LLLL dd, yyyy")}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end min-w-48">
            {status.includes(user?.freelancerProfile?.status) &&
              dataItem &&
              !dataItem.hasProposals && (
                <button
                  onClick={(e) =>
                    handleJobSaveStatus &&
                    handleJobSaveStatus(
                      e,
                      dataItem.id,
                      dataItem?.isSavedJob ? "UNSAVE" : "SAVE"
                    )
                  }
                  type="button"
                  className={`mx-2 inline-flex rounded-full p-2 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    dataItem?.isSavedJob
                      ? " text-gray-400 focus-visible:outline-black"
                      : "text-gray-400 focus-visible:outline-black"
                  }`}
                >
                  {/* hERE */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className={`w-6 h-6 ${
                      dataItem?.isSavedJob
                        ? "fill-yellow-300 hover:fill-yellow-200"
                        : "fill-white hover:fill-gray-100"
                    }`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                    />
                  </svg>
                  {/* hERE */}
                </button>
              )}
            <button
              type="button"
              disabled={dataItem.hasProposals}
              className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:bg-gray-300 w-full sm:w-auto"
              onClick={(e) => onApplyNow(e, dataItem)}
            >
              {dataItem.hasProposals ? (
                <span>Applied</span>
              ) : (
                <span>Apply Now</span>
              )}
            </button>
          </div>
        </div>
      </div>
  );
};

export default JobCard;
