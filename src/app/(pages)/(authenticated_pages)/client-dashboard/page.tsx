"use client";
import React, { Suspense } from "react";
import JobPostings from "./JobPostings";
import Contracts from "./contracts/Contracts";
import FreelancerContractProvider from "@/app/providers/FreelancerContractProvider";
import WelcomeBanner from "@/app/components/ui/banners/WelcomeBanner";
import UpdateContractSlideout from "../job/[id]/proposals/components/updateContractSlideout";
import RecommendedFreelancers from "./RecommendedFreelancers";

const ClientDashboard = () => {
  return (
    <>
      <WelcomeBanner />
      <JobPostings />
      <Suspense>
        <FreelancerContractProvider>
          <Contracts />
        </FreelancerContractProvider>

        <UpdateContractSlideout />
      </Suspense>
      <RecommendedFreelancers/>
      {/* <SectionContainer className="shadow-none">
        <div className="bolder text-2xl mb-6">Top Freelancers</div>
        <TopFreelancers />
      </SectionContainer> */}
    </>
  );
};

export default ClientDashboard;
