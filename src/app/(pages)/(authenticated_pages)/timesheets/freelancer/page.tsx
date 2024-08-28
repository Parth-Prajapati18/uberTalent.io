import React from "react";
import WeekProvider from "@/app/providers/WeekProvider";
import ContractsSelect from "../components/ContractsSelect";
import WeeklyTimesheet from "../components/WeeklyTimesheet";
import HistoricalTimesheet from "../components/HistoricalTimesheet";
import NoTimesheetPopup from "../components/NoTimesheetPopup";
import EarningSummary from "../components/EarningSummary";
import { timesheetService } from "@/app/services/timesheetService";
export default async function FreelancerTimesheet() {
  const resp = await timesheetService.getTimesheetContracts();
  let contracts;
  if (resp?.contracts?.length > 0) {
    contracts = resp?.contracts || [];
  } else {
    contracts = [];
  }
  
  return (
    <>
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Timesheet
        </h3>
      </div>
      <WeekProvider>
        <div className="flex w-full my-4">
          <ContractsSelect contracts={contracts} />
        </div>
        {!!contracts.length && (
          <div>
            <WeeklyTimesheet />
          </div>
        )}
        <div className="mt-12">
          <EarningSummary />
        </div>
        <HistoricalTimesheet />
        <NoTimesheetPopup contract={!contracts.length} />
      </WeekProvider>
    </>
  );
}
