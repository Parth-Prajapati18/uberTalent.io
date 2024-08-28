"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { FreelancerTypeExtended } from "@/app/schema/FreelancerOnboardingSchema";
import { classNames } from "@/app/utils";
import { Job } from "@prisma/client";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { useUserContext } from "@/app/providers/UserProvider";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface FreelancerCardProps {
  freelancer: FreelancerTypeExtended;
  index: number;
  length: number;
  activeJobs: Job[];
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  freelancer,
  index,
  length,
  activeJobs,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [freelancerId, setFreelancerId] = useState<any>(null);
  const { user } = useUserContext();
  const { setSearchParams, commit } = useParamsManager();
  const {
    setOpenSlideOver,
    setFlSlideOverData,
    setDisableInvite,
    noActiveJobs,
    setNoActiveJobs,
    setOpenNoActiveJobsPopup,
  } = useFLSlideOVerContext();

  const params = new URLSearchParams(searchParams);

  useEffect(() => {
    if (params.get("freelancerId")) {
      setFreelancerId(params.get("freelancerId"));
    } else if (freelancerId) {
      const delay = setTimeout(() => {
        router.refresh();
        setFreelancerId(null);
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [params.get("freelancerId")]);

  useEffect(() => {
    setNoActiveJobs(activeJobs.length === 0);
  }, [activeJobs]);

  function disableInvite(freelancer: FreelancerTypeExtended): boolean {
    if (noActiveJobs) {
      return false;
    }
    const notInvited = activeJobs?.filter((job: any) => {
      let isProposalReceived = false;
      let isContractActive = false;
      if (Array.isArray(job.proposal)) {
        const findProposal = job.proposal.find(
          (p: any) => p.userId === freelancer.userId
        );
        isProposalReceived = findProposal !== undefined;
      }
      if (Array.isArray(freelancer.contract)) {
        const findContract = freelancer.contract.find(
          (c: any) => c.clientId === user?.clientId && c.status === "ACTIVE"
        );
        isContractActive = findContract !== undefined;
      }
      const isInvited = freelancer?.jobInvites?.some(
        (ji: any) => ji.jobId === job.id
      );
      return !isProposalReceived && !isInvited && !isContractActive;
    });
    if (notInvited.length === 0) {
      return true;
    }
    return false;
  }

  function handleSelect(data: FreelancerTypeExtended) {
    const disable = disableInvite(data);
    setDisableInvite(disable);
    setFlSlideOverData(data);
    setOpenSlideOver(true);
  }

  return (
    <div
      key={freelancer.email}
      className={classNames(
        "cursor-pointer hover:bg-gray-50",
        index === length - 1 ? "" : "border-b border-gray-200",
        "bg-white px-4 py-5 sm:px-6"
      )}
      onClick={() => handleSelect(freelancer)}
    >
      <div className="-ml-4 md:-mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div className="ml-4 md:mt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12">
              {freelancer?.imageUrl ? (
                <Image
                  className="rounded-full max-h-12 max-w-12 object-cover"
                  src={freelancer?.imageUrl || ""}
                  alt="User_Avat"
                  height={48}
                  width={48}
                />
              ) : (
                <UserCircleIcon />
              )}
            </div>
            <div className="flex flex-col flex-grow ml-2">
              <div className="text-sm font-semibold leading-6 text-gray-900">
                {freelancer.firstName}
              </div>
              <div className="hidden md:flex flex-wrap gap-1 md:gap-6 mb-2 text-xs text-gray-500">
                <div className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                      clipRule="evenodd"
                    />
                    <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
                  </svg>
                  <p>{freelancer.title}</p>
                </div>
                <div className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>{freelancer.hourlyRate}/hr</p>
                </div>
                <div className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p>{freelancer.country}</p>
                </div>
              </div>
              <div className="hidden md:flex flex-wrap gap-2">
                {freelancer.categories.map((category, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-700 bg-gray-200 border rounded px-2"
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* For Mobile screen */}
        <div className="ml-4 mt-2 flex flex-col md:hidden">
          <div className="flex flex-wrap gap-2 mb-2 text-sm text-gray-500">
            <div className="flex gap-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M7.5 5.25a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v.205c.933.085 1.857.197 2.774.334 1.454.218 2.476 1.483 2.476 2.917v3.033c0 1.211-.734 2.352-1.936 2.752A24.726 24.726 0 0 1 12 15.75c-2.73 0-5.357-.442-7.814-1.259-1.202-.4-1.936-1.541-1.936-2.752V8.706c0-1.434 1.022-2.7 2.476-2.917A48.814 48.814 0 0 1 7.5 5.455V5.25Zm7.5 0v.09a49.488 49.488 0 0 0-6 0v-.09a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5Zm-3 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                  clipRule="evenodd"
                />
                <path d="M3 18.4v-2.796a4.3 4.3 0 0 0 .713.31A26.226 26.226 0 0 0 12 17.25c2.892 0 5.68-.468 8.287-1.335.252-.084.49-.189.713-.311V18.4c0 1.452-1.047 2.728-2.523 2.923-2.12.282-4.282.427-6.477.427a49.19 49.19 0 0 1-6.477-.427C4.047 21.128 3 19.852 3 18.4Z" />
              </svg>
              <p>{freelancer.title}</p>
            </div>
            <div className="flex gap-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{freelancer.hourlyRate}/hr</p>
            </div>
            <div className="flex gap-1 items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{freelancer.country}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {freelancer.categories.map((category, index) => (
              <div
                key={index}
                className="text-xs text-gray-700 bg-gray-200 border rounded px-2 py-0.5"
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        {/* For Mobile screen End*/}
        <div className="ml-4 mt-3 md:mt-4 flex flex-shrink-0 gap-x-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if(noActiveJobs) {
                setOpenNoActiveJobsPopup(true);
              } else {
                setSearchParams({
                  invite: "true",
                  freelancerId: freelancer.userId!,
                });
                commit();
              }
            }}
            disabled={disableInvite(freelancer)}
            className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:bg-gray-300"
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreelancerCard;
