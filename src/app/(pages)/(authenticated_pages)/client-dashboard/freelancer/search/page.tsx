
// import { freelancerService } from "@/app/services/freelancerService";
// import { searchFreelancer } from "@/app/lib/api";
// import { FreelancerTypeExtended } from "@/app/schema/FreelancerOnboardingSchema";
// import { Suspense } from "react";
import SideBar from "./SideBar";
import Freelancers from "./Freelancers";
import FreelanceSearchHeader from "./FreelanceSearchHeader";
import { jobService } from "@/app/services/jobService";
import { Job } from "@prisma/client";
// import FreelancerSlideOver from "@/app/components/FreelancerSlideOver";
import InviteSlideout from "@/app/components/ui/shared/slideout/InviteSlideout";

interface SearchParams {
  q?: string;
  c?: string;
  co?: string;
  av?: string;
  h?: string;
  p?: string;
  s?: string;
}
export const dynamic = "force-dynamic";

export default async function Page({
  searchParams = {},
}: {
  searchParams: SearchParams;
}) {
  //console.log("searchParams", searchParams);

  const getActiveJobs = async () => {
    try {
      const data: Job[] = await jobService.getActiveClientJobs({
        status: "ACTIVE",
      });
      return data;
    } catch (error) {
      console.error(error);
    }
  };

  let activeJobs: Job[] = (await getActiveJobs()) || [];

  return (
    // <div>
    //   <Suspense fallback={<div>Loading...</div>}>
    //     <FreelancerSearchComponent data={freelancersData} page={paging} />
    //     {/* <FreelancerSearchComponent /> */}
    //   </Suspense>
    // </div>
    <div className="flex flex-col">
      <FreelanceSearchHeader />

      <div className="flex flex-col md:flex-row">
        {/* SideBar */}
        <div className="hidden sm:block">
          <SideBar />
        </div>

        {/* Freelancers */}
        <Freelancers searchParams={searchParams} activeJobs={activeJobs} />
      </div>
      {/* <FreelancerSlideOver /> */}
      <InviteSlideout />
    </div>
  );
}
