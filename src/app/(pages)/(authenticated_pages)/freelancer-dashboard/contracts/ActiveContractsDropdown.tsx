"use client";
import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { classNames } from "@/app/utils";
import { ContractsWithJobClientData } from "@/app/types";
import { useRouter } from "next/navigation";

type Props = {
  contract: ContractsWithJobClientData;
  handleEndContractClick: (contract: ContractsWithJobClientData) => void;
};
const ActiveContractsDropdown = ({
  handleEndContractClick,
  contract,
}: Props) => {
  const router = useRouter();

  const handleTrackTime = (id: string) => {
    router.push(`/timesheets/freelancer?contractId=${id}`);
  };
  return (
    <>
      <Menu as="div" className="relative flex-none">
        <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
          <span className="sr-only">Open options</span>
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={() => handleTrackTime(contract?.id)}
                  className={classNames(
                    active ? "bg-gray-50" : "",
                    "cursor-pointer block px-3 py-1 text-sm leading-6 text-gray-900"
                  )}
                >
                  Track Time
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  onClick={() => handleEndContractClick(contract)}
                  className={classNames(
                    active ? "bg-gray-50" : "",
                    "cursor-pointer block px-3 py-1 text-sm leading-6 text-gray-900"
                  )}
                >
                  End Contract
                </div>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

export default ActiveContractsDropdown;
