import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Job } from "@prisma/client";
import { UserType } from "@/app/types";
import { JOBDURATION } from "@/app/constants";

const OfferJobDetailSlideout = ({
  job,
  open,
  setOpen,
}: {
  job: (Job & { createdBy: UserType }) | any;
  open: boolean,
  setOpen: (val: boolean) => void;
}) => {
  return (
    <>
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
                      <div className="px-4 py-6 sm:px-6 bg-black">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-semibold leading-6 text-white">
                            <div className="flex items-center">
                              <h3 className="text-xl font-bold text-white sm:text-2xl">
                                {job?.title}
                              </h3>
                            </div>
                            <p className="text-sm text-white">{`@${
                              job?.client?.companyName ||
                              job?.createdBy?.firstName
                            }`}</p>
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

                      <div className="mt-5 flex flex-wrap space-y-3 sm:space-x-3 sm:space-y-0 px-8">
                        <button
                          type="button"
                          className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1 disabled:bg-gray-300 disabled:cursor-default"
                          disabled={true}
                        >
                          Applied
                        </button>
                      </div>

                      <div className="px-4 py-5 sm:px-0 sm:py-0">
                        <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Job description
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              <p className="whitespace-pre-wrap">{job?.description}</p>
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Budget
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {job?.compType === "HOURLY" ? (
                                <>
                                  Hourly: $
                                  {`${job?.hourlyMinRate} - 
                            $${job?.hourlyMaxRate}`}
                                </>
                              ) : (
                                <>Fixed price: ${job?.projectCost}</>
                              )}
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Project length
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {JOBDURATION[job?.duration]}
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Skills
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {job?.skills?.map((skill: string) => (
                                <span
                                  key={skill}
                                  className="mr-2 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                >
                                  {skill}
                                </span>
                              ))}
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Category
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {job?.categories?.join(", ")}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default OfferJobDetailSlideout;
