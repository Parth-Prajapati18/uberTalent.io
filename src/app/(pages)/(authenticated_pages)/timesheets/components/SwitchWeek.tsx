"use client";

import React from "react";
import SwitchWeekButton from "./SwitchWeekButton";
import { useWeekContext } from "@/app/providers/WeekProvider";

const SwitchWeek = () => {
  const { contractId, weeks } = useWeekContext();

  return (
    <div>
      {contractId && weeks && weeks.length > 0 && (
        <>
          <SwitchWeekButton weeks={weeks} />
        </>
      )}
    </div>
  );
};

export default SwitchWeek;
