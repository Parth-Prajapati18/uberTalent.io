"use client";

import React, { useState, useEffect } from "react";
import { classNames, decimalToHHMM } from "@/app/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  subMonths,
  addMonths,
  format,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { useWeekContext } from "@/app/providers/WeekProvider";
import { getHistoricalTimesheet } from "@/app/lib/api";
import { useSearchParams } from "next/navigation";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import Loader from "@/app/components/ui/shared/Loader";

const hoursIndex: any = {
  mondayHours: 0,
  tuesdayHours: 1,
  wednesdayHours: 2,
  thursdayHours: 3,
  fridayHours: 4,
  saturdayHours: 5,
  sundayHours: 6,
};

const HistoricalTimesheet = () => {
  const currentDate = process.env.NEXT_PUBLIC_TIMESHEET_DATE
    ? new Date(process.env.NEXT_PUBLIC_TIMESHEET_DATE)
    : new Date();
  const { contractId, dates } = useWeekContext();
  const [currentMonth, setCurrentMonth] = useState(currentDate);
  const [days, setDays] = useState<any>([]);
  const [weeks, setWeeks] = useState<any>([]);
  const [currentWeek, setCurrentWeek] = useState<any>([]);
  const [selectedWeek, setSelectedWeek] = useState<any>([]);
  const [hoursLogged, setHoursLogged] = useState<any>([]);
  const [timesheet, setTimesheet] = useState<any>();
  const [maxTime, setMaxTime] = useState<any>(24);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { deleteSearchParam, commit } = useParamsManager();
  const searchParams = useSearchParams();

  const generateCalendar = () => {
    const options: any = { weekStartsOn: 1 }; // Start week on Monday
    const startDate = startOfWeek(startOfMonth(currentMonth), options);
    const endDate = endOfWeek(endOfMonth(currentMonth), options);
    let date = startDate;
    const calendar = [];
    const weeks = [];
    let currentWeek: any = [];

    while (date <= endDate) {
      const d = {
        date: format(date, "yyyy-MM-dd"),
        isCurrentMonth: isSameMonth(date, currentMonth),
        isToday: isSameDay(date, currentDate),
      };
      currentWeek.push({
        format1: d.date,
        format2: format(new Date(date), "d EEEE"),
        isToday: isSameDay(date, currentDate),
      });
      if (new Date(date).getDay() === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]); // Push a copy of currentWeek to weeks array
        currentWeek = []; // Reset currentWeek
      }
      calendar.push(d);
      date = addDays(date, 1);
    }

    setWeeks(weeks);
    setDays(calendar);
  };

  useEffect(() => {
    if (weeks?.length && !currentWeek.length) {
      const currentWeek = weeks.find((week: any) => {
        return week.find((item: any) => item.isToday);
      });
      setCurrentWeek(currentWeek);
    } // Set the current week on load
  }, [weeks]);

  useEffect(() => {
    if (currentWeek?.length && !selectedWeek.length) {
      setSelectedWeek(currentWeek);
    }
  }, [currentWeek]);

  useEffect(() => {
    generateCalendar();
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleGoToCurrentWeek = () => {
    setCurrentMonth(currentDate);
    setSelectedWeek(currentWeek);
  };

  const handleDayClick = (day: any) => {
    // Find the week that contains the selected date
    let selectedWeek = weeks.find((week: any) => {
      return week.find((date: any) => date.format1 === day.date);
    });
    if (selectedWeek) {
      setSelectedWeek(selectedWeek);
    }
  };

  const isDayInSelectedWeek = (day: any) => {
    return selectedWeek.find((date: any) => date.format1 === day.date);
  };

  useEffect(() => {
    if (
      selectedWeek &&
      selectedWeek.length &&
      selectedWeek[0]?.format1 &&
      contractId &&
      contractId !== "All"
    ) {
      getTimesheets();
    }
  }, [contractId, selectedWeek]);

  const getTimesheets = async () => {
    try {
      setIsLoading(true);
      const response = await getHistoricalTimesheet(
        contractId,
        new Date(selectedWeek[0]?.format1)
      );
      setTimesheet(response?.data);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (timesheet) {
      const requiredFields = [
        "mondayHours",
        "tuesdayHours",
        "wednesdayHours",
        "thursdayHours",
        "fridayHours",
        "saturdayHours",
        "sundayHours",
      ];

      const hoursLoggedArr: any = [];
      const maxTimeArr: any = [];
      for (const key in timesheet) {
        if (requiredFields.includes(key)) {
          hoursLoggedArr[hoursIndex[key]] = decimalToHHMM(timesheet[key]);
          maxTimeArr[hoursIndex[key]] = parseFloat(
            hoursLoggedArr[hoursIndex[key]]
          );
        }
      }
      const maxT = maxTimeArr.length ? Math.max(...maxTimeArr) : 0;
      setMaxTime(maxT);
      setHoursLogged(hoursLoggedArr);
    }
  }, [timesheet]);

  const calculatePercentageOf24Hours = (decimalHours: any) => {
    const hours = parseFloat(decimalHours);
    const percentage = (hours / maxTime) * 100;
    return isNaN(percentage) ? 0 : percentage.toFixed(2);
  };

  useEffect(() => {
    const weekStart = searchParams.get("weekStart");
    if (weekStart && contractId && contractId !== "All") {
      getTimesheets();
      deleteSearchParam("weekStart");
      commit();
    }
  }, [searchParams]);

  if (!contractId || contractId === "All" || !dates?.length) {
    return <></>;
  }

  return (
    <>
      <div className="border-b border-gray-200 pb-5 mt-12">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Past Timesheets
        </h3>
      </div>
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
        <div className="mt-10 text-center lg:col-start-8 lg:col-end-5 lg:row-start-1 lg:mt-9 xl:col-start-1">
          <div className="flex items-center text-gray-900">
            <button
              type="button"
              onClick={handlePreviousMonth}
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="flex flex-auto flex-col text-sm font-semibold">
              {format(currentMonth, "MMMM yyyy")}
              {!isSameMonth(currentMonth, currentDate) && (
                <button
                  className="text-xs text-gray-500 hover:text-gray-400"
                  onClick={handleGoToCurrentWeek}
                >
                  Go to Current Week
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
            <div>M</div>
            <div>T</div>
            <div>W</div>
            <div>T</div>
            <div>F</div>
            <div>S</div>
            <div>S</div>
          </div>
          <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
            {days.map((day: any, dayIdx: any) => (
              <button
                key={day.date}
                type="button"
                onClick={() => handleDayClick(day)}
                className={classNames(
                  "py-1.5 hover:bg-gray-100 focus:z-10",
                  day.isCurrentMonth
                    ? isDayInSelectedWeek(day)
                      ? "bg-gray-100"
                      : "bg-white"
                    : isDayInSelectedWeek(day)
                    ? "bg-gray-100"
                    : "bg-gray-100",
                  day.isToday && "font-semibold",
                  day.isToday && "text-black",
                  !day.isCurrentMonth && !isDayInSelectedWeek(day)
                    ? "text-gray-400"
                    : "",
                  dayIdx === 0 ? "rounded-tl-lg" : "",
                  dayIdx === 6 ? "rounded-tr-lg" : "",
                  dayIdx === days.length - 7 ? "rounded-bl-lg" : "",
                  dayIdx === days.length - 1 ? "rounded-br-lg" : ""
                )}
              >
                <time
                  dateTime={day.date}
                  className={classNames(
                    "mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                    day.isToday && "bg-black text-white"
                  )}
                >
                  {day.date.split("-").pop().replace(/^0/, "")}
                </time>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <p className="text-sm">
                <span className="font-semibold">Total Hours: </span>
                {decimalToHHMM(timesheet?.totalWeekHours || 0)}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Total earnings: </span>$
                {(
                  (timesheet?.totalWeekHours || 0) * (timesheet?.rate || 0)
                ).toFixed(2)}
              </p>
            </div>
            {timesheet?.totalWeekHours && timesheet?.totalWeekHours !== "0" && (
              <span
                // className={classNames(
                //   "font-semibold",
                //   timesheet?.isPaid ? "text-black" : (timesheet?.status === "APPROVED" || timesheet?.status === "SUBMITTED") ? "text-green-600" :"text-red-600"
                // )}
                className="font-semibold text-black"
              >
                {timesheet?.isPaid
                  ? "PAID"
                  : timesheet?.status === "APPROVED"
                  ? "PAYMENT PENDING"
                  : timesheet?.status === "SUBMITTED"
                  ? "APRROVAL PENDING"
                  : "IN PROGRESS"}
              </span>
            )}
          </div>
          <div className="relative">
            {isLoading && (
              <div className="absolute w-full h-full flex items-center justify-center">
                <Loader />
              </div>
            )}
            <ul role="list" className="divide-y divide-gray-100">
              {selectedWeek.map((date: any, index: any) => (
                <li key={date.format1} className="py-4">
                  <div className="flex items-center gap-x-3">
                    <h3 className="flex-auto truncate text-sm font-semibold leading-6 text-gray-900">
                      {`${date.format2}`}
                    </h3>
                    <time
                      dateTime={date}
                      className="flex-none text-xs text-gray-500"
                    >
                      {hoursLogged[index] || 0} hours
                    </time>
                  </div>
                  <div className="mt-3" aria-hidden="true">
                    <div className="overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-black"
                        style={{
                          width: `${calculatePercentageOf24Hours(
                            hoursLogged[index] || 0
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoricalTimesheet;
