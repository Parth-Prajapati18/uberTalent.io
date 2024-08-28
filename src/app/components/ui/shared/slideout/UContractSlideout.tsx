// TODO: USE IT ONCE ROUTER PUSH REFRESH ISSUE FIXED
import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  capitalizeFirstLetter,
  returnFormattedDate,
  classNames,
} from "@/app/utils";
import { format } from "date-fns";
import {
  ContractDetailsType,
  ContractsWithJobClientData,
  ContractsWithJobClientFreelancerData,
} from "@/app/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loader from "../Loader";
import { getContractById, getUserData } from "@/app/lib/api";

interface Props {
  handleContractAction?: (id: string, type: string) => void;
}

export default function UContractSlideout({ handleContractAction }: Props) {
  const [contractDetails, setContractDetails] = useState<
    ContractsWithJobClientFreelancerData | ContractsWithJobClientData
  >();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const contractId = searchParams.get("contractDetails");

  const [client, setClient] = useState(false);
  useEffect(() => {
    (async () => {
      const response = await getUserData();
      console.log(response);
      setClient(response === "client");
    })();
  }, []);

  async function getContractData() {
    if (contractId) {
      setIsLoading(true);
      const { data, error } = await getContractById(contractId);
      if (!data || error) {
        alert("Error occured while fetching proposal data");
        closeModal();
      } else {
        setContractDetails(data);
      }
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (contractId && client) {
      getContractData();
    }
  }, [contractId, client]);

  function closeModal() {
    const params = new URLSearchParams(searchParams);
    params.delete("contractDetails");
    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <Transition.Root show={!!contractId} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
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
                  <form className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="bg-gray-50 px-4 py-6 sm:px-6">
                        <div className="flex items-start justify-between space-x-3">
                          <div className="space-y-1">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                              Contract Details
                            </Dialog.Title>
                            <p className="text-sm text-gray-500">
                              View contract details below
                            </p>
                          </div>

                          <div className="flex h-7 items-center">
                            <button
                              type="button"
                              className="relative text-gray-400 hover:text-gray-500"
                              onClick={() => closeModal()}
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
                      <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                        <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Job Title
                            </label>
                          </div>
                          <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                            {contractDetails?.job.title}
                          </div>
                        </div>

                        {/* Project description */}
                        <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Description
                            </label>
                          </div>
                          <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                            {contractDetails?.job.description}
                          </div>
                        </div>

                        <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Time Billed
                            </label>
                          </div>
                          <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                            {/* TODO: Add correct data below once Timesheet model is determined */}
                            {/* {contractDetails?.timeBilled}  */}
                            209
                          </div>
                        </div>

                        <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Contract Type
                            </label>
                          </div>
                          <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                            {contractDetails?.type}
                          </div>
                        </div>

                        <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Rate
                            </label>
                          </div>
                          <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                            {contractDetails?.type === "HOURLY" &&
                              `Hourly rate: $${contractDetails.rate}/hr`}
                            {contractDetails?.type === "FIXED" &&
                              `Fixed price: $${contractDetails.rate}`}
                          </div>
                        </div>

                        <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                          <div>
                            <label
                              htmlFor="project-name"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Weekly Limit
                            </label>
                          </div>
                          <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                            <p>
                              {contractDetails?.weeklyLimit
                                ? `${contractDetails?.weeklyLimit} hours`
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {contractDetails?.startDate && (
                          <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                            <div>
                              <label
                                htmlFor="project-name"
                                className="block text-sm font-medium leading-6 text-gray-900"
                              >
                                Start Date
                              </label>
                            </div>
                            <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                              {/* <p> {contractDetails?.startDate?.toDateString()}</p> */}
                              <p>
                                {returnFormattedDate(
                                  contractDetails.startDate,
                                  "LLLL dd, yyyy"
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                        {contractDetails?.status === "COMPLETED" &&
                          contractDetails.endDate && (
                            <div className="space-y-2 px-4  sm:space-y-0 sm:px-6 sm:py-5">
                              <div>
                                <label
                                  htmlFor="project-name"
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  End Date
                                </label>
                              </div>
                              <div className="pt-2 block w-full text-gray-900  sm:text-sm sm:leading-6">
                                <p>
                                  {" "}
                                  {returnFormattedDate(
                                    contractDetails.endDate,
                                    "LLLL dd, yyyy"
                                  )}
                                </p>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                    {client && contractDetails?.status === "ACTIVE" && (
                      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={() =>
                              handleContractAction &&
                              handleContractAction(contractDetails?.id, "close")
                            }
                          >
                            Terminate Contract
                          </button>
                          <button
                            type="submit"
                            className={classNames(
                              "inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                            )}
                            onClick={() =>
                              handleContractAction &&
                              handleContractAction(
                                contractDetails?.id,
                                "update"
                              )
                            }
                          >
                            Update
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
