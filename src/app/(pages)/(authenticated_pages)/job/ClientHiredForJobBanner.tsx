"use client";
import { useEffect } from "react";
import { useHiredForJobBannerContext } from "@/app/providers/HiredForJobBannerProvider";

export default function ClientHiredForJobBanner({ job }: { job: any }) {
  const { changeJob } = useHiredForJobBannerContext();
  useEffect(() => {
    changeJob(job);
  }, [job]);

  return <></>;
}
