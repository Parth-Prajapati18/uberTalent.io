import { categories_clean } from "@/app/constants";
import { classNames } from "@/app/utils";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useState } from "react";

interface FreelancerCategoryProps {
  selectedCategory: string[];
  setSelectedCategory: (value: string[]) => void;
  removeSelectedCategory: (value: string) => void;
}

const FreelancerCategory: React.FC<FreelancerCategoryProps> = ({
  selectedCategory,
  setSelectedCategory,
  removeSelectedCategory,
}) => {
  const handleSelect = (input: any) => {
    let temp: string[] = [...selectedCategory];
    let indx = temp.findIndex((elem: string) => elem === input);
    if (indx != -1) {
      temp.splice(indx, 1);
    } else {
      temp.push(input);
    }
    setSelectedCategory(temp);
  };

  return (
    <div className="px-3">
      <label htmlFor="category" className="text-sm font-semibold text-gray-900">
        Category
      </label>
      <div className="relative">
        <Listbox value={selectedCategory} onChange={handleSelect}>
          {({ open }) => (
            <>
              <div className="relative">
                <Listbox.Button className="focus:ring-2 focus:ring-gray-500 relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none sm:text-sm sm:leading-6 min-h-[32px]">
                  <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
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
                  <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {Object.keys(categories_clean).map((group: any) => {
                      return (
                        <div key={group}>
                          <li className="block m-0 px-2 py-0 font-bold leading-loose bg-gray-200">
                            {group}
                          </li>
                          {Object.values(categories_clean[group]).map(
                            (cat: any) => (
                              <Listbox.Option
                                key={cat}
                                className={({ active }) =>
                                  classNames(
                                    active
                                      ? "bg-black text-white"
                                      : "text-gray-900",
                                    "relative cursor-default select-none py-2 pl-3 pr-9"
                                  )
                                }
                                value={cat}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <div className="flex items-center">
                                      <span
                                        className={classNames(
                                          selected
                                            ? "font-semibold"
                                            : "font-normal",
                                          "ml-3 block truncate"
                                        )}
                                      >
                                        {cat}
                                      </span>
                                    </div>

                                    {selectedCategory.includes(cat) ? (
                                      <span
                                        className={classNames(
                                          active
                                            ? "text-white"
                                            : "text-black",
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
                            )
                          )}
                        </div>
                      );
                    })}
                  </Listbox.Options>
                </Transition>
              </div>
            </>
          )}
        </Listbox>
        <div
          className={classNames(
            selectedCategory.length ? "mt-4" : "",
            "flex gap-2 flex-wrap"
          )}
        >
          {selectedCategory.map((item) => (
            <div
              className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              key={item}
            >
              {item}
              <button
                type="button"
                className="ml-4 text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeSelectedCategory(item);
                }}
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreelancerCategory;
