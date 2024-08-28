import EmptyState from "@/app/components/ui/shared/EmptyState";
import Loader from "@/app/components/ui/shared/Loader";
import { FreelancerTypeExtended } from "@/app/schema/FreelancerOnboardingSchema";
import React from "react";
import FreelancerCard from "./FreelancerCard";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { classNames } from "@/app/utils";
import { Job } from "@prisma/client";
import ResetBtn from "./resetBtn";
import Pagination from "./Pagination";
import { freelancerService } from "@/app/services/freelancerService";

interface PageInfo {
  totalRecords: number;
  totalPages: number;
  pageNo: number;
  perPage: number;
  showingStart: number;
  showingEnd: number;
}

interface SearchParams {
  q?: string;
  c?: string;
  co?: string;
  av?: string;
  h?: string;
  p?: string;
  s?: string;
}

export default async function Freelancers({
  searchParams,
  activeJobs,
}: {
  searchParams: SearchParams;
  activeJobs: Job[];
}) {
  const fetchData = async (searchParams: SearchParams) => {
    console.log("fetchData params", searchParams);

    try {
      const freelancers = await freelancerService.getFreelancers(
        searchParams.q || "", // Provide a default value of an empty string
        searchParams.p ? Number(searchParams.p) : 1,
        10,
        searchParams.c || "", // Provide a default value of an empty string
        searchParams.co || "", // Provide a default value of an empty string
        searchParams.h || "", // Provide a default value of an empty string
        searchParams.av || "", 
        searchParams.s || "", 
      );

      console.log("freelancers counts", freelancers.data.length);

      return { ...freelancers };
    } catch (error) {
      console.error("Error fetching freelancers:", error);
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

  const freelancers = await fetchData(searchParams);

  return (
    <>
      <div className="flex-grow">
        {/* Freelancer list */}

        {/* Empty state */}
        {freelancers.data.length === 0 && (
          <div className="px-3">
            <ResetBtn />
          </div>
        )}

        {/* Freelancers */}
        {freelancers.data.map(
          (freelancer: FreelancerTypeExtended, index: number) => (
            <FreelancerCard
              key={freelancer.email}
              freelancer={freelancer}
              index={index}
              length={freelancers.data.length}
              activeJobs={activeJobs}
            />
          )
        )}

        {/* Pagination */}
        <Pagination pageInfo={freelancers.pageInfo} />
      </div>
    </>
  );
}
