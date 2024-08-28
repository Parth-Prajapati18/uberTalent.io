"use client";
import React, { FormEvent, useEffect, useState, RefObject, FC } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchInput from "../ui/search/SearchInput";
import useParamsManager from "../hooks/useParamsManager";
import { useUserContext } from "@/app/providers/UserProvider";

interface SearchInputComponentProps {
  searchInputRef?: RefObject<typeof SearchInput>;
}

export type SearchBarType = {
  placeholder: string;
  handleSubmit?: (e: FormEvent<HTMLFormElement> | string) => void;
  //   searchTerm: string;
};

/**
 * Note: this is not longer users for freelancer search and only for client... 
 * @param param0 
 * @returns 
 */
const SearchHandler: FC<SearchInputComponentProps> = ({searchInputRef}) => {

  const { userType } = useUserContext();
  const { getSearchParams } = useParamsManager();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBarData, setSearchBarData] = useState<SearchBarType>({
    placeholder: "",
    handleSubmit: (e: FormEvent<HTMLFormElement> | string) => {},
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleJobSearch(e: any) {
    //console.log('handleJobSearch: ', e);
    const sortBy = getSearchParams("sortBy") || "relevance";
    if (typeof e === "string") {
      router.push(`/job/search?sortBy=${sortBy}`);

      return;
    }
    const formData = new FormData(e.currentTarget);
    const { search } = Object.fromEntries(formData);
    router.push(`/job/search?q=${search}&sortBy=${sortBy}`);
  }

  function handleTalentSearch(e: any) {
    //console.log("handleJobSearch");
    if (typeof e === "string") {
      router.push(`/client-dashboard/freelancer/search?q=`);

      return;
    }
    const formData = new FormData(e.currentTarget);
    const { search } = Object.fromEntries(formData);
    router.push(`/client-dashboard/freelancer/search?q=${search}`);
  }

  useEffect(() => {
    //console.log("userType", userType);
    const isClientProfile = userType === "CLIENT";

    if (userType == 'CLIENT') {
      setSearchBarData({
        placeholder: "Search For Talent",
        handleSubmit: handleTalentSearch,
      });
    } else {
      setSearchBarData({
        placeholder: "Search For Jobs",
        handleSubmit: handleJobSearch,
      });
    }
  }, [userType]);

  useEffect(() => {
    const query = searchParams.get("q");
    setSearchTerm(query || "");
  }, [searchParams]);

  return <SearchInput {...searchBarData} searchTerm={searchTerm} ref={searchInputRef}/>;
};

export default SearchHandler;
