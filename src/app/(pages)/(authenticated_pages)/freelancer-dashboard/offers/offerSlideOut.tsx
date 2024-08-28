"use client";
import { Dispatch, Fragment, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Dialog, Transition } from "@headlessui/react";
import { PaperClipIcon, CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Loader from "@/app/components/ui/shared/Loader";
import { format } from "date-fns";
import { ContractsWithJobClientData } from "@/app/types";
import { useRouter } from 'next/navigation';
import { useFreelancerProposalContext } from "@/app/providers/FreelancerProposalProvider";
import { getUserData } from "@/app/lib/api";
import { useUserContext } from "@/app/providers/UserProvider";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  firstName: string;
  lastName: string;
  profileImg: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  image: string | null;
  emailVerified: string | null;
  clerkId: string;
  freelancerProfile: FreelancerProfileData;
  Client: any | null;
}

export interface FreelancerProfileData {
  id: string;
  userId: string;
  rate: number;
  skills: string[];
  title: string;
  overview: string;
  status: string;
  country: string;
  timezone: string | null;
  category: string[];
  availability: string;
  createdAt: string;
  updatedAt: string;
}

type props = {
  contract: ContractsWithJobClientData,
  open: boolean,
  setOpen: (val: boolean) => void;
  setJobDetailSlideout: (val: boolean) => void;
  update: (contractId: string, status: string, proposalId: string) => void;
  setShowNoPaymentModal: Dispatch<SetStateAction<boolean>>;
}

