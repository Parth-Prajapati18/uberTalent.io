import React from "react";
import { SavedJobsType } from "@/app/types";
import { usePathname } from "next/navigation";
import JobCard from "@/app/components/ui/shared/JobCard";

const SavedJobsListing = ({
  data,
  onRowClick,
  onApplyNow,
  handleJobSaveStatus,
}: {
  data: SavedJobsType[];
  onRowClick?: (arg?: any) => void;
  onApplyNow: (e: React.MouseEvent<HTMLButtonElement>, data: any) => void;
  handleJobSaveStatus?: (
    e: React.MouseEvent<HTMLButtonElement>,
    jobId: string,
    type: string
  ) => void;
}) => {
  const pathname = usePathname();

  return (
    <div className="overflow-hidden bg-white sm:rounded-lg">
      <ul role="list" className="divide-y">
        {data?.map((dataItem: any, index) => {
          dataItem.job.isSavedJob = true;
          return (
            <li
              className="cursor-pointer"
              key={dataItem.id || index}
              onClick={() => onRowClick?.(dataItem)}
            >
              {/* <p key={dataItem.id}>{JSON.stringify(dataItem)}</p> */}
              <JobCard
                  dataItem={dataItem.job}
                  onApplyNow={onApplyNow}
                  handleJobSaveStatus={handleJobSaveStatus}
                />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SavedJobsListing;
