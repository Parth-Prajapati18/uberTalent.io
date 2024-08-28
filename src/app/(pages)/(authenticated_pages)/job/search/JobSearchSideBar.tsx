"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchInput from "@/app/components/ui/search/SearchInput";
import JobSearchCategory from "./JobSearchCategory";
import JobSearchRateSideBar from "./JobSearchRateSideBar";

export type SearchBarType = {
  placeholder: string;
  handleSubmit?: (e: FormEvent<HTMLFormElement> | string) => void;
};

interface rate {
  min: number;
  max: number;
}

interface SideBarProps {
  jobRate: rate;
}

const JobSearchSideBar: React.FC<SideBarProps> = ({ jobRate }) => {
  const searchInputRef = useRef(null);

  const [searchBarData, setSearchBarData] = useState<SearchBarType>({
    placeholder: "",
    handleSubmit: (e: FormEvent<HTMLFormElement> | string) => {},
  });

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState([1, jobRate.max]);
  const [sortValue, setSortValue] = useState("newest");
  const [searchValue, setSearchValue] = useState<any>(null);
  const [rate, setRate] = useState<rate>(jobRate);
  const [page, setPage] = useState<any>(1);

  const handleQueryParams = useDebouncedCallback(
    (selectedCategory: string[], hourlyRate: number[], searchValue: string) => {
      console.log(
        "handleQueryParams",
        selectedCategory,
        hourlyRate,
        searchValue,
        sortValue,
        page
      );
      const params = new URLSearchParams(searchParams);

      if (selectedCategory.length > 0) {
        params.set("c", selectedCategory.join(","));
      } else {
        params.delete("c");
      }

      if (hourlyRate.length > 0) {
        params.set("h", hourlyRate.join(","));
      } else {
        params.delete("h");
      }

      if (searchValue) {
        params.set("q", searchValue);
      } else {
        params.delete("q");
      }

      if (sortValue) {
        params.set("o", sortValue);
      } else {
        params.delete("o");
      }

      if (page) {
        params.set("p", page);
      } else {
        params.delete("p");
      }

      replace(`${pathname}?${params.toString()}`);
    },
    300
  );

  useEffect(() => {
    console.log("SideBare useEffect");
    setSearchBarData({
      placeholder: "Search For Jobs",
      handleSubmit: handleTalentSearch,
    });
  }, []);

  //Note category and rate are the only properties withou callbacks so we need watch for chnages.
  useEffect(() => {
    console.log("search change");
    handleQueryParams(selectedCategory, hourlyRate, searchValue);
  }, [selectedCategory, hourlyRate, searchValue]);

  const removeSelectedCategory = (val: any) => {
    let temp = [...selectedCategory];
    let indx = temp.findIndex((elem) => elem === val);
    if (indx != -1) {
      temp.splice(indx, 1);
      setSelectedCategory(temp);
    }
  };

  function handleTalentSearch(e: any) {
    if (typeof e === "string") {
      setSearchValue("");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const { search } = Object.fromEntries(formData);
    setSearchValue(search);
  }

  function handleButtonClick(): void {
    //replace(`${pathname}`);
    setSelectedCategory([]);
    setHourlyRate([1, jobRate.max]);
    setSearchValue("");
    if (searchInputRef.current) {
      (searchInputRef.current as any).handleReset();
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full border-b md:w-80 md:min-w-80 md:max-w-80 md:border-b-0 md:border-r border-gray-200 py-8">
      {/* Search bar */}
      <div className="px-3">
        <SearchInput
          {...searchBarData}
          searchTerm={searchValue}
          ref={searchInputRef}
        />
      </div>
      {/* Categories */}
      <JobSearchCategory
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        removeSelectedCategory={removeSelectedCategory}
      />

      {/* Rate SideBar */}
      <JobSearchRateSideBar
        rate={rate}
        hourlyRate={hourlyRate}
        setHourlyRate={setHourlyRate}
      />

      <div className="flex justify-end pr-5">
        <button
          className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          onClick={handleButtonClick}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default JobSearchSideBar;