export default function OfferSlideout({
  contract,
  open,
  setOpen,
  setShowNoPaymentModal,
  setJobDetailSlideout,
  update,
}: props) {

  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const router = useRouter();
  const { changeCurrentSection } = useFreelancerProposalContext();
  const { user } = useUserContext();


  async function loadUserData() {
    console.log('user data: ', contract);
    try {
      setIsLoading(true);
      const data = await getUserData();
      if (data) {
        setUserData(data);
      } else {
        console.error("User data is empty.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUserData();
  }, [])


  // async function updateContractStatus(contractId: string, data: string, proposalId: string) {
  //   console.log('updateContractStatus proposal id: ', proposalId);
  //   try {
  //     const response = await fetch(`/api/contracts/${contractId}/status`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         id: contractId,
  //         status: data,
  //         proposalId
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status}`);
  //     }

  //     console.log("Contract Status Upated", response.json);

  //     return response.json;
  //   } catch (error) {
  //     console.error('Failed to update contract status:', error);
  //     return null;
  //   }
  // }

  const acceptOffer = async (contractId: string, proposalId: string, paymentService: boolean) => {
    // await updateContractStatus(contractId, "ACTIVE", proposalId);
    if (paymentService && !user?.freelancerProfile?.stripe_acct_id) {
      setOpen(false);
      setShowNoPaymentModal(true);
    } else {
      changeCurrentSection("Contracts");
      setOpen(false);
      update(contractId, "ACTIVE", proposalId);
    }
  };

  const declineOffer = async (contractId: string, proposalId: string) => {
    // const result = await updateContractStatus(contractId, "REJECTED", proposalId);
    // if (!result) {
    //   console.log('There was an error');
    // } else {
    // router.push('/freelancer-dashboard?l1Tab=Offers');
    update(contractId, "REJECTED", proposalId);
    // router.refresh();
    // setOpen(false)
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
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
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader />
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-6 sm:px-6 bg-black">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-lg font-semibold leading-6 text-white">
                              Offer
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-gray-500"
                                onClick={() => setOpen(false)}
                              >
                                <span className="absolute -inset-2.5" />
                                <span className="sr-only">Close panel</span>
                                <XMarkIcon
                                  className="h-6 w-6 bg-black text-white font-bold"
                                  aria-hidden="true"

                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        <hr className="sm:divide-y sm:divide-gray-200"></hr>

                        <div className="divide-y divide-gray-200">

                          <div className="items-center pl-4 sm:pl-0 py-4 sm:py-0">
                            <div className="!border-0 sm:flex-1 sm:px-6 sm:py-5 text-gray-700 text-lg font-semibold">
                              <div className=" sm:flex-1">
                                <div>
                                  <div className="flex items-center ">
                                    <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
                                      {
                                        contract.client.companyName ?
                                          contract.client.companyName :
                                          `${contract.client.user[0].firstName} ${contract.client.user[0].lastName}`
                                      }
                                    </h3>
                                  </div>
                                </div>
                                  <div className="font-semibold mt-1">
                                    Offer For:{" "}
                                    <a
                                      href=""
                                      className="underline font-medium"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setOpen(false);
                                        setJobDetailSlideout(true);
                                      }}
                                    >
                                      {contract.title}
                                    </a>
                                  </div>
                              </div>
                              <div className="mt-10 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Contract Terms
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-5 sm:px-0 sm:py-0">
                            <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                              <div className="sm:flex sm:px-6 sm:py-5">
                                {contract?.job.compType === 'HOURLY' ? (
                                  <div className="flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                      Hourly Rate
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                      <div className="relative mt-2">
                                        <p className="block w-full rounded-md border-0 py-1.5 text-gray-900 sm:text-sm sm:leading-6 pointer-events-none">
                                          ${contract?.rate || 0} USD
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
                                            ${contract?.rate || 0} USD
                                          </p>
                                        </div>
                                      </dd>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="sm:flex sm:px-6 sm:py-5">
                                {contract?.job.compType === 'HOURLY' ? (
                                  <div className="flex items-center">
                                    <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                      Weekly Limit
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                      {contract.weeklyLimit} HRS
                                    </dd>
                                  </div>
                                ) : (<div className="flex items-center">
                                  <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                    Due Date
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                    <div className="relative mt-2 flex items-center text-gray-400">
                                      {
                                        contract?.endDate ?
                                          (
                                            <>
                                              <CalendarDaysIcon className="h-5 w-5  mr-2" aria-hidden="true" />
                                              <span>{format(contract.endDate, "LLLL dd, yyyy")}</span>
                                            </>
                                          ) :
                                          <span className="text-gray-900">No Due Date</span>
                                      }
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
                                <div className="block w-full sm:w-60  py-1.5 text-gray-900 sm:text-sm sm:leading-6" >
                                  {contract?.title}
                                </div>
                              </dd>
                            </div>
                            <div className="sm:flex sm:px-6 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Work Description
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0 relative">
                                <div className="block w-full sm:w-100  py-1.5 text-gray-900 sm:text-sm sm:leading-6 whitespace-pre-wrap">
                                  {contract?.description || ""}
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
                                {contract.attachments ? (
                                  <div className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                                    <a
                                      href={contract.attachments}
                                      rel="noopener noreferrer"
                                      target="_blank"
                                    >
                                      <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                        <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                                          <div className="flex w-0 flex-1 items-center">
                                            <PaperClipIcon
                                              className="h-5 w-5 flex-shrink-0 text-gray-400"
                                              aria-hidden="true"
                                            />
                                            <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                              <span className="truncate font-medium">
                                                {contract.attachments}
                                              </span>
                                            </div>
                                          </div>
                                        </li>
                                      </div>
                                    </a>
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
                                {contract.paymentService ? (
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

                          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                              {contract.status !== 'REJECTED' && (<div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 border border-red-600 hover:bg-red-100 hover:border-red-100 shadow-sm sm:ml-3 sm:w-auto"
                                  onClick={() => declineOffer(contract.id, contract?.proposal?.id || '')}
                                >
                                  Decline Offer
                                </button>
                                <button
                                  type="button"
                                  onClick={() => acceptOffer(contract.id, contract?.proposal?.id || '', contract.paymentService)}
                                  className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                >
                                  Accept Offer
                                </button>
                              </div>)}
                              {contract.status === 'REJECTED' && (<div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  onClick={() => setOpen(false)}
                                >
                                  Close
                                </button>
                              </div>)}
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
