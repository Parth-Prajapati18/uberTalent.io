"use client";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { PlusIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/app/utils";
import React, { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { getAllPortfolio, removePortfolio } from "@/app/lib/api";
import Loader from "@/app/components/ui/shared/Loader";
import PortfolioDetailsPopup from "./PortfolioDetailsPopup";
import { useUserContext } from "@/app/providers/UserProvider";

interface Props {
  userId?: string;
  data?: any
}

const PortfolioList = ({ userId, data }: Props) => {
  const { fetchUser } = useUserContext();
  const [portfolio, setPortfolio] = useState<any>(data);
  const [portfolioData, setPortfolioData] = useState<any>();
  const [viewPortfolio, setViewPortfolio] = useState<any>(false);
  const [isLoading, setIsLoading] = useState(false);

  const getPortfolio = async () => {
    try {
      const response = await getAllPortfolio(userId);
      if (response.isError) {
        console.error("Error fetching portfolio:", response);
        alert("Something went wrong");
        return;
      }
      setPortfolio(response.data);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getPortfolio();
  }, []);

  if (data?.length === 0 && portfolio?.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between border-b border-gray-900/10 pb-2">
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Portfolio
        </h2>
        {!userId && (
          <Link
            href={`/settings/freelancer/portfolio/add`}
            className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-500"
          >
            Add
          </Link>
        )}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      )}
      <ul role="list" className="divide-y divide-gray-100">
        {portfolio?.map((data: any) => (
          <li
            key={data.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  {data.title}
                </p>
              </div>
              <div className="mt-1 flex items-center flex-wrap gap-2 text-xs leading-5 text-gray-500">
                {data.skills.map((skill: any) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              {!userId && (
                <div className="flex gap-x-2 hidden sm:flex">
                  <Link
                    href={`/settings/freelancer/portfolio/${data.id}/edit`}
                    className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-black hover:bg-stone-800"
                  >
                    Edit<span className="sr-only">, {data.name}</span>
                  </Link>
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-red-600 border border-red-600 shadow-sm hover:bg-red-100 hover:border-red-100"
                    onClick={async () => {
                      await removePortfolio(data.id);
                      await getPortfolio();
                      fetchUser();
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
              {userId && (
                <div className="flex gap-x-2 hidden sm:flex">
                  <button
                    type="button"
                    className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setPortfolioData(data);
                      setViewPortfolio(true);
                    }}
                  >
                    View
                  </button>
                </div>
              )}
              <Menu as="div" className="relative flex-none sm:hidden">
                <Menu.Button className="-m-2.5 block p-2.5 text-gray-500 hover:text-gray-900">
                  <span className="sr-only">Open options</span>
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
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                    {!userId && (
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            href={`/settings/freelancer/portfolio/${data.id}/edit`}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900"
                            )}
                          >
                            Edit
                          </Link>
                        )}
                      </Menu.Item>
                    )}
                    {!userId && (
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            onClick={async () => {
                              await removePortfolio(data.id);
                              await getPortfolio();
                            }}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                            )}
                          >
                            Delete
                          </div>
                        )}
                      </Menu.Item>
                    )}
                    {userId && (
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            onClick={() => {
                              setPortfolioData(data);
                              setViewPortfolio(true);
                            }}
                            className={classNames(
                              active ? "bg-gray-50" : "",
                              "block px-3 py-1 text-sm leading-6 text-gray-900 cursor-pointer"
                            )}
                          >
                            View
                          </div>
                        )}
                      </Menu.Item>
                    )}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
      {portfolio?.length === 0 && (
        <div className="text-center mt-8">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mx-auto h-12 w-12 text-gray-400"
          >
            <path
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">
            No portfolio
          </h3>
          {!userId && (
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new portfolio.
            </p>
          )}
          {!userId && (
            <div className="mt-6">
              <Link
                href={`/settings/freelancer/portfolio/add`}
                className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <PlusIcon
                  aria-hidden="true"
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                />
                New Portfolio
              </Link>
            </div>
          )}
        </div>
      )}
      <PortfolioDetailsPopup
        open={viewPortfolio}
        setOpen={setViewPortfolio}
        data={portfolioData}
      />
    </div>
  );
};

export default PortfolioList;
