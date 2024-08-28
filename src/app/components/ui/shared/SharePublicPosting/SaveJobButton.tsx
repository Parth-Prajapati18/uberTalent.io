"use client";
import { useRouter } from "next/navigation";
import React from "react";
const SaveJobButton = ({ job }: any) => {
  const router = useRouter();
  
  const handleSaveJob = (e: any) => {
    e.stopPropagation();
    localStorage.setItem("saveJobId", job.id);
    router.push("/sign-up");
  };

  return (
    <button
      type="button"
      onClick={(e) => handleSaveJob(e)}
      className="h-full rounded-md px-2.5 py-1.5 text-sm font-semibold sm:block bg-black text-white shadow-sm hover:bg-stone-800 ocus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
    >
      Save Job
    </button>
  );
};
export default SaveJobButton;
