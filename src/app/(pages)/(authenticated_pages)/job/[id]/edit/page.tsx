"use client";
import { CreateJobType } from "@/app/schema/CreateJobSchema";
import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Job } from "@prisma/client";
import JobForm from "@/app/components/forms/JobForm";
import { getJobById, updateJob } from "@/app/lib/api";
import { useNotification } from "@/app/providers/NotificationProvider";

export default function EditJob() {
  const params = useParams();
  const [data, setData] = useState<Job>({} as Job);
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const showNotification = useNotification();
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data: Job = await getJobById(params.id as string);
        setData(data);
      } catch (err) {
        alert("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  if (!data) notFound();
  const router = useRouter();

  const updateJobPayload = (data: CreateJobType) => {
    if (data.compensation === "HOURLY") {
      delete data.projectCost;
    } else if (data.compensation === "FIXED") {
      delete data.hourlyMinRate;
      delete data.hourlyMaxRate;
    }
    return data;
  };

  async function handleSaveAsDraft(data: CreateJobType) {
    setIsLoading(true);
    const finalPayload = {
      ...updateJobPayload(data),
      status: "DRAFT",
      isPublished: false,
    };
    try {
      const response = await updateJob(params.id as string, finalPayload);
      if (response.isError) {
        if (response.error.status === "invalid") {
          showNotification("error", response.error.message);
        } else {
          showNotification("error", "Something went wrong");
        }
        return;
      }
      router.push("/client-dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddJob(data: CreateJobType) {
    setIsLoading(true);
    const finalPayload = {
      ...updateJobPayload(data),
      status: "ACTIVE",
      isPublished: true,
    };
    try {
      const response = await updateJob(params.id as string, finalPayload);
      if (response.isError) {
        if (response.error.status === "invalid") {
          showNotification("error", response.error.message);
        } else {
          showNotification("error", "Something went wrong");
        }
        return;
      }
      router.push("/client-dashboard");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <JobForm
      data={data}
      handleSaveAsDraft={handleSaveAsDraft}
      handleAddJob={handleAddJob}
      type="edit"
    />
  );
}
