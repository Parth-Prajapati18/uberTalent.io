"use client";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { useUserContext } from "@/app/providers/UserProvider";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";

export default function RecommendedFreelancers() {
  const { user } = useUserContext();
  const [freelancers, setFreelancers] = useState<any>([]);
  const [jobs, setJobs] = useState<any>([]);
  const {
    setDisableInvite,
    setOpenSlideOver,
    setFlSlideOverData,
    setNoActiveJobs,
    noActiveJobs,
  } = useFLSlideOVerContext();

  const getFreelancers = async () => {
    try {
      const res = await fetch("/api/client/freelancers");
      const { freelancers, jobs } = await res.json();
      setNoActiveJobs(jobs.length === 0);
      setFreelancers(freelancers || []);
      setJobs(jobs || []);
    } catch (error) {
      console.error("Error fetching freelancers:", error);
    }
  };

  useEffect(() => {
    getFreelancers();
  }, []);

  function disableInvite(freelancer: any): boolean {
    if (noActiveJobs) {
      return false;
    }
    const notInvited = jobs?.filter((job: any) => {
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

  function handleViewProfile(freelancer: any) {
    const data = {
      title: freelancer?.title || null,
      profileSummary: freelancer?.overview || null,
      categories: freelancer?.category || null,
      skills: freelancer?.skills || null,
      hourlyRate: freelancer?.rate || null,
      hoursPerWeek: freelancer?.availability || null,
      country: freelancer?.country || null,
      userId: freelancer?.user?.id || null,
      firstName: freelancer?.user?.firstName || null,
      lastName: freelancer?.user?.lastName || null,
      email: freelancer?.user?.email,
      imageUrl: freelancer?.user?.profileImg || null,
      jobInvites: freelancer?.user?.jobInvites || [],
      contract: freelancer?.user?.contract || [],
    };
    const disable = disableInvite(data);
    setDisableInvite(disable);
    setFlSlideOverData(data);
    setOpenSlideOver(true);
  }

  return (
    <div className="relative border-b border-gray-200 pb-5 sm:pb-0 mt-7">
      <div className="md:flex md:items-center md:justify-between">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Recommended Freelancers
        </h3>
      </div>
      <ul
        role="list"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-4"
      >
        {freelancers.map((freelancer: any) => (
          <li
            key={freelancer?.id}
            className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
          >
            <div className="flex flex-1 flex-col p-8">
              {freelancer?.user?.profileImg ? (
                <img
                  alt=""
                  src={freelancer?.user?.profileImg}
                  className="mx-auto h-24 w-24 flex-shrink-0 rounded-full"
                />
              ) : (
                <UserCircleIcon className="mx-auto h-24 w-24 flex-shrink-0 rounded-full text-gray-300" />
              )}
              <h3 className="mt-4 text-sm font-medium text-gray-900">
                {freelancer?.user?.firstName}
              </h3>
              <dl className="mt-1 flex flex-grow flex-col gap-y-1 justify-between">
                <dt className="sr-only">Title</dt>
                <dd className="text-sm text-gray-500">{freelancer?.title}</dd>
                <dt className="sr-only">Rate and Location</dt>
                <dd className="flex items-center justify-center gap-x-2 text-sm text-gray-500">
                  <span className="flex items-center gap-x-1">
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
                    <span>{freelancer?.rate}/hr</span>
                  </span>
                  <span className="flex items-center gap-x-1">
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
                    <span>{freelancer?.country}</span>
                  </span>
                </dd>
                <dt className="sr-only">Skills</dt>
                <dd className="flex items-center justify-center flex-wrap gap-1 mt-2">
                  {freelancer?.skills
                    .slice(0, 3)
                    .map((skill: any, index: number) => (
                      <div
                        key={index}
                        className="text-xs text-gray-700 bg-gray-200 border rounded px-2"
                      >
                        {skill}
                      </div>
                    ))}
                  {freelancer?.skills.length > 3 && (
                    <div className="text-xs text-gray-700 bg-gray-200 border rounded px-2">
                      +{freelancer?.skills.length - 3} skills
                    </div>
                  )}
                </dd>
              </dl>
            </div>
            <div>
              <div className="-mt-px flex divide-x divide-gray-200">
                <div className="flex w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => handleViewProfile(freelancer)}
                    className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
