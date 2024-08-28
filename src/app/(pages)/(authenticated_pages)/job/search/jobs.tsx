import React from "react";
import ResetBtn from "./resetBtn";
import { jobService } from "@/app/services/jobService";
import JobListing from "./JobListing";
import JobPagination from "./JobPagination";

interface SearchParams {
  q?: string;
  o?: string;
  c?: string;
  h?: string;
  p?: string;
}

export default async function Jobs({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const fetchData = async (searchParams: SearchParams) => {
    console.log("fetchData params", searchParams);

    try {
      const resp: any = await jobService.searchJobs(
        searchParams.q || "", // Provide a default value of an empty string
        searchParams.o || "", // Provide a default value of an empty string
        searchParams.c || "", // Provide a default value of an empty string
        searchParams.h || "", // Provide a default value of an empty string
        searchParams.p ? Number(searchParams.p) : 1,
        10
      );

      console.log("jobs counts", resp?.jobs.length);

      return resp;
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return {
        data: [],
        pageInfo: {
          totalRecords: 0,
          totalPages: 0,
          pageNo: 0,
          perPage: 0,
          showingStart: 0,
          showingEnd: 0,
        },
      };
    }
  };

  const data: any = await fetchData(searchParams);

  return (
    <>
      <div className="flex-grow">
        {/* Freelancer list */}

        {/* Empty state */}
        {data?.jobs?.length === 0 && (
          <div className="px-3">
            <ResetBtn />
          </div>
        )}

        {/* Jobs */}
        <JobListing data={data?.jobs} />

        {/* Pagination */}
        <JobPagination pageInfo={data?.pageInfo} />
      </div>
    </>
  );
}
