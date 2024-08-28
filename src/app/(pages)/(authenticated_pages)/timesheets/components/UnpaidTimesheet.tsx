"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWeekContext } from "@/app/providers/WeekProvider";
import { getUnpaidTimesheet, patchTimesheet } from "@/app/lib/api";
import { decimalToHHMM } from "@/app/utils";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import Tooltip from "@/app/components/ui/shared/Tooltip";

const UnpaidTimesheet = () => {
  const { contractId, weeks, dates } = useWeekContext();
  const [timesheet, setTimesheet] = useState<any>([]);
  const { setSearchParams, commit } = useParamsManager();

  useEffect(() => {
    if (contractId && Array.isArray(weeks) && weeks.length) {
      getTimesheets();
    }
  }, [contractId, weeks]);

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

  const getTimesheets = async () => {
    try {
      const response = await getUnpaidTimesheet(contractId);
      const timesheet = response?.data || [];
      setTimesheet(
        timesheet
          .map((item: any) => {
            var weekStart = new Date(item.weekStart);
            const findWeek = weeks.find((week: any) => {
              return week[0] >= weekStart && weekStart <= week[week.length - 1];
            });
            item.week = findWeek ? `${formatWeekText(findWeek)}` : "";
            let pending = 0;
            if (item?.totalWeekHours) {
              pending = parseFloat(item?.totalWeekHours) * (item?.rate || 0);
            }
            item.pending = pending;
            return item;
          })
          .filter((ts: any) => ts.week && ts?.totalWeekHours && ts?.totalWeekHours !== "0")
      );
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
    }
  };

  const handleMarkAsPaid = async (timesheet: any) => {
    try {
      const response = await patchTimesheet(timesheet.id, { isPaid: true });
      const data = response || [];
      setTimesheet((prevTS: any) => {
        return prevTS
          .map((ts: any) => {
            if (ts.id === timesheet.id) {
              return { ...ts, isPaid: data.isPaid };
            }
            return ts;
          })
          .filter((ts: any) => !ts.isPaid);
      });
      setSearchParams({ weekStart: timesheet.weekStart });
      commit();
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
    }
  };

  if (!dates?.length) {
    return <></>;
  }

  return (
    <>
      <div className="border-b border-gray-200 pb-5 mt-8">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Unpaid Timesheets
        </h3>
      </div>
      <div className="hidden sm:block">
        <table className="sm:min-w-full">
          <thead className="border-b border-gray-300 text-gray-900">
            <tr>
              <th
                scope="col"
                className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Job Title
              </th>
              <th
                scope="col"
                className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Week
              </th>
              <th
                scope="col"
                className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Hours
              </th>
              <th
                scope="col"
                className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Pending
              </th>
              <th
                scope="col"
                className="py-2.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              ></th>
            </tr>
          </thead>
          <tbody>
            {/* Empty state */}
            {timesheet?.length === 0 && (
              <tr className="border-b border-gray-200">
                <td className="h-16 pl-4 pr-3 text-sm sm:pl-0" colSpan={4}>
                  <div className="text-base text-gray-800 my-8">
                    <EmptyState label={`NO RESULTS`} />
                  </div>
                </td>
              </tr>
            )}
            {/* List */}
            {timesheet?.map((item: any) => (
              <tr key={item?.id} className="border-b border-gray-200">
                <td className="h-16 pl-4 pr-3 text-sm sm:pl-0">
                  {item?.contract?.job?.title || ""}
                </td>
                <td className="h-16 pl-4 pr-3 text-sm sm:pl-0">
                  {item?.week || ""}
                </td>
                <td className="h-16 pl-4 pr-3 text-sm sm:pl-0">
                  {item?.totalWeekHours && decimalToHHMM(item?.totalWeekHours)}
                </td>
                <td className="h-16 pl-4 pr-3 text-sm sm:pl-0">
                  ${item?.pending}
                </td>
                <td>
                  {!item.contract.paymentService && <div>
                    {item.status === "SUBMITTED" ? (
                      <button
                        onClick={(e) => handleMarkAsPaid(item)}
                        className="rounded-md px-2.5 py-1.5 text-sm font-semibold bg-black text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        Mark as paid
                      </button>
                    ) : (
                      <Tooltip message="This Timesheet is not submitted by Freelancer">
                        <button
                          className="rounded-md px-2.5 py-1.5 text-sm font-semibold bg-black text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:bg-gray-300"
                          disabled
                        >
                          Mark as paid
                        </button>
                      </Tooltip>
                    )}
                  </div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden">
        {timesheet?.length === 0 && (
          <div className="text-base text-gray-800 my-8">
            <EmptyState label={`NO RESULTS`} />
          </div>
        )}
        {timesheet?.map((item: any) => (
          <div key={item?.id} className=" shadow-sm ring-1 ring-gray-900/5 p-3">
            <div className="flex flex-row">
              <div className="flex flex-col">
                <div className="py-1 pl-3 pr-3 text-left text-sm font-semibold text-gray-900">
                  Job Title
                </div>
                <div className="py-1 pl-3 pr-3 text-left text-sm font-semibold text-gray-900">
                  Week
                </div>
                <div className="py-1 pl-3 pr-3 text-left text-sm font-semibold text-gray-900 ">
                  Hours
                </div>
                <div className="py-1 pl-3 pr-3 text-left text-sm font-semibold text-gray-900">
                  Pending
                </div>
              </div>
              <div className="flex flex-col">
                <div className="py-1 pl-3 pr-3 text-sm">
                  {item?.contract?.job?.title || ""}
                </div>
                <div className="py-1 pl-3 pr-3 text-sm">{item?.week || ""}</div>
                <div className="py-1 pl-3 pr-3 text-sm">
                  {item?.totalWeekHours && decimalToHHMM(item?.totalWeekHours)}
                </div>
                <div className="py-1 pl-3 pr-3 text-sm">${item?.pending}</div>
              </div>
            </div>
            <div className="mt-3">
              {item.status === "SUBMITTED" ? (
                <button
                  onClick={(e) => handleMarkAsPaid(item)}
                  className="rounded-md px-2.5 py-1.5 text-sm font-semibold bg-black text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Mark as paid
                </button>
              ) : (
                <Tooltip message="This Timesheet is not submitted by Freelancer">
                  <button
                    className="rounded-md px-2.5 py-1.5 text-sm font-semibold bg-black text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:bg-gray-300"
                    disabled
                  >
                    Mark as paid
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default UnpaidTimesheet;
