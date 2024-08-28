"use client";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { PaperClipIcon, CalendarDaysIcon, XMarkIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { ContractDetailsType } from "@/app/types";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import Loader from "@/app/components/ui/shared/Loader";
import { format } from "date-fns";
import { getContractById, updateProposal } from "@/app/lib/api";
import { sendMessage } from "@/app/utils/chatUtils";
import { useSelector } from "react-redux";
import { AppState } from "@/app/(pages)/(authenticated_pages)/messages/store";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";

export default function ContractDetailSlideout() {
  const [contractData, setContractData] = useState<ContractDetailsType | null>(
    null
  );
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { setSearchParams, commit } = useParamsManager();
  const token = useSelector((state: AppState) => state.token);
  const { setDisableInvite, setOpenSlideOver, setFlSlideOverData } = useFLSlideOVerContext();

  const contractId = searchParams.get("contractDetails");
  const link = searchParams.get("link");

  function closeModal() {
    const params = new URLSearchParams(searchParams);
    params.delete("contractDetails");
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function getUserData() {
    if (contractId) {
      setIsDataLoading(true);
      const { data, error } = await getContractById(contractId);
      if (!data || error) {
        alert("Error occured while fetching proposal data");
        closeModal();
      } else {
        setContractData(data);
      }
      setIsDataLoading(false);
    }
  }
  useEffect(() => {
    getUserData();
  }, [contractId]);

  function openUpdateSlideout() {
    const params = new URLSearchParams(searchParams);
    params.delete("contractDetails");
    params.set("contractId", contractId || "");
    params.set("update", "true");
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleViewProfile() {
    const { freelancer }: any = contractData;
    const { freelancerProfile } = freelancer;
    const data = {
      userId: freelancer?.id || null,
      firstName: freelancer?.firstName || null,
      lastName: freelancer?.lastName || null,
      country: freelancer?.country || null,
      email: freelancer?.email,
      imageUrl: freelancer?.profileImg || null,
      title: freelancerProfile?.title || null,
      profileSummary: freelancerProfile?.overview || null,
      categories: freelancerProfile?.category || null,
      skills: freelancerProfile?.skills || null,
      hourlyRate: freelancerProfile?.rate || null,
      hoursPerWeek: freelancerProfile?.availability || null,
      jobInvites: [],
      contract: [],
    };
    setSearchParams({ link: "offer" });
    commit();
    setDisableInvite(true);
    setFlSlideOverData(data);
    setOpenSlideOver(true);
  }

  return (
    <Transition.Root show={!!contractId} as={Fragment}>
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
                              {contractData?.status !== "ACTIVE" ? "Offer" : ""}
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
                                  {contractData?.freelancer?.profileImg ? (
                                    <Image
                                      className="!relative"
                                      src={
                                        contractData?.freelancer?.profileImg ||
                                        ""
                                      }
                                      alt=""
                                      fill
                                    />
                                  ) : (
                                    <div className="bg-white w-full h-full">
                                      <UserCircleIcon />
                                    </div>
                                  )}
                                </div>
                              </button>
                              <div className="mt-6 sm:ml-6 sm:flex-1">
                                <button type="button" onClick={()=>handleViewProfile()}>
                                  <div className="flex items-center">
                                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl hover:text-gray-500">
                                      {contractData?.freelancer?.firstName}
                                      {contractData?.status === "ACTIVE"
                                        ? " " +
                                          contractData?.freelancer?.lastName
                                        : ""}
                                    </h3>
                                  </div>
                                </button>
                                <div className="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0">
                                  {contractData?.status === "ACTIVE" && (
                                    <button
                                      type="button"
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const uniqueConversationTitle =
                                          "JOBID" +
                                          contractData?.job?.id +
                                          "USERID" +
                                          contractData?.freelancer?.id;
                                        await sendMessage(
                                          token,
                                          {
                                            chatFriendlyName: `${contractData?.freelancer?.firstName} ${contractData?.freelancer?.lastName}`,
                                            chatUniqueName:
                                              uniqueConversationTitle,
                                            participantEmail:
                                              contractData?.freelancer?.email,
                                            extraAttributes: {
                                              jobTitle:
                                                contractData?.job?.title,
                                              jobId: contractData?.job?.id,
                                            },
                                          }
                                          // `Offer for ${job.title}`
                                        );
                                        router.push(
                                          "/messages" +
                                            `?convoSearch=${uniqueConversationTitle}`
                                        );
                                      }}
                                      className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1"
                                    >
                                      Message
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      // open Update Proposal Slideout
                                      openUpdateSlideout();
                                    }}
                                    className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1"
                                  >
                                    {contractData?.status !== "ACTIVE"
                                      ? "Update"
                                      : "Edit"}
                                  </button>
                                  {contractData?.status !== "ACTIVE" &&
                                    contractData?.status !== "WITHDRAWN" && (
                                      <button
                                        type="button"
                                        className="inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          let response = await updateProposal(
                                            contractData?.proposal?.id || "",
                                            {
                                              status: "WITHDRAWN",
                                            }
                                          );
                                          if (response.error) {
                                            alert(response.error);
                                          } else {
                                            closeModal();
                                            router.refresh();
                                          }
                                        }}
                                      >
                                        Withdraw Offer
                                      </button>
                                    )}
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

                          <div className="sm:flex items-center pl-4 sm:pl-0 py-4 sm:py-0">
                            <p className="!border-0 sm:flex sm:px-6 sm:py-5 text-gray-700 text-lg font-semibold">
                              <div className="sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Contract Terms
                              </div>
                            </p>
                          </div>

                          <div className="px-4 py-5 sm:px-0 sm:py-0">
                            <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                              <div className="sm:flex sm:px-6 sm:py-5">
                                {contractData?.job.compType === "HOURLY" ? (
                                  <div className="flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                      Hourly Rate
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                      <div className="relative mt-2">
                                        <p className="block w-full rounded-md border-0 py-1.5 text-gray-900 sm:text-sm sm:leading-6 pointer-events-none">
                                          ${contractData?.rate || 0} USD
                                        </p>
                                      </div>
                                    </dd>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="flex items-center">
                                      <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                        Project fixed price
                                      </dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                        <div className="relative mt-2 rounded-md shadow-sm">
                                          <p className="block w-full rounded-md border-0 py-1.5 text-gray-900 sm:text-sm sm:leading-6">
                                            ${contractData?.rate || 0} USD
                                          </p>
                                        </div>
                                      </dd>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="sm:flex sm:px-6 sm:py-5">
                                {contractData?.job.compType === "HOURLY" ? (
                                  <div className="flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                      Weekly Limit
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                      {contractData?.weeklyLimit} HRS
                                    </dd>
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                      Due Date
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                      <div className="relative mt-2 flex items-center text-gray-400">
                                        {contractData?.endDate ? (
                                          <>
                                            <CalendarDaysIcon
                                              className="h-5 w-5  mr-2"
                                              aria-hidden="true"
                                            />
                                            <span>
                                              {format(
                                                contractData?.endDate,
                                                "LLLL dd, yyyy"
                                              )}
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-gray-900">
                                            No Due Date
                                          </span>
                                        )}
                                      </div>
                                    </dd>
                                  </div>
                                )}
                              </div>
                            </dl>
                          </div>

                          {/* PRofile Details */}
                          <p className="!border-0 sm:flex sm:px-6 sm:py-5 text-gray-700 text-lg mt-10 font-semibold  pl-4 py-4">
                            Work Details
                          </p>
                          <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200  px-4 sm:px-0 py-4">
                            <div className="sm:flex sm:px-6 sm:py-5 items-center">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Contract Title
                              </dt>
                              <dd className="mt-1 relative text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                <div className="block w-full sm:w-60  py-1.5 text-gray-900 sm:text-sm sm:leading-6">
                                  {contractData?.title}
                                </div>
                              </dd>
                            </div>
                            <div className="sm:flex sm:px-6 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Work Description
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0 relative">
                                <div className="block w-full sm:w-100  py-1.5 text-gray-900 sm:text-sm sm:leading-6 whitespace-pre-wrap">
                                  {contractData?.description || ""}
                                </div>
                              </dd>
                            </div>

                            <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <h3 className="text-sm font-medium leading-6 text-gray-500 flex flex-col">
                                  <div>Attachments</div>
                                  <div>(optional)</div>
                                </h3>
                              </div>
                              <div className="sm:col-span-2">
                                {contractData?.attachments ? (
                                  <div className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                    <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                      <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                        <div className="flex w-0 flex-1 items-center">
                                          <PaperClipIcon
                                            className="h-5 w-5 flex-shrink-0 text-gray-400"
                                            aria-hidden="true"
                                          />
                                          <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                            <a
                                              href={contractData?.attachments!}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="truncate font-medium"
                                            >
                                              {contractData?.attachments}
                                            </a>
                                          </div>
                                        </div>
                                      </li>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-sm font-medium leading-6 text-gray-500 flex flex-col px-3">
                                    <p>No Attachments</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="sm:flex sm:px-6 sm:py-5 items-center">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Payment Method
                              </dt>
                              <dd className="mt-1 relative text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {contractData?.paymentService ? (
                                <div className="block w-full sm:w-60  py-1.5 text-gray-900 sm:text-sm sm:leading-6">
                                  Payments processed by UberTalent
                                </div>
                              ) : (
                                <div className="block w-full sm:w-60  py-1.5 text-gray-900 sm:text-sm sm:leading-6">
                                  Client pays freelancers directly outside of UberTalent
                                </div>
                              )}
                              </dd>
                            </div>
                          </dl>
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
