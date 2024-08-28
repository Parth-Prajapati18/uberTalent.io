"use client";
import { Fragment, useEffect, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox, Listbox, Transition } from "@headlessui/react";
import { classNames } from "@/app/utils";
import { Contract } from "@prisma/client";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import { useWeekContext } from "@/app/providers/WeekProvider";

type Props = {
  contracts: Contract[];
};

export default function ContractsSelect({ contracts }: Props) {
  const { dates } = useWeekContext();
  const [selectedContract, setSelectedContract] = useState<Contract | null | any>(
    null
  );
  const { setSearchParams, commit, getSearchParams } = useParamsManager();
  const contractId = getSearchParams("contractId");
  useEffect(() => {
    if (contractId && contracts && contracts.length) {
      const contract = contracts.find((contract) => contract.id === contractId);
      if (contract) {
        handleContractSelect(contract);
      } else {
        handleContractSelect(contracts[0]);
      }
    } else if(contracts && contracts.length) {
      handleContractSelect(contracts[0]);
    }
  }, [contractId]);

  const handleContractSelect = (contract: Contract) => {
    setSelectedContract(contract);
    setSearchParams({
      contractId: contract.id,
    });
    commit();
  };

  if (!dates?.length) {
    return <></>;
  }

  return contracts && contracts.length > 0 ? (
    <div className="sm:flex sm:justify-between sm:w-full">
      <Listbox value={selectedContract} onChange={handleContractSelect}>
        {({ open }) => (
          <>
            <div className="relative w-64">
              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white min-h-8 py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm sm:leading-6">
                <span className="block truncate">
                  {selectedContract?.title}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {contracts.map((contract) => (
                    <Listbox.Option
                      key={contract.id}
                      className={({ active }) =>
                        classNames(
                          active ? "bg-black text-white" : "text-gray-900",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      value={contract}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={classNames(
                              selected ? "font-semibold" : "font-normal",
                              "block truncate"
                            )}
                          >
                            {contract.title}
                          </span>

                          {selected ? (
                            <span
                              className={classNames(
                                active ? "text-white" : "text-black",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </>
        )}
      </Listbox>
      {contractId !== "All" && (
        <div className="flex flex-col ps-3 mt-2 sm:mt-0">
          <p className="text-sm">
            <span className="font-semibold">Rate: </span>$
            {selectedContract?.timesheets && selectedContract?.timesheets[0]?.rate || 0}/hr
          </p>
          <p className="text-sm">
            <span className="font-semibold">Weekly limit: </span>
            {selectedContract?.weeklyLimit} hours
          </p>
        </div>
      )}
    </div>
  ) : (
    <div className="flex justify-center w-full">
      <EmptyState label="NO TIMESHEETS FOUND" />
    </div>
  );
}
