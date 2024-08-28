"use client";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon, BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { useEffect, useState } from "react";

const FreelancerSort = () => {
  const { getSearchParams, setSearchParams, commit } = useParamsManager();
  const [currentSortParam, setCurrentSortParam] = useState("");

  const handleFilterClick = (param: string) => {
    setCurrentSortParam(param);
  };

  useEffect(() => {
    if (currentSortParam) {
      setSearchParams({
        s: currentSortParam,
      });
      commit();
    }
  }, [currentSortParam]);

  useEffect(() => {
    const sort: any = getSearchParams("s");
    if (sort) {
      setCurrentSortParam(sort);
    } else {
      setCurrentSortParam("");
    }
  }, [getSearchParams("s")]);

  return (
    <div className="inline-flex rounded-md shadow-sm">
      <button
        type="button"
        className="cursor-default relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10"
      >
        <BarsArrowUpIcon
          className="-ml-0.5 h-5 w-5 text-gray-400"
          aria-hidden="true"
        />
        Sort
      </button>
      <Menu as="div" className="relative -ml-px block">
        <Menu.Button
          type="button"
          className="relative inline-flex items-center rounded-r-md bg-white px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-10"
        >
          <ChevronDownIcon
            className="-mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Menu.Button>
        <Menu.Items className="absolute right-0 z-10 -mr-1 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {(currentSortParam === "" || currentSortParam === "ratedesc") && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleFilterClick("rateasc")}
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } block px-4 py-2 text-sm flex justify-between w-full`}
                  >
                    Rate: Low to High
                  </button>
                )}
              </Menu.Item>
            )}
            {currentSortParam === "rateasc" && (
              <Menu.Item>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => handleFilterClick("ratedesc")}
                    className={`${
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    } block px-4 py-2 text-sm flex justify-between w-full`}
                  >
                    Rate: High to Low
                  </button>
                )}
              </Menu.Item>
            )}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default FreelancerSort;
