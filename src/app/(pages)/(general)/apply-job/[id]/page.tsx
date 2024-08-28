import React from "react";
import SharePublicPosting from "@/app/components/ui/shared/SharePublicPosting";
const ApplyJobPage = async ({ params }: any) => {
  return (
    <div className="md:px-24">
      <SharePublicPosting params={params} />
    </div>
  );
};
export default ApplyJobPage;
