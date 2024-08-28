"use client";
import { countries, countriesData } from "@/app/constants";
import { classNames } from "@/app/utils";
import { Combobox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

interface FreelancerCountryProps {
  selectedCountry: string[];
  setSelectedCountry: (value: string[]) => void;
  removeSelectedCountry: (value: string) => void;
}

const FreelancerCountry: React.FC<FreelancerCountryProps> = ({
  selectedCountry,
  setSelectedCountry,
  removeSelectedCountry,
}) => {
  const [query, setQuery] = useState("");

  const filterCountries =
    query === ""
      ? countries
      : countries.filter((country) => {
          return country.name.toLowerCase().includes(query.toLowerCase());
        });

  const handleSelect = (input: any) => {
    let temp: string[] = [...selectedCountry];
    let indx = temp.findIndex((elem: string) => elem === input);
    if (indx != -1) {
      temp.splice(indx, 1);
    } else {
      temp.push(input);
    }
    setSelectedCountry(temp);
    setQuery("");
  };

  return (
    <div className="px-3">
      <Combobox as="div" value={selectedCountry} onChange={handleSelect}>
        {({ open }) => (
          <>
            <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
              Country
            </Combobox.Label>
            <div className="relative mt-2">
              <Combobox.Input
                className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 focus:outline-none"
                onChange={(event) => setQuery(event.target.value)}
                value={query}
                // Adding the following onClick to display all options when user clicks on the search bar
                // This should be available as a prop in a headless ui future release
                onClick={(e: any) => {
                  if (
                    e.relatedTarget?.id?.includes("headlessui-combobox-button")
                  )
                    return;
                  !open && e.target.nextSibling.click();
                }}
              />
              <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </Combobox.Button>

              <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filterCountries.map((country) => (
                  <Combobox.Option
                    key={country.id}
                    value={country.id}
                    className={({ active }) =>
                      classNames(
                        "relative cursor-default select-none py-2 pl-3 pr-9",
                        active ? "bg-black text-white" : "text-gray-900"
                      )
                    }
                  >
                    {({ active, selected }) => (
                      <>
                        <span
                          className={classNames(
                            "block truncate",
                            selected ? "font-semibold" : ""
                          )}
                        >
                          {country.name}
                        </span>
                        {selectedCountry.includes(country.id) && (
                          <span
                            className={classNames(
                              "absolute inset-y-0 right-0 flex items-center pr-4",
                              active ? "text-white" : "text-black"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        )}
                      </>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          </>
        )}
      </Combobox>
      <div
        className={classNames(
          selectedCountry.length ? "mt-4" : "",
          "flex gap-2 flex-wrap"
        )}
      >
        {selectedCountry.map((item) => (
          <div
            className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            key={item}
          >
            {countriesData[item]}
            <button
              type="button"
              className="ml-4 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                removeSelectedCountry(item);
              }}
            >
              x
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreelancerCountry;
