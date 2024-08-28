import { jobService } from "@/app/services/jobService";
import JobSearchSideBar from "./JobSearchSideBar";
import Jobs from "./jobs";
import JobPostingsHeader from "./JobPostingsHeader";

interface SearchParams {
  q?: string;
  o?: string;
  c?: string;
  h?: string;
  p?: string;
}

interface rate {
  min: number;
  max: number;
}

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams = {},
}: {
  searchParams: SearchParams;
}) {
  const getJobRate = async () => {
    try {
      const rate: rate = await jobService.getJobRate();
      return rate;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  let rate: rate = (await getJobRate()) || { min: 1, max: 250 };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <JobPostingsHeader rate={rate} />

      <div className="flex flex-col md:flex-row">
        {/* SideBar */}
        <div className="hidden sm:block">
          <JobSearchSideBar jobRate={rate} />
        </div>

        {/* jobs */}
        <Jobs searchParams={searchParams} />
      </div>
    </div>
  );
}
