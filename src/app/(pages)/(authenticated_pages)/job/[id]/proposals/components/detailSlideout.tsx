"use client";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ChatBubbleLeftEllipsisIcon, LinkIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/app/utils";
import { ProposalDetailsType } from "@/app/types";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loader from "@/app/components/ui/shared/Loader";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { getProposalById } from "@/app/lib/api";
import { countries } from "@/app/constants";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { FreelancerTypeExtended } from "@/app/schema/FreelancerOnboardingSchema";

export default function DetailSlideout() {
  const [proposalData, setProposalData] = useState<any>(
    null
  );
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { setSearchParams,  deleteSearchParam, commit } = useParamsManager();
  const { setDisableInvite, setOpenSlideOver, setFlSlideOverData } = useFLSlideOVerContext();

  const proposalId = searchParams.get("proposalDetails");
  const link = searchParams.get("link");

  function closeModal() {
    const params = new URLSearchParams(searchParams);
    params.delete("proposalDetails");
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function getUserData() {
    if (proposalId) {
      setIsDataLoading(true);
      const { data, error } = await getProposalById(proposalId);
      if (!data || error) {
        alert("Error occured while fetching proposal data");
        closeModal();
      } else {
        setProposalData(data);
      }
      setIsDataLoading(false);
    }
  }
  useEffect(() => {
    getUserData();
  }, [proposalId]);

  function openHireSlideout(id: string ) {
    
    deleteSearchParam("proposalDetails");
    commit();
    setSearchParams({
      proposalId: id,
      hire: "true",
    });
    commit();
  }

  function handleViewProfile() {
    const { user } = proposalData;
    const { freelancerProfile } = user;
    const freelancer = {
      userId: user?.id || null,
      firstName: user?.firstName || null,
      lastName: user?.lastName || null,
      country: user?.country || null,
      email: user?.email,
      imageUrl: user?.profileImg || null,
      title: freelancerProfile?.title || null,
      profileSummary: freelancerProfile?.overview || null,
      categories: freelancerProfile?.category || null,
      skills: freelancerProfile?.skills || null,
      hourlyRate: freelancerProfile?.rate || null,
      hoursPerWeek: freelancerProfile?.availability || null,
      jobInvites: [],
      contract: [],
    };
    setSearchParams({ link: "proposal" });
    commit();
    setDisableInvite(true);
    setFlSlideOverData(freelancer);
    setOpenSlideOver(true);
  }

  return (
    <Transition.Root show={!!proposalId} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => link ? {} : closeModal()}>
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {isDataLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader />
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-6 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                              Proposal
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-gray-500"
                                onClick={closeModal}
                              >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-200">
                          <div className="pb-6">
                            <div className="h-24 bg-black sm:h-20 lg:h-28" />
                            <div className="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                              <button type="button" className="-m-1 flex" onClick={()=>handleViewProfile()}>
                                <div className="inline-flex overflow-hidden rounded-lg border-4 border-white h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                                {proposalData?.user?.profileImg ? (<Image
                                    className="!relative"
                                    src={proposalData?.user?.profileImg || ""}
                                    alt=""
                                    fill
                                  />) : (<div className="bg-white w-full h-full"><UserCircleIcon /></div>)}
                                </div>
                              </button>
                              <div className="mt-6 sm:ml-6 sm:flex-1">
                                <button type="button" onClick={()=>handleViewProfile()}>
                                  <div className="flex items-center">
                                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl hover:text-gray-500">
                                      {proposalData?.user?.firstName}
                                    </h3>
                                  </div>
                                </button>
                                <div className="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0">
                                  { (proposalData?.job.status !== 'CLOSED' && proposalData?.status !== 'WITHDRAWN' && proposalData?.status !== 'DISQUALIFIED') &&
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openHireSlideout(proposalData?.id);
                                    }}
                                    className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1"
                                  >
                                    Send Offer
                                  </button>
                                  }
                                  <button
                                    type="button"
                                    className="inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    onClick={() => handleViewProfile()}
                                  >
                                    View Profile
                                  </button>
                                  <button
                                    type="button"
                                    className="inline-flex max-w-12 flex-1 items-center justify-center rounded-md bg-gray-50 px-2.5 py-1.5 text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-100"
                                    onClick={() =>
                                      router.push(
                                        "/messages" + "?convoSearch="+
                                          proposalData?.job.id +
                                          proposalData?.user.id
                                      )
                                    }
                                  >
                                    <ChatBubbleLeftEllipsisIcon className="h-6 w-6"/>
                                  </button>
                                  {/* <div className="ml-3 inline-flex sm:ml-0">
                                    <Menu
                                      as="div"
                                      className="relative inline-block text-left"
                                    >
                                      <Menu.Button className="relative inline-flex items-center rounded-md bg-white p-2 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                        <span className="absolute -inset-1" />
                                        <span className="sr-only">
                                          Open options menu
                                        </span>
                                        <EllipsisVerticalIcon
                                          className="h-5 w-5"
                                          aria-hidden="true"
                                        />
                                      </Menu.Button>
                                      <Transition
                                        as={Fragment}
                                        enter="transition ease-out duration-100"
                                        enterFrom="transform opacity-0 scale-95"
                                        enterTo="transform opacity-100 scale-100"
                                        leave="transition ease-in duration-75"
                                        leaveFrom="transform opacity-100 scale-100"
                                        leaveTo="transform opacity-0 scale-95"
                                      >
                                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                          <div className="py-1">
                                            <Menu.Item>
                                              {({ active }) => (
                                                <a
                                                  href="#"
                                                  className={classNames(
                                                    active
                                                      ? "bg-gray-100 text-gray-900"
                                                      : "text-gray-700",
                                                    "block px-4 py-2 text-sm"
                                                  )}
                                                >
                                                  View profile
                                                </a>
                                              )}
                                            </Menu.Item>
                                            <Menu.Item>
                                              {({ active }) => (
                                                <a
                                                  href="#"
                                                  className={classNames(
                                                    active
                                                      ? "bg-gray-100 text-gray-900"
                                                      : "text-gray-700",
                                                    "block px-4 py-2 text-sm"
                                                  )}
                                                >
                                                  Copy profile link
                                                </a>
                                              )}
                                            </Menu.Item>
                                            <Menu.Item>
                                              {({ active }) => (
                                                <a
                                                  href="#"
                                                  className={classNames(
                                                    active
                                                      ? "bg-gray-100 text-gray-900"
                                                      : "text-gray-700",
                                                    "block px-4 py-2 text-sm"
                                                  )}
                                                >
                                                  Shortlist
                                                </a>
                                              )}
                                            </Menu.Item>
                                            <Menu.Item>
                                              {({ active }) => (
                                                <a
                                                  href="#"
                                                  className={classNames(
                                                    active
                                                      ? "bg-gray-100 text-gray-900"
                                                      : "text-gray-700",
                                                    "block px-4 py-2 text-sm"
                                                  )}
                                                >
                                                  Disqualify
                                                </a>
                                              )}
                                            </Menu.Item>
                                          </div>
                                        </Menu.Items>
                                      </Transition>
                                    </Menu>
                                  </div> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="p-5 md:p-0">
                            <p className="!border-0 sm:flex sm:px-6 sm:py-5 text-gray-700 text-lg font-semibold">
                              Proposal Details
                            </p>
                            <div className="py-5 sm:px-0 sm:py-0">
                              <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                                <div className="sm:flex sm:px-6 sm:py-5">
                                  <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                    Proposed Rate
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                    {proposalData?.job.compType === "HOURLY" &&
                                      `$${proposalData?.rate?.toFixed(2)}/hr`}
                                    {proposalData?.job.compType === "FIXED" &&
                                      `Fixed price: $${proposalData?.rate?.toFixed(
                                        2
                                      )}`}
                                  </dd>
                                </div>
                                <div className="sm:flex sm:px-6 sm:py-5">
                                  <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                    Cover Letter
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                    <p className="whitespace-pre-wrap">{proposalData?.coverLeter}</p>
                                  </dd>
                                </div>
                                <div className="sm:flex sm:px-6 sm:py-5">
                                  <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                    Attachments
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                    {proposalData?.attachments ? (
                                      <div className="flex gap-x-2 items-center">
                                        <LinkIcon className="w-4 text-blue-600" />
                                        <a
                                          href={proposalData?.attachments!}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600"
                                        >
                                          View Attachment
                                        </a>
                                      </div>
                                    ) : (
                                      <p>There are no attachements to show</p>
                                    )}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
