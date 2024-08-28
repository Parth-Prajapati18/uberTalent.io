"use client"
import { BarsArrowUpIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { SearchBarType } from "./Navbar";
import { useState } from "react";


const MaginfyingClassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
</svg>
);

export default function SearchBar(searchBarData: SearchBarType) {
  const { placeholder, handleSubmit } = searchBarData;
  const [searchQuery, setSearchQuery] = useState(""); 

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit?.(e);
  };

  const handleClear = () => {
    setSearchQuery(""); // Clear the search query
  };

  return (
    <form onSubmit={onSubmit} className="flex">
      <div className="w-full">
        <div className="mt-2 flex rounded-md shadow-sm">
          <div className="relative flex flex-grow items-stretch focus-within:z-10">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
              <MaginfyingClassIcon />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={searchQuery} // Bind the input value to the searchQuery state
              onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery state on input change
              className="block w-full rounded-none rounded-l-md border-0 py-1.5 pl-10 pr-6 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 focus:outline-0"
              placeholder={placeholder}
            />
            {searchQuery && ( // Render clear button if searchQuery is not empty
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                onClick={handleClear}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
