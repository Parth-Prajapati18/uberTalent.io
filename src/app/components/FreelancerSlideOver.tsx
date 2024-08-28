import { Fragment } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import { ArrowLeftIcon, EllipsisVerticalIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { classNames } from "@/app/utils";
import Image from "next/image";
import useParamsManager from "./hooks/useParamsManager";
import { countries, LANGUAGE_PROFICIENCY } from "../constants";
import PortfolioList from "./ui/shared/portfolio/PortfolioList";

export default function FreelancerSlideOver() {
  const {
    openSlideOver,
    setOpenSlideOver,
    flSlideOverData: data,
    disableInvite,
    noActiveJobs,
    setOpenNoActiveJobsPopup,
  } = useFLSlideOVerContext();

  const { setSearchParams, getSearchParams, deleteSearchParam, commit } = useParamsManager();
  const link = getSearchParams("link");

  const handleModalClose = () => {
    setOpenSlideOver(false);
    deleteSearchParam("link");
    commit();
  }

  return (
    <Transition.Root show={openSlideOver} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleModalClose}>
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
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Profile
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-gray-500"
                            onClick={handleModalClose}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Main */}
                    <div className="divide-y divide-gray-200">
                      <div className="pb-6">
                        <div className="h-24 bg-black sm:h-20 lg:h-28" />
                        <div className="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                          <div className="-m-1 flex">
                            <div className="inline-flex overflow-hidden rounded-lg border-4 border-white h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                              {data?.imageUrl ? (<Image
                                className="!relative object-cover"
                                src={data?.imageUrl || ""}
                                alt=""
                                fill
                              />) : (<div className="bg-white w-full h-full"><UserCircleIcon /></div>)}
                            </div>
                          </div>
                          <div className="mt-6 sm:ml-6 sm:flex-1">
                            <div>
                              <div className="flex items-center">
                                <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                  {data?.firstName}
                                </h3>
                              </div>
                            </div>
                            <div className="mt-5 grid grid-cols-2 space-y-3 sm:space-x-3 sm:space-y-0">
                              {link !== "preview" && (
                                <button
                                  type="button"
                                  disabled={disableInvite}
                                  onClick={() => {
                                    if(noActiveJobs) {
                                      setOpenNoActiveJobsPopup(true);
                                    } else {
                                      setSearchParams({
                                        invite: "true",
                                        freelancerId: data?.userId!
                                      });
                                      commit();
                                    }
                                  }}
                                  className="inline-flex w-full flex-shrink-0 items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:flex-1 disabled:bg-gray-300"
                                >
                                  <span>Invite</span>
                                </button>
                              )}
                              {/* <button
                                onClick={() => {
                                  setSearchParams({
                                    invite: "true",
                                    freelancerId: data?.userId!,
                                  });
                                  commit();
                                }}
                                type="button"
                                className="inline-flex w-full flex-1 items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                              >
                                Invite
                              </button> */}
                              <div className="ml-3 inline-flex sm:ml-0">
                                <Menu
                                  as="div"
                                  className="relative inline-block text-left"
                                >
                                  {/* <Menu.Button className="relative inline-flex items-center rounded-md bg-white p-2 text-gray-400 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    <span className="absolute -inset-1" />
                                    <span className="sr-only">
                                      Open options menu
                                    </span>
                                    <EllipsisVerticalIcon
                                      className="h-5 w-5"
                                      aria-hidden="true"
                                    />
                                  </Menu.Button> */}
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
                                      </div>
                                    </Menu.Items>
                                  </Transition>
                                </Menu>
                              </div>
                            </div>
                          </div>
                        </div>
                        {(link === "proposal" || link==="offer") && (
                          <button
                            type="button"
                            onClick={handleModalClose}
                            className="flex gap-x-1 items-center text-sm hover:text-gray-500 mx-4 mt-4"
                          >
                            <ArrowLeftIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Back to {link === "proposal" ? "Proposal" : "Offer"}
                          </button>
                        )}
                      </div>
                      <div className="px-4 py-5 sm:px-0 sm:py-0">
                        <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Title
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {data?.title}
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Bio
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              <p className="whitespace-pre-wrap">{data?.profileSummary}</p>
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Location
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {
                                countries.find(
                                  (country) => country.id === data?.country
                                )?.name
                              }
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Skills
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              <span className="flex gap-2 flex-wrap">
                                {data?.skills?.map((skill) => (
                                  <span
                                    key={skill}
                                    className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </span>
                            </dd>
                          </div>
                          {data?.languages && data?.languages?.length > 0 && (
                            <div className="sm:flex sm:px-6 sm:py-5">
                              <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                Languages
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                <span className="flex flex-col gap-2">
                                  {data?.languages?.map((lan) => (
                                    <span key={lan.id}><b>{lan.language}</b>: {LANGUAGE_PROFICIENCY[lan.proficiency]}</span>
                                  ))}
                                </span>
                              </dd>
                            </div>
                          )}
                          
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Hourly Rate
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              ${data?.hourlyRate}/hr
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                              Availability per week
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                              {data?.hoursPerWeek === "MORE_THAN_30" ? "More than 30 hrs/week" :
                                data?.hoursPerWeek === "LESS_THAN_30" ? "Less than 30 hrs/week" :
                                  data?.hoursPerWeek === "OPEN_OFFERS" ? "Open to offers" :
                                    data?.hoursPerWeek === "NONE" ? "None" : ""}
                            </dd>
                          </div>
                          <div className="sm:flex sm:px-6 sm:py-5">
                            <PortfolioList userId={data?.userId} data={[]}/>
                          </div>
                        </dl>
                      </div>
                    </div>
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
