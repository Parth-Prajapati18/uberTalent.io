"use client";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import SaveJobDetails from "@/app/(pages)/(authenticated_pages)/job/SaveJobDetails";
import SavedJobsListing from "@/app/(pages)/(authenticated_pages)/freelancer-dashboard/savedJobs/SavedJobsListing";
import SectionContainer from "@/app/components/ui/shared/SectionContainer";
import React, { useEffect, useState } from "react";
import SubmitProposalForm from "../proposals/SubmitProposalForm";
import SubmitProposalSlideout from "../proposals/SubmitPropsalSlideout";
import { JobType, SavedJobsType, SavedJobsWithJobData } from "@/app/types";
import { useRouter } from "next/navigation";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { updateSaveJobStatus } from "@/app/lib/api";
import OnHoldPopup from "@/app/components/ui/shared/OnHoldPopup";
import { useUserContext } from "@/app/providers/UserProvider";
import { useAlert } from "@/app/providers/AlertProvider";

interface Props {
  savedJobs: any;
}

const SavedJobs = ({ savedJobs }: Props) => {
  const router = useRouter();
  const [savedJobsWithStatus, setSavedJobsWithStatus] = useState<
    SavedJobsWithJobData[]
  >([]);
  const [showJobDesc, setShowJobDesc] = useState(false);
  const [selectedJob, setSelectedJob] = useState();
  const [showSubmitProposal, setShowSubmitProposal] = useState(false);
  const [type, setType] = useState("");

  const { deleteSearchParam, getSearchParams, setSearchParams, commit } =
    useParamsManager();

  const { user } = useUserContext();
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);

  const showAlert = useAlert();

  useEffect(() => {
    console.log("SaveeJobs Page");
    deleteSearchParam("proposalStatus");
    deleteSearchParam("contractStatus");
    setSearchParams({ l1Tab: "SavedJobs" });
    commit();
  }, []);

  useEffect(() => {
    setSavedJobsWithStatus(savedJobs);
  }, [savedJobs]);

  const rowClickHandler = (data: any) => {
    setSearchParams({ jobId: data?.jobId });
    commit();
  };

  const handleApplyNow = (
    e: React.MouseEvent<HTMLButtonElement>,
    data: any
  ) => {
    if (user?.freelancerProfile?.status === "ON_HOLD") {
      setShowOnHoldModal(true);
    } else {
      setSearchParams({ jobId: data?.jobId, apply: "true" });
      commit();
    }
  };

  const handleJobTitleClick = () => {
    setType("saved");
    setShowJobDesc(true);
    setShowSubmitProposal(false);
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

  const saveApplyJob = async () => {
    try {
      const saveJobId: any = localStorage.getItem("saveJobId");
      if (saveJobId) {
        localStorage.removeItem("saveJobId");
        const response = await updateSaveJobStatus(saveJobId, "SAVE");
        if (response.isError) {
          showAlert(
            "error",
            "Oops! Something went wrong. You might have already applied for or saved the same job. Thank you."
          );
          return;
        }
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    saveApplyJob();
  }, []);

  return (
    <>
      <SectionContainer>
        {savedJobs?.length > 0 ? (
          <SavedJobsListing
            data={savedJobs}
            onRowClick={rowClickHandler}
            onApplyNow={handleApplyNow}
            handleJobSaveStatus={handleJobSaveStatus}
          />
        ) : (
          <EmptyState
            label="NO SAVED JOBS"
            ctaText="Search For Jobs"
            ctaHref="/job/search"
          />
        )}
      </SectionContainer>
      <OnHoldPopup
        showOnHoldModal={showOnHoldModal}
        setShowOnHoldModal={setShowOnHoldModal}
      />
    </>
  );
};

export default SavedJobs;
