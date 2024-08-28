"use client";

import React from "react";
import { useWeekContext } from "@/app/providers/WeekProvider";

type Props = {
  weeks: any;
};
const SwitchWeekButton = ({ weeks }: Props) => {
  const { currentWeekIndex } = useWeekContext();

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatWeekText = (week: any) => {
    const startDate = formatDate(week[0]);
    const endDate = formatDate(week[week.length - 1]);
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex items-center md:items-stretch mr-2">
        <div className="px-2 py-2 text-sm text-gray-900">
          {currentWeekIndex !== undefined &&
            weeks[currentWeekIndex] &&
            formatWeekText(weeks[currentWeekIndex])}
        </div>
      </div>
    </div>
  );
};

export default SwitchWeekButton;
