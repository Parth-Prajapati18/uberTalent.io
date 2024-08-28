import ProposalRow from "./components/proposalRow";
import { ProposalsWithUserAndJobType } from "@/app/types";
import { SelectorLinks } from "./components/selectorLinks";
import { notFound } from "next/navigation";
import DetailSlideout from "./components/detailSlideout";
import ContractDetailSlideout from "./components/contractDetailSlideout";
import Link from "next/link";
import BackButton from "@/app/components/ui/shared/BackButton";
import CreateContractSlideout from "./components/createContractSlideout";
import UpdateContractSlideout from "./components/updateContractSlideout";
import { proposalService } from "@/app/services/proposalService";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import ClientHiredForJobBanner from "../../ClientHiredForJobBanner";
import { jobService } from "@/app/services/jobService";

export default async function Proposals({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: any;
}) {
  const jobData = await jobService.getJobById(params.id);
  if (!jobData) return notFound();
  const { data, error, count } = await proposalService.getProposalsByJob(
    params.id,
    searchParams?.status
  );
  if (error) {
    console.error(error);
    notFound();
  }

  let message, buttonText, buttonLink;

  switch (searchParams?.status) {
    case 'SUBMITTED':
      message = "No Submitted Proposals";
      buttonText = "Invite Freelancers";
      buttonLink = "/client-dashboard/freelancer/search";
      break;
    case 'SHORT_LISTED':
      message = "No Shortlisted Proposals";
      // No button for Shortlisted tab
      break;
    case 'OFFER':
      message = "No Offers";
      buttonText = "Make Offer";
      buttonLink = `/job/${params.id}/proposals?status=SUBMITTED`;
      break;
    case 'DISQUALIFIED':
      message = "No Disqualified Proposals";
      // No button for Disqualified tab
      break;
    default:
      message = "No data available";
  }

  return (
    <>
      <ClientHiredForJobBanner job={jobData}/>
      <div className="flex-cols items-center">
        <div className="bolder  text-base font-semibold leading-6 text-gray-900 my-2 pl-2">
          Proposals for {jobData.title} 
          {
            jobData.status === "CLOSED" ? <p className="inline text-yellow-800 bg-yellow-50 ring-yellow-600/20 rounded-md whitespace-nowrap items-center mx-3 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset">CLOSED</p> : ""
          }
        </div>
        <div className="flex items-center bolder text-sm font-normal leading-6 text-gray-900 mb-0">
          <BackButton>Back</BackButton>
        </div>
      </div>
      <SelectorLinks count={count}/>
      <div className="mt-8 flex flex-col">
        {data && data.length > 0 ? (
          data.map((proposal: ProposalsWithUserAndJobType, index: number) => (
            <>
              {index !== 0 && <hr className="my-6 border-gray-200"/>}
              <ProposalRow key={proposal.id} {...proposal} />
            </>
          ))
        ) : (
          <EmptyState label={message} ctaText={buttonText} ctaHref={buttonLink} />
        )}
      </div>
      <DetailSlideout />
      <ContractDetailSlideout />
      <CreateContractSlideout />
      <UpdateContractSlideout />
    </>
  );
}
