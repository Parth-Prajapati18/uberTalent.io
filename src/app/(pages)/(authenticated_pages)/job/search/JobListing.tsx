"use client";
import React, { useState } from "react";
import { JobType } from "@/app/types";
import { useUserContext } from "@/app/providers/UserProvider";
import { useRouter } from "next/navigation";
import OnHoldPopup from "@/app/components/ui/shared/OnHoldPopup";
import { updateSaveJobStatus } from "@/app/lib/api";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import JobCard from "@/app/components/ui/shared/JobCard";

const JobListing = ({ data }: { data: JobType[] }) => {
  const { user } = useUserContext();

  const router = useRouter();
  const { setSearchParams, commit } = useParamsManager();
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);

  const handleApplyNow = (e: React.MouseEvent<HTMLButtonElement>, job: any) => {
    e.stopPropagation();
    if (user?.freelancerProfile?.status === "ON_HOLD") {
      setShowOnHoldModal(true);
    } else {
      handleClick(job.id, "true");
    }
  };

  const handleClick = (id: string, apply?: string) => {
    setSearchParams({ jobId: id });
    if (apply) setSearchParams({ apply });
    commit();
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
    router.refresh();
  };

  return (
    <>
      <div className="overflow-hidden bg-white sm:rounded-lg">
        <ul role="list" className="divide-y">
          {data?.map((dataItem: JobType, index) => {
            return (
              <li
                className="cursor-pointer"
                key={dataItem.id || index}
                onClick={() => handleClick(dataItem.id)}
              >
                <JobCard
                  dataItem={dataItem}
                  onApplyNow={handleApplyNow}
                  handleJobSaveStatus={handleJobSaveStatus}
                />
              </li>
            );
          })}
        </ul>
      </div>
      <OnHoldPopup
        showOnHoldModal={showOnHoldModal}
        setShowOnHoldModal={setShowOnHoldModal}
      />
    </>
  );
};

export default JobListing;
