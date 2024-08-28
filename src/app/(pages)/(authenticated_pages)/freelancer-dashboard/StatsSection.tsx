import CompleteProfileProgress from "@/app/components/ui/shared/CompleteProfileProgress";
import { SummaryResponse } from "@/app/types";
import { decimalToHHMM } from "@/app/utils";
import React from "react";

type Stat = {
  stat: string;
  name: string;
};
type Props = {
  stats: Stat[];
};

const StatBlock = ({
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

const StatsSection = ({ stats }: { stats: SummaryResponse }) => {
  // Formatting earnings
  const earningsRoundedToTwoDigits = parseFloat(stats.earnings?.toFixed(2));
  const formattedEarnigns = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
  }).format(earningsRoundedToTwoDigits);
  return (
    <div>
      <h3 className="text-base font-semibold leading-6 text-gray-900">
        Last 30 days
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
        <StatBlock name="Hours" value={decimalToHHMM(stats.hoursWorked)} />
        <StatBlock name="Earnings" value={`$${formattedEarnigns}`} />
        <StatBlock name="Contracts" value={stats.activeContracts} />
        <div className="overflow-hidden rounded-lg shadow">
          <CompleteProfileProgress isShowAtDashboard={true} />
        </div>
      </dl>
    </div>
  );
};

export default StatsSection;
