"use client";
import React, { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Props {
  open: boolean;
  setOpen: (val: boolean) => void;
  data: any;
}

const PortfolioDetailsPopup = ({ open, setOpen, data = {} }: Props) => {
  const [url, setURL] = useState<any>("");

  return (
    <>
      {/* Portfolio Details */}
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="flex items-center justify-between text-lg font-medium leading-6 text-gray-900 border-b border-gray-900/10 pb-4"
                  >
                    {data?.title ? data?.title : "Portfolio Details"}
                    <button
                      type="button"
                      className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={() => setOpen(false)}
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Dialog.Title>
                  <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-12">
                    <div
                      className={
                        data?.content?.length > 0
                          ? "sm:col-span-6"
                          : "sm:col-span-12"
                      }
                    >
                      {data?.description && (
                        <div className="sm:col-span-12">
                          <label className="block text-base font-medium leading-6 text-gray-900">
                            Description
                          </label>
                          <div className="mt-2 text-sm whitespace-pre-wrap">
                            {data?.description}
                          </div>
                        </div>
                      )}
                    </div>
                    {data?.content?.length > 0 && (
                      <div className="sm:col-span-6">
                        <ul
                          role="list"
                          className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-2"
                        >
                          {data?.content?.map((file: any) => (
                            <li key={file.id} className="relative">
                              {file.type === "IMAGE" && (
                                <div className="group aspect-h-7 aspect-w-10 block w-full min-h-28 overflow-hidden rounded-lg">
                                  <img
                                    alt=""
                                    src={file.content}
                                    className="pointer-events-none object-cover group-hover:opacity-75"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setURL(file.content)}
                                    className="absolute inset-0 focus:outline-none"
                                  >
                                    <span className="sr-only">
                                      View details for {file.type}
                                    </span>
                                  </button>
                                </div>
                              )}
                              {file.type === "PDF" && (
                                <div className="group aspect-h-7 aspect-w-10 block w-full min-h-28 overflow-hidden rounded-lg">
                                  <a
                                    href={file.content}
                                    target="_blank"
                                    className="absolute inset-0 focus:outline-none flex items-center justify-center text-indigo-400 hover:text-indigo-600 rounded-lg border border-gray-900/10"
                                  >
                                    View PDF
                                    <span className="sr-only">
                                      View details for {file.type}
                                    </span>
                                  </a>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data?.skills?.length > 0 && (
                      <div className="sm:col-span-12">
                        <label className="block text-base font-medium leading-6 text-gray-900">
                          Skills
                        </label>
                        {data?.skills && (
                          <div className="flex items-center flex-wrap gap-2 mt-2">
                            {data?.skills.map((skill: any) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {data?.url && (
                      <div className="sm:col-span-12 flex justify-end mt-4">
                        <a
                          href={data?.url}
                          target="_blank"
                          className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          View
                          <span className="sr-only">View portfolio</span>
                        </a>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Content Viewer */}
      <Transition appear show={!!url} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full min-h-80 max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="flex items-center justify-end text-lg font-medium leading-6 text-gray-900"
                  >
                    <button
                      type="button"
                      className="relative rounded-md bg-white text-gray-400 hover:text-gray-500"
                      onClick={() => {
                        setURL("");
                        setOpen(true);
                      }}
                    >
                      <span className="absolute -inset-2.5" />
                      <span className="sr-only">Close panel</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </Dialog.Title>
                  <div className="flex items-center justify-center w-full overflow-hidden rounded-lg mt-4">
                    <img
                      alt={url}
                      src={url}
                      className="pointer-events-none object-cover"
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default PortfolioDetailsPopup;
