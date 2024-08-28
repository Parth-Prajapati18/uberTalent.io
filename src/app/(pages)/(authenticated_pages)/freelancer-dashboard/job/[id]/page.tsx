"use client";
import { notFound, useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { formatDistance } from "date-fns";
import {CheckIcon} from "@heroicons/react/20/solid";
import { Job } from "@prisma/client";
import { getJobById, patchJobStatus } from "@/app/lib/api";
import { JOBDURATION } from "@/app/constants";

const JobPage = () => {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<Job>({} as Job);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const data: Job = await getJobById(params.id as string);
        setData(data);
        setIsLoading(false);
      } catch (err) {
        alert("Something went wrong");
        setIsLoading(false);
      }
    })();
  }, []);
  // const data = jobPosts?.find((post) => post.id === Number(params.id));
  if (!data) notFound();

  const StatusButton = ({
    buttonText,
    statusUpdate,
  }: {
    buttonText: string;
    statusUpdate: any;
  }) => (
    <span className="sm:ml-3">
      <button
        type="button"
        className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        onClick={statusUpdate}
      >
        <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        {buttonText}
      </button>
    </span>
  );
  async function handleStatusUpdate(payload: any) {
    setIsLoading(true);
    const response = await patchJobStatus(data.id, payload);
    console.log("RESPONSE ", response);
    if (response.isError) {
      alert("Something went wrong");
      return;
    }
    router.push("/client-dashboard");
    setIsLoading(false);
  }
  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-base font-semibold leading-7 text-gray-900">
          {data.title}
        </h3>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Posted{" "}
          {data.createdAt &&
            formatDistance(new Date(data?.createdAt), new Date(), {
              addSuffix: true,
            })}
        </p>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Category
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex gap-2 flex-wrap">
              {data.categories?.map((skill) => (
                <div
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  key={skill}
                >
                  {skill}
                </div>
              ))}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Skills
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 flex gap-2 flex-wrap">
              {data.skills?.map((skill) => (
                <div
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  key={skill}
                >
                  {skill}
                </div>
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
              {data.compType === "FIXED" && `Fixed price: $${data.projectCost?.toFixed(2)}`}
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
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Job Description
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0 whitespace-pre-wrap">
              {data.description}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default JobPage;
