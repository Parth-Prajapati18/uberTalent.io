"use client";
import { getEarningSummary } from "@/app/lib/api";
import { useWeekContext } from "@/app/providers/WeekProvider";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const EarningSummaryBlock = ({
  name,
  value,
}: {
  name: string;
  value: number | string;
}) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <dt className="truncate text-sm font-medium text-gray-500">{name}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
        {value}
      </dd>
    </div>
  );
};

const EarningSummary = () => {
  const { contractId, dates } = useWeekContext();
  const [summary, setSummary] = useState<any>(null);
  const searchParams = useSearchParams();

  const earningSummary = async () => {
    try {
      const response = await getEarningSummary(contractId);
      const data = response || null;
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
    }
  };

  useEffect(() => {
    if(contractId) {
      earningSummary();
    }
  }, [contractId]);

  useEffect(() => {
    const weekStart = searchParams.get("weekStart");
    if (weekStart && contractId !== "All") {
      earningSummary();
    }
  }, [searchParams]);

  if(!summary || !dates?.length) {
    return <></>
  }

  return (
    <div>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <EarningSummaryBlock
          name="Total hours"
          value={summary?.totalHours || 0}
        />
        <EarningSummaryBlock
          name="Paid"
          value={`$${(summary?.paid || 0).toFixed(2)}`}
        />
        <EarningSummaryBlock
          name="To be paid"
          value={`$${(summary?.toBePaid || 0).toFixed(2)}`}
        />
      </dl>
    </div>
  );
};

export default EarningSummary;
