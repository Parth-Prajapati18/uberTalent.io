"use client";
import React from "react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { Disclosure } from "@headlessui/react";
import JobSearchSideBar from "./JobSearchSideBar";
import { classNames } from "@/app/utils";

interface rate {
  min: number;
  max: number;
}

interface Props {
  rate: rate;
}

const JobPostingsHeader: React.FC<Props> = ({ rate }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <>
          <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Job Postings
            </h3>
            <div className="sm:hidden">
              <Disclosure.Button
                className={classNames(
                  "relative inline-flex items-center justify-center rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-inset",
                  open
                    ? "text-indigo-400 hover:bg-indigo-100 hover:text-indigo-500 focus:ring-indigo-500"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:ring-gray-500"
                )}
              >
                <AdjustmentsHorizontalIcon
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </Disclosure.Button>
            </div>
          </div>
          <Disclosure.Panel className="sm:hidden" unmount={false}>
            <JobSearchSideBar jobRate={rate} />
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default JobPostingsHeader;
