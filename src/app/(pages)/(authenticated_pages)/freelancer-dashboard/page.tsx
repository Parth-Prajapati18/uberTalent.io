export const dynamic = 'force-dynamic';
import StatsSection from "@/app/(pages)/(authenticated_pages)/freelancer-dashboard/StatsSection";
import JobsSection from "./jobsSection/JobsSection";
import { FreelancerJobsType, SummaryResponse } from "@/app/types";
import { getCurrentUser } from "@/app/lib/session";
import { freelancerService } from "@/app/services/freelancerService";
import { notFound } from "next/navigation";
import WelcomeBanner from "@/app/components/ui/banners/WelcomeBanner";

const FreelancerDasboard = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.id) return notFound();

  const summary: SummaryResponse = await freelancerService.getSummary?.(
    currentUser.id
  );

  const data: FreelancerJobsType = await freelancerService.getFreelancerJobs?.(
    currentUser.id
  );

  return (
    <div>
      <WelcomeBanner/>
      <StatsSection stats={summary} />
      <JobsSection data={data} />
    </div>
  );
};

export default FreelancerDasboard;
