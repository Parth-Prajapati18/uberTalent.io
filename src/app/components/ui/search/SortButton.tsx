import { Menu, Popover } from "@headlessui/react";
import {
  ChevronDownIcon,
  BarsArrowUpIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";
import { useState } from "react";
import useParamsManager from "../../hooks/useParamsManager";

const items = [
  { name: "Newest", param: "newest" },
];

const DropdownMenu = ({
  item,
  isOpen,
  handleFilterClick,
  currentSortParam,
}: any) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button
            className={`
                ${open ? "text-gray-900" : "text-gray-700"}
                inline-flex w-full px-4 py-2 text-sm font-medium justify-between
              `}
          >
            {item.name}

            {isOpen ? (
              <ChevronUpIcon
                className="-mr-1 ml-2 h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <ChevronDownIcon
                className="-mr-1 ml-2 h-5 w-5"
                aria-hidden="true"
              />
            )}
          </Popover.Button>

          <Popover.Panel className="z-10 mt-1 w-full bg-white focus:outline-none">
            <div className="py-1">
              {item.subItems.map((subItem: any) => (
                <div
                  key={subItem.name}
                  onClick={() => handleFilterClick(subItem.param)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between"
                >
                  {subItem.name}
                  {currentSortParam === subItem.param && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="green"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};

const SortButton = () => {
  const [isInnerOpen, setIsInnerOpen] = useState<boolean>(false);
  const { getSearchParams, setSearchParams, commit } = useParamsManager();
  const sortBy = getSearchParams("sortBy");
  const [currentSortParam, setCurrentSortParam] = useState('');

  const handleFilterClick = (param: string) => {
    setCurrentSortParam(param);
    setSearchParams({
      sortBy: param,
    });
    if (currentSortParam === getSearchParams("sortBy") ) {
      setSearchParams({
        sortBy: '',
      });
      setCurrentSortParam('');
    }
    commit();
  };
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
            {items.map((item) => (
              <Menu.Item key={item.name}>
                {({ active }) => (
                  <div>
                    <div
                      onClick={() => handleFilterClick(item.param)}
                      className={`${active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } block px-4 py-2 text-sm flex justify-between`}
                    >
                      {item.name}
                      {currentSortParam === item.param && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="green"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Menu>
    </div>
  );
};

export default SortButton;
