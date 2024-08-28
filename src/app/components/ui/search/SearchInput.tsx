"use client";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { FormEvent, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { SearchBarType } from "../nav/Navbar";
import { useRouter } from "next/navigation";

type ExtendedSearchBarType = SearchBarType & {
  searchTerm: string;
};

/**
 * Note: this is not longer users for freelancer search and only for client... 
 * @param param0 
 * @returns 
 */
const SearchInput = forwardRef(function ResetSearch(searchProps: ExtendedSearchBarType, ref) {
  const { placeholder, handleSubmit, searchTerm } = searchProps;
  const [searchValue, setSearchValue] = useState(searchTerm || "");
  const router = useRouter();

  // useEffect(() => {
  //   setSearchValue(searchTerm);
  // }, [searchTerm]);

  useEffect(()=>{

    if(searchValue === ''){
      handleReset();
    };

  }, [searchValue])

  useImperativeHandle(ref, () => ({
    handleReset
  }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit?.(e);
  };

  const handleReset = () => {
    //console.log('handleReset');
    setSearchValue("");
    handleSubmit?.("");
    //router.push("/client-dashboard/freelancer/search");
    //router.push("/job/search");
  };

  return (
    <form onSubmit={onSubmit} className="flex w-full">
      <div className="flex w-full rounded-lg shadow-md bg-white">
        <div className="relative flex w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="w-full border-none py-2 pl-10 pr-10 text-sm text-gray-700 placeholder-gray-500 bg-transparent focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          {searchValue && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={handleReset}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-black rounded-r-lg hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Search
        </button>
      </div>
    </form>
  );

});

export default SearchInput;
