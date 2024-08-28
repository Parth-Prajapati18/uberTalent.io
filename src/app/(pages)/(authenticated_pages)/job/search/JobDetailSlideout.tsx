import React, { useEffect, useState } from "react";
import SubmitProposalSlideout from "../../freelancer-dashboard/proposals/SubmitPropsalSlideout";
import SubmitProposalForm from "../../freelancer-dashboard/proposals/SubmitProposalForm";
import SaveJobDetails from "../SaveJobDetails";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import {
  getJobById,
  getJobSaveStatus,
  updateSaveJobStatus,
} from "@/app/lib/api";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/ui/shared/Loader";
import { useUserContext } from "@/app/providers/UserProvider";
import OnHoldPopup from "@/app/components/ui/shared/OnHoldPopup";

const JobDetailSlideout = () => {
  const [type, setType] = useState("saved");
  const [selectedJob, setSelectedJob] = useState<any>();
  const [jobSaveStatus, setJobSaveStatus] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>();
  const router = useRouter();
  const { user } = useUserContext();
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);

  const { deleteSearchParam, getSearchParams, setSearchParams, commit } =
    useParamsManager();

  const jobId = getSearchParams("jobId");
  const apply = getSearchParams("apply");
  const link: any = getSearchParams("link");

  const closeModal = () => {
    deleteSearchParam("link");
    deleteSearchParam("apply");
    deleteSearchParam("submitted");
    if (!['jobdetails'].includes(link)) {
      deleteSearchParam("jobId");
      setTimeout(() => {
        setType("saved");
      }, 1000);
    } else {
      setType("saved");
    }
    commit();
  };

  async function getJobData() {
    if (jobId) {
      try {
        setIsLoadingData(true);
        const data = await getJobById(jobId);
        const status = await getJobSaveStatus(jobId);
        if (!data) {
          closeModal();
          console.error("Something went wrong");
        } else {
          setSelectedJob(data);
          setJobSaveStatus(status);
        }
      } catch (err) {
        closeModal();
      } finally {
        setIsLoadingData(false);
      }
    }
  }
  useEffect(() => {
    getJobData();

    if(jobId && Boolean(apply) === true) {
      setType("submit")
    }
  }, [jobId]);

  const handleJobTitleClick = () => {
    setType("saved")
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
    setJobSaveStatus((prev) => !prev);
    router.refresh();
  };
  const handleApplyNow = (e: any, job: any) => {
    console.log("Apply Now", job);
    e.stopPropagation();
    if (user?.freelancerProfile?.status === "ON_HOLD") {
      setShowOnHoldModal(true);
    } else {
      setSearchParams({ link: "jobdetails" });
      commit();
      setSelectedJob(job);
      setType("submit");
    }
  };

  return (
    <SubmitProposalSlideout open={!!jobId} setOpen={closeModal} >
      {isLoadingData ? (
          <div className="flex h-full flex-col overflow-y-scroll justify-center items-center bg-white shadow-xl">
            <Loader />
          </div>
      ) : (
        <>
          {type === "submit" && (
            <SubmitProposalForm
              setOpen={closeModal}
              jobDetails={selectedJob}
              proposal={selectedJob?.proposal[0] || null}
              handleJobTitleClick={handleJobTitleClick}
            />
          )}
          {type === "saved" && selectedJob && (
            <SaveJobDetails
              setOpen={closeModal}
              job = {selectedJob || {}}
              onApplyNow={handleApplyNow}
              isSavedJob={jobSaveStatus}
              handleJobSaveStatus={handleJobSaveStatus}
              hasApplied={selectedJob?.proposal?.length > 0}
            />
          )}
        </>
      )}
      <OnHoldPopup
        showOnHoldModal={showOnHoldModal}
        setShowOnHoldModal={setShowOnHoldModal}
      />
    </SubmitProposalSlideout>
  );
};

export default JobDetailSlideout;
