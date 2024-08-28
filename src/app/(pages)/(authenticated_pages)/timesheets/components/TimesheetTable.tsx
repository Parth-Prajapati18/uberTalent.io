"use client";
import { useWeekContext } from "@/app/providers/WeekProvider";
import {
  classNames,
  decimalTimeTodecimalHHMM,
  decimalToHHMM,
} from "@/app/utils";
import React, { useEffect, useState } from "react";
import { ContractsWithJobClientFreelancerData } from "@/app/types";
import Image from "next/image";
import { getAllTimesheetsByClientId } from "@/app/lib/api";
import ContractSlideout from "@/app/components/ui/shared/slideout/ContractSlideout";
import SwitchWeekButton from "./SwitchWeekButton";

const TimesheetTable = () => {
  const {
    contractId,
    dates,
    weeks,
    changeCurrentWeekIndex,
    resetWeek,
    tabs,
    changeTabs,
    currentTab,
    onTabChange,
  } = useWeekContext();
  const [contractTimesheets, setContractTimesheets] = useState<[]>();
  const [showDetails, setShowDetails] = useState(false);
  const [contractDetails, setContractDetails] =
    useState<ContractsWithJobClientFreelancerData>();
  const [totalHours, setTotalHours] = useState(0.0);
  const [totalBill, setTotalBill] = useState(0.0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (contractId && dates && dates.length > 0) {
      getTimesheets(contractId, dates);
    }
  }, [contractId, dates]);

  const calculateTotalHoursAndBill = (contracts: any) => {
    let totalHours = 0;
    let totalBill = 0;
    contracts.forEach((contract: any) => {
      if (contract?.timesheets[0]?.totalWeekHours) {
        totalHours += parseFloat(contract?.timesheets[0].totalWeekHours);
      }
      if (contract?.timesheets[0]?.totalWeekHours && contract?.rate) {
        console.log("TIme ", contract?.timesheets[0].totalWeekHours);
        console.log("RATE ", contract?.rate);
        const decimalHours = decimalTimeTodecimalHHMM(
          contract?.timesheets[0].totalWeekHours
        );
        // Assuming totalBill is already declared and initialized
        totalBill += Number((decimalHours * contract?.rate).toFixed(2));
      }
    });
    setTotalHours(totalHours);
    setTotalBill(totalBill);
  };

  const resetCurrentWeek = () => {
    changeTabs(
      tabs.map((tab) =>
        tab.value === "LAST_WEEK" ? { ...tab, isShow: false } : tab
      )
    );
    onTabChange("CURRENT_WEEK");
    resetWeek();
  };

  const getTimesheets = async (contractId: string, dates: Array<string>) => {
    setIsLoading(true);
    const response = await getAllTimesheetsByClientId(contractId, dates[0]);
    const isTimsesheetPending = response?.data?.find((item: any) => {
      return item?.timesheets.find((t: any) => {
        return t.status === "PENDING";
      });
    });
    if (currentTab === "LAST_WEEK" && !isTimsesheetPending) {
      resetCurrentWeek();
    } else {
      setContractTimesheets(response?.data);
      calculateTotalHoursAndBill(response?.data);
      setIsLoading(false);
    }
  };

  const checkDateMatch = (date: string) => {
    const currentDate = process.env.NEXT_PUBLIC_TIMESHEET_DATE
      ? new Date(process.env.NEXT_PUBLIC_TIMESHEET_DATE)
      : new Date();
    const dateObj = new Date(date);
    return (
      dateObj.getDate() === currentDate.getDate() &&
      dateObj.getMonth() === currentDate.getMonth() &&
      dateObj.getFullYear() === currentDate.getFullYear()
    );
  };

  function handleContractClick(data: ContractsWithJobClientFreelancerData) {
    setContractDetails(data);
    setShowDetails(true);
  }

  const handleTabChange = (e: any, value: string) => {
    e.preventDefault();
    onTabChange(value);
    switch (value) {
      case "CURRENT_WEEK":
        resetWeek();
        break;
      default:
        if (contractId && weeks && weeks.length > 2) {
          changeCurrentWeekIndex(weeks?.length - 3);
        }
    }
  };

  if (!dates?.length || !contractTimesheets) {
    return <></>;
  }

  return (
    <>
      <div>
        <div className="flex justify-between my-4">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs
              .filter((tab) => tab.isShow)
              .map((tab) => (
                <a
                  href=""
                  key={tab.name}
                  onClick={(e) => handleTabChange(e, tab.value)}
                  className={classNames(
                    currentTab === tab.value
                      ? "bg-gray-100 text-gray-700"
                      : "text-gray-500 hover:text-gray-700",
                    "rounded-md px-3 py-2 text-sm font-medium"
                  )}
                  aria-current={tab.value === currentTab ? "page" : undefined}
                >
                  {tab.name}
                </a>
              ))}
          </nav>
          {contractId && weeks && weeks.length > 0 && (
            <>
              <SwitchWeekButton weeks={weeks} />
            </>
          )}
        </div>
        <table className="hidden sm:block sm:min-w-full">
          <thead className="border-b border-gray-300 text-gray-900">
            <tr>
              <th
                scope="col"
                className="w-[20%] py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Contract
              </th>
              <th scope="col" className="flex w-[100%] py-2.5">
                {dates &&
                  dates.map((date, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`flex flex-col items-center justify-center mx-2 text-sm font-semibold flex-grow ${
                        checkDateMatch(date) ? "text-black" : "text-gray-700"
                      }`}
                    >
                      <div className="">
                        {new Date(date).toLocaleDateString("en", {
                          weekday: "short",
                        })}
                      </div>
                      <div className="flex">
                        <span className="mr-1">
                          {new Date(date).toLocaleDateString("en", {
                            day: "2-digit",
                          })}
                        </span>

                        <span>
                          {new Date(date).toLocaleDateString("en", {
                            month: "short",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
              </th>

              <th
                scope="col"
                className="w-[12%] px-3 py-3.5 text-center text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Hours
              </th>
              <th
                scope="col"
                className="w-[12%] py-3.5 pl-3 pr-4 text-center text-sm font-semibold text-gray-900 sm:pr-0"
              >
                Pending
              </th>
            </tr>
          </thead>

          <tbody>
            {contractTimesheets?.map((contract: any) => (
              <tr key={contract?.id} className="border-b border-gray-200">
                <td className="w-[25%] h-16 pl-4 pr-3 text-sm sm:pl-0">
                  <div className="flex items-center">
                    <div className="rounded-full mr-2">
                      {contract?.freelancer?.profileImg && (
                        <Image
                          src={contract?.freelancer?.profileImg}
                          alt={
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?&w=256&h=256&q=60"
                          }
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                    </div>
                    <div>
                      <div
                        className="font-medium text-gray-900 cursor-pointer"
                        onClick={() => handleContractClick(contract)}
                      >
                        {contract?.title}
                      </div>
                      <div className="mt-1 truncate text-gray-500">
                        {contract?.freelancer?.firstName}{" "}
                        {contract?.freelancer?.lastName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="w-[100%] h-16 flex text-center items-center justify-center">
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.mondayHours)}
                  </div>
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.tuesdayHours)}
                  </div>
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.wednesdayHours)}
                  </div>
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.thursdayHours)}
                  </div>
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.fridayHours)}
                  </div>
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.saturdayHours)}
                  </div>
                  <div className="flex items-center justify-center mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.sundayHours)}
                  </div>
                </td>

                <td className="w-[12%] h-16 text-center text-sm text-gray-500">
                  {decimalToHHMM(contract?.timesheets[0]?.totalWeekHours)}
                </td>
                <td className="w-[12%] h-16 text-center text-sm text-gray-500">
                  $
                  {(
                    decimalTimeTodecimalHHMM(
                      contract?.timesheets[0]?.totalWeekHours
                    ) * contract?.rate
                  ).toFixed(2) || 0}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                scope="row"
                className="w-[25%] pl-4 pr-3 h-16 text-sm font-semibold text-gray-900"
              >
                Total
              </td>

              <td className="w-[100%] h-16 text-right text-sm text-gray-500"></td>

              <td className="w-[12%] pl-1 h-16 text-center text-sm text-gray-500">
                {totalHours && decimalToHHMM(totalHours)}
              </td>
              <td className="w-[12%] h-16 text-center text-sm text-gray-500">
                {totalBill >= 0 && "$" + totalBill.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div className="sm:hidden">
        {contractTimesheets?.map((contract: any) => (
          <div key={contract?.id} className="shadow-sm ring-1 ring-gray-900/5 p-3">
              <div className="flex border-b pb-1">
                <div className="flex items-center">
                  <div className="rounded-full mr-2">
                    {contract?.freelancer?.profileImg && (
                      <Image
                        src={contract?.freelancer?.profileImg}
                        alt={
                          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?&w=256&h=256&q=60"
                        }
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    )}
                  </div>
                  <div>
                    <div
                      className="font-medium text-gray-900 cursor-pointer"
                      onClick={() => handleContractClick(contract)}
                    >
                      {contract?.title}
                    </div>
                    <div className="mt-1 truncate text-gray-500">
                      {contract?.freelancer?.firstName}{" "}
                      {contract?.freelancer?.lastName}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row ml-6 mt-3">
                <div className="flex flex-col">
                  {dates &&
                    dates.map((date, dayIndex) => (
                      <div
                        key={dayIndex} className={`flex text-sm font-semibold flex-grow ${
                          checkDateMatch(date)
                            ? "text-black"
                            : "text-gray-700"
                        }`}>
                          <div>
                            {new Date(date).toLocaleDateString("en", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="flex ml-2">
                            <span className="mr-1">
                              {new Date(date).toLocaleDateString("en", {
                                day: "2-digit",
                              })}
                            </span>

                            <span>
                              {new Date(date).toLocaleDateString("en", {
                                month: "short",
                              })}
                            </span>
                          </div>
                      </div>)
                  )}
                  <div className="flex mt-3 text-sm font-semibold text-gray-900 flex-grow">
                    Hours
                  </div>
                  <div className="flex text-sm font-semibold text-gray-900 flex-grow">
                    Pending
                  </div>
                </div>
                <div className="flex flex-col ml-4">
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.mondayHours)}
                  </div>
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.tuesdayHours)}
                  </div>
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.wednesdayHours)}
                  </div>
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.thursdayHours)}
                  </div>
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.fridayHours)}
                  </div>
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.saturdayHours)}
                  </div>
                  <div className="flex mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.sundayHours)}
                  </div>
                  <div className="flex mt-3 mx-2 text-sm flex-grow text-gray-500">
                    {decimalToHHMM(contract?.timesheets[0]?.totalWeekHours)}
                  </div>
                  <div className="flex text-sm mx-2 flex-grow text-gray-500">
                    $
                    {(
                      decimalTimeTodecimalHHMM(
                        contract?.timesheets[0]?.totalWeekHours
                      ) * contract?.rate
                    ).toFixed(2) || 0}
                  </div>
                </div>
              </div>
          </div>)
        )}
        </div>
      </div>
      {!!contractDetails && (
        <ContractSlideout
          open={showDetails}
          setOpen={setShowDetails}
          contractDetails={contractDetails}
        />
      )}
    </>
  );
};

export default TimesheetTable;
