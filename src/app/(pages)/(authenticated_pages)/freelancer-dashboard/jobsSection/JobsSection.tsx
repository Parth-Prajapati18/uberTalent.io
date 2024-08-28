"use client";
import Tabs from "@/app/components/ui/shared/Tabs";
import React, { useEffect, useState } from "react";
import SavedJobs from "../savedJobs/SavedJobs";
import Proposals from "../proposals/Proposals";
import Contracts from "../contracts/Contracts";
import { useFreelancerProposalContext } from "@/app/providers/FreelancerProposalProvider";
import { FreelancerJobsType } from "@/app/types";
import Offers from "../offers/offers";

const JobsSection = ({ data }: { data: FreelancerJobsType }) => {
  const { currentSection, changeCurrentSection, tabs } =
    useFreelancerProposalContext();
  const [contract, setContract] = useState<any>([]);

  useEffect(() => {
    setContract(data?.contract);
  }, [data]);

  const handleContractDataChange = (contract: any) => {
    setContract(contract);
    changeCurrentSection("Contracts");
  };

  return (
    <section className="mt-12">
      <Tabs
        onChange={changeCurrentSection}
        currentValue={currentSection}
        tabs={tabs}
        count={data.totalCount}
      />
      {/* End Tabs */}

      <>
        {currentSection === "SavedJobs" ? (
          <SavedJobs savedJobs={data?.savedJobs} />
        ) : currentSection === "Proposals" ? (
          <Proposals proposals={data?.proposal} count={data.proposalCount}/>
        ) : currentSection === "Offers" ? (
          <Offers contracts={contract} setContract={handleContractDataChange} count={data.contractCount}/>
        ) : (
          <Contracts contracts={contract} count={data.contractCount}/>
        )}
      </>
    </section>
  );
};

export default JobsSection;
