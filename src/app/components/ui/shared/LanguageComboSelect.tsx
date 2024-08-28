import React, { useState } from "react";
import {
  Listbox,
  Combobox,
} from "@headlessui/react";
import { languages, languageProficiency } from "@/app/constants";
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { classNames } from "@/app/utils";

interface Props {
  langId: number;
  selectedLanguage: string;
  selectedProficiency: string;
  setSelectedLanguage: (id: number, val: string) => void;
  setSelectedProficiency: (id: number, val: string) => void;
  removeLanguage: (langId: number) => void
  errors: any;
}

const LanguageComboSelect: React.FC<Props> = ({
  langId,
  selectedLanguage,
  selectedProficiency,
  setSelectedLanguage,
  setSelectedProficiency,
  removeLanguage,
  errors,
}) => {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState(selectedLanguage);

  const filteredLanguages =
    query === ''
      ? languages
      : languages.filter((lang) => {
          return lang.toLowerCase().includes(query.toLowerCase())
        });

  return (
    <div className="flex gap-x-2 mb-2">
      <Combobox
        as="div"
        value={language}
        onChange={(lang: string) => {
          console.log('new language selected: ', lang);
          setQuery('')
          setLanguage(lang);
          setSelectedLanguage(langId, lang);
        }}
      >
        <Combobox.Label className="block text-sm font-medium leading-6 text-gray-900">Language</Combobox.Label>
        <div className="relative mt-1">
          <Combobox.Input
            className="w-full rounded-md border-0 bg-white pt-1.5 pb-2 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          {filteredLanguages.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredLanguages.map((lang) => (
                <Combobox.Option
                  key={lang}
                  value={lang}
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
                          {lang}
                        </span>
                        {selected && (
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
          )}
        </div>
      </Combobox>
      
      <Listbox as="div" value={languageProficiency[selectedProficiency as keyof typeof languageProficiency]} onChange={(prof: string) => setSelectedProficiency(langId, prof)}>
        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">Proficiency</Listbox.Label>
        <div className="relative mt-1 flex">
          <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-black sm:text-sm sm:leading-6">
            <span className="block truncate">{languageProficiency[selectedProficiency as keyof typeof languageProficiency]}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
            </span>
          </Listbox.Button>

          <Listbox.Options
            className="absolute z-10 mt-1 max-h-60 rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
          >
            {Object.entries(languageProficiency).map((lang) => (
              <Listbox.Option
                key={lang[0]}
                value={lang[0]}
                className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:font-semibold"
              >
                <span className="block truncate font-normal group-data-[selected]:font-semibold hover:font-semibold">{lang[1]}</span>

                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-black group-data-[focus]:font-semibold [.group:not([data-selected])_&]:hidden">
                  <CheckIcon aria-hidden="true" className="h-5 w-5" />
                </span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
          <div className="ms-2 mt-2">
            <button onClick={() => removeLanguage(langId)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 text-red-800">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </Listbox>
    </div>
    
  )
}

export default LanguageComboSelect;
