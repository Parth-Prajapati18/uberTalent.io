import { Dispatch, SetStateAction, useState } from "react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { classNames } from "@/app/utils";

interface Props {
  options: string[];
  label?: string;
  selectedOptions: any[];
  setSelectedOptions: Dispatch<SetStateAction<string[]>>;
  inputClasses?: string;
}

export default function ComboMultiSelect({
  options = [],
  label = "Select",
  selectedOptions,
  setSelectedOptions,
  inputClasses = ""
}: Props) {
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? options
      : options.filter((option) => {
        return option.toLowerCase().includes(query.toLowerCase());
      });

  const handleAddNew = () => {
    if (query.trim() !== "" && !options.includes(query.trim())) {
      setSelectedOptions([...selectedOptions, query.trim()]);
      options.push(query.trim());
      setQuery(""); // Clear the input after adding
    }
  };


  return (
    <>
      <Combobox
        as="div"
        value={selectedOptions}
        onChange={setSelectedOptions}
        multiple>
        {({ open }) => (
          <>
            <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">
              {label}
            </Combobox.Label>
            <div className="relative mt-2">
              <Combobox.Input
                className={classNames(
                  "w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 focus:outline-none",
                  inputClasses
                )}
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
                {filteredOptions.map((option) => (
                  <Combobox.Option
                    key={option}
                    value={option}
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
                          {option}
                        </span>
                        {selectedOptions.includes(option) && (
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
                {query.length > 0 && !options.some(option => option.toLowerCase() === query.trim().toLowerCase()) && (
                  <div className="relative cursor-default select-none py-2 pl-3 pr-9">
                    <div
                      className={classNames(
                        "flex truncate justify-between"
                      )}
                    >
                      <span>{query}</span>
                      <button
                        type="button"
                        onClick={handleAddNew}
                        className="text-xs font-semibold text-black hover:text-black"
                      >
                        + Add New
                      </button>
                    </div>
                  </div>
                )}
              </Combobox.Options>
            </div>
          </>
        )}
      </Combobox>
    </>
  );
}
