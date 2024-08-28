"use client";
import React, { FormEvent, useEffect, useRef, useState } from "react";
import FreelancerCategory from "./FreelancerCategory";
import FreelancerRateSideBar from "./FreelancerRateSideBar";
import { useDebouncedCallback } from "use-debounce";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchInput from "./SearchInput";
import { set } from "lodash";
import FreelancerCountry from "./FreelancerCountry";
import FreelancerAvailability from "./FreelancerAvailability";

export type SearchBarType = {
  placeholder: string;
  handleSubmit?: (e: FormEvent<HTMLFormElement> | string) => void;
  //   searchTerm: string;
};

interface SideBarProps {
  // selectedCategory: string[];
  // setSelectedCategory: (value: string[]) => void;
  // hourlyRate: number[];
  // setHourlyRate: (value: number[]) => void;
  // rate: any;
  // searchInputRef: any;
}

const SideBar: React.FC<SideBarProps> = (
  {
    // selectedCategory,
    // setSelectedCategory,
    // hourlyRate,
    // setHourlyRate,
    // rate,
    // searchInputRef,
  }
) => {
  const searchInputRef = useRef(null);

  const [searchBarData, setSearchBarData] = useState<SearchBarType>({
    placeholder: "",
    handleSubmit: (e: FormEvent<HTMLFormElement> | string) => {},
  });

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState([1, 250]);
  const [page, setPage] = useState<any>(1);
  const [searchValue, setSearchValue] = useState<any>(null);
  const [rate, setRate] = useState<any>(null);

  const handleQueryParams = useDebouncedCallback(
    (selectedCategory: string[], selectedCountry: string[], selectedAvailability: string[], hourlyRate: number[], searchValue: string) => {
      console.log(
        "handleQueryParams",
        selectedCategory,
        selectedCountry,
        selectedAvailability,
        hourlyRate,
        searchValue,
        page
      );
      const params = new URLSearchParams(searchParams);

      if (selectedCategory.length > 0) {
        params.set("c", selectedCategory.join(","));
      } else {
        params.delete("c");
      }

      if (selectedCountry.length > 0) {
        params.set("co", selectedCountry.join(','));
      } else {
        params.delete("co");
      };

      if (selectedAvailability.length > 0) {
        params.set("av", selectedAvailability.join(','));
      } else {
        params.delete("av");
      };

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
      placeholder: "Search For Talent",
      handleSubmit: handleTalentSearch,
    });
  }, []);

  //Note category and rate are the only properties withou callbacks so we need watch for chnages.
  useEffect(() => {
    console.log("search change");
    handleQueryParams(selectedCategory, selectedCountry, selectedAvailability, hourlyRate, searchValue);
  }, [selectedCategory, selectedCountry, selectedAvailability, hourlyRate, searchValue]);

  const removeSelectedCategory = (val: any) => {
    let temp = [...selectedCategory];
    let indx = temp.findIndex((elem) => elem === val);
    if (indx != -1) {
      temp.splice(indx, 1);
      setSelectedCategory(temp);
    }
  };

  const removeSelectedCountry = (val: any) => {
    let temp = [...selectedCountry];
    let indx = temp.findIndex((elem) => elem === val);
    if (indx != -1) {
      temp.splice(indx, 1);
      setSelectedCountry(temp);
    }
  };

  const removeSelectedAvailability = (val: any) => {
    let temp = [...selectedAvailability];
    let indx = temp.findIndex((elem) => elem === val);
    if (indx != -1) {
      temp.splice(indx, 1);
      setSelectedAvailability(temp);
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
    setSelectedCountry([]);
    setHourlyRate([1, 250]);
    setSearchValue("");
    setSelectedAvailability([]);
    const params = new URLSearchParams(searchParams);
    params.delete("s");
    replace(`${pathname}?${params.toString()}`);
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
      <FreelancerCategory
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        removeSelectedCategory={removeSelectedCategory}
      />

      {/* Countries */}
      <FreelancerCountry selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        removeSelectedCountry={removeSelectedCountry} />

      {/* Rate SideBar */}
      <FreelancerRateSideBar
        rate={rate}
        hourlyRate={hourlyRate}
        setHourlyRate={setHourlyRate}
      />

      {/* Availability */}
      <FreelancerAvailability
        selectedAvailability={selectedAvailability}
        setSelectedAvailability={setSelectedAvailability}
        removeSelectedAvailability={removeSelectedAvailability}
      />

      <div className="flex justify-end pr-5">
        <button
          className="rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          onClick={handleButtonClick}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default SideBar;
