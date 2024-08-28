"use client";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { useUserContext } from "@/app/providers/UserProvider";
import { useEffect, useState } from "react";
import { patchJobStatus } from "@/app/lib/api";
import { useNotification } from "@/app/providers/NotificationProvider";
import { useRouter } from "next/navigation";

export default function HiredForJobBanner({ job }: { job: any }) {
  const { userType } = useUserContext();
  const showNotification = useNotification();
  const router = useRouter();
  const [isContractActive, setIsContractActive] = useState(false);
  const [isJobClosed, setIsJobClosed] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isJobClosing, setIsJobClosing] = useState(false);

  useEffect(() => {
    setIsJobClosed(job?.status === "CLOSED");
    if (job?.contract) {
      const contract = job?.contract || [];
      const isContractActive = contract.some((c: any) => c.status === "ACTIVE");
      setIsContractActive(isContractActive);
    } else {
      setIsContractActive(false);
    }
    if (job?.id && localStorage.getItem(`hired_${job?.id}`)) {
      setIsBannerDismissed(true);
    } else {
      setIsBannerDismissed(false);
    }
  }, [job]);

  function handleDismiss() {
    localStorage.setItem(`hired_${job?.id}`, "YES");
    setIsBannerDismissed(true);
  }

  async function handleJobClose() {
    setIsJobClosing(true);
    const response = await patchJobStatus(job.id, { status: "CLOSED" });
    if (response.isError) {
      if (response.error.status === "invalid") {
        showNotification("error", response.error.message);
      } else {
        showNotification("error", "Something went wrong");
      }
      return;
    }
    setIsJobClosing(false);
    router.push("/client-dashboard");
    router.refresh();
  }

  if (
    userType !== "CLIENT" ||
    !isContractActive ||
    isBannerDismissed ||
    isJobClosed
  ) {
    return <></>;
  }

  return (
    <div className="rounded-md bg-blue-50 p-4 -mb-4 lg:-mb-12">
      <div className="flex lg:px-8 max-w-6xl mx-auto">
        <div className="flex-shrink-0">
          <InformationCircleIcon
            aria-hidden="true"
            className="h-5 w-5 text-blue-400"
          />
        </div>
        <div className="ml-2">
          <div className="text-sm text-blue-700">
            <p>
              You’ve already hired someone for this job. Would you like to close
              the job listing or continue seeking more candidates?
            </p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                disabled={isJobClosing}
                onClick={handleJobClose}
                className="rounded-md bg-blue-50 px-2 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
              >
                Close Job
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="ml-3 rounded-md bg-blue-50 px-2 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-blue-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
