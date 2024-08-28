import React from "react";
import { notFound, redirect } from "next/navigation";
import { formatDistance } from "date-fns";
import { JOBDURATION } from "@/app/constants";
import { jobService } from "@/app/services/jobService";
import SaveJobButton from "./SaveJobButton";
import JobClosedMsg from "../JobClosedMsg";
// Fetch job data server-side
const fetchData = async (id: any) => {
  const data = await jobService.getJobDetailById(id);
  return data;
};
const SharePublicPosting = async ({ params }: any) => {
  const data = await fetchData(params?.id);
  if (!data) return JobClosedMsg();
  return (
    <div>
      <div className="flex flex-col items-center justify-between px-4 sm:flex-row sm:px-0 gap-3">
        <div className="text-center sm:text-left">
          <div className="flex items-start gap-x-3">
            <h3 className="text-base font-semibold leading-7 text-gray-900">
              {data.title}
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Posted{" "}
            {data.createdAt &&
              formatDistance(new Date(data?.createdAt), new Date(), {
                addSuffix: true,
              })}
          </p>
        </div>
        <SaveJobButton job={data} />
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Job Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
              {data.description}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Category
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex gap-2 flex-wrap">
              {data.categories?.map((category: string) => (
                <span
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                  key={category}
                >
                  {category}
                </span>
              ))}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Skills
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex gap-2 flex-wrap">
              {data.skills?.map((skill: string) => (
                <span
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600"
                  key={skill}
                >
                  {skill}
                </span>
              ))}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Compensation
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {data.compType === "HOURLY" &&
                `Hourly: $${data.hourlyMinRate?.toFixed(
                  2
                )} - $${data.hourlyMaxRate?.toFixed(2)}`}
              {data.compType === "FIXED" &&
                `Fixed price: $${data.projectCost?.toFixed(2)}`}
              {!data.compType && "Not ready to set a budget"}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Project Length
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {JOBDURATION[data.duration]}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};
export default SharePublicPosting;
