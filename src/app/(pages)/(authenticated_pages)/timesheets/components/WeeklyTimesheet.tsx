"use client";
import React, { useEffect, useState } from "react";
import TimeInput from "./TimeInput";
import {
  classNames,
  convertHHMMToDecimal,
  decimalToHHMM,
} from "@/app/utils";
import { useWeekContext } from "@/app/providers/WeekProvider";
import {
  getContractById,
  getOrCreateTimesheet,
  updateDayEntry,
} from "@/app/lib/api";
import { DAYS_INDEX } from "@/app/constants";
import WeeklyLimitReachedPopup from "./WeeklyLimitReachedPopup";
import { sendMessage } from "@/app/utils/chatUtils";
import { ContractDetailsType } from "@/app/types";
import { AppState } from "../../messages/store";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import DailyLimitReachedPopup from "./DailyLimitReachedPopup";
import SwitchWeekButton from "./SwitchWeekButton";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { format } from "date-fns";

const hoursIndex: any = {
  mondayHours: 0,
  tuesdayHours: 1,
  wednesdayHours: 2,
  thursdayHours: 3,
  fridayHours: 4,
  saturdayHours: 5,
  sundayHours: 6,
};

const WeeklyTimesheet = () => {
  const {
    contractId,
    dates,
    lastEditableDate,
    contractEndDate,
    changeCurrentWeekIndex,
    weeks,
    resetWeek,
    tabs,
    changeTabs,
    currentTab,
    onTabChange,
  } = useWeekContext();
  const router = useRouter();
  const { setSearchParams, commit } = useParamsManager();
  const [timesheet, setTimesheet] = useState<any>();
  const [totalHours, setTotalHours] = useState(0.0);
  const [editableValues, setEditableValues] = useState<string[]>(
    new Array(dates?.length).fill("")
  );
  const [prevInput, setPrevInput] = useState("");
  const [contractDeails, setContractDetails] =
    useState<ContractDetailsType | null>(null);
  const [showWeeklyLimitModal, setShowWeeklyLimitModal] = useState(false);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);

  useEffect(() => {
    if (contractId && dates && dates.length > 0) {
      getTimesheets(contractId, dates);
    }
  }, [contractId, dates]);

  async function getContractDetails(contractId: string) {
    const { data, error } = await getContractById(contractId);
    if (!error) setContractDetails(data);
  }

  const token = useSelector((state: AppState) => state.token);

  async function sendMessageToClient(): Promise<{ error?: boolean } | void> {
    if (!contractDeails) return;
    const chatUniqueName =
      "JOBID" +
      contractDeails.job?.id +
      "USERID" +
      contractDeails?.freelancerId;
    try {
      await sendMessage(token, {
        chatFriendlyName: `${contractDeails?.freelancer?.firstName} ${contractDeails?.freelancer?.lastName}`,
        chatUniqueName: chatUniqueName,
        participantEmail: contractDeails?.freelancer?.email,
        extraAttributes: {
          jobTitle: contractDeails?.job?.title,
          jobId: contractDeails?.job?.id,
        },
      });
      router.push(`/messages?convoSearch=${chatUniqueName}`);
    } catch (err) {
      console.error("error");
      return { error: true };
    }
  }
  useEffect(() => {
    if (contractId) {
      getContractDetails(contractId);
    }
  }, [contractId]);

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

      let editableArr: any = [...editableValues];

      for (const key in timesheet) {
        if (requiredFields.includes(key)) {
          editableArr[hoursIndex[key]] = decimalToHHMM(timesheet[key]);
        }
      }
      setEditableValues(editableArr);
      setTotalHours(timesheet?.totalWeekHours);
    }
  }, [timesheet]);

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
    const response = await getOrCreateTimesheet(contractId, dates[0]);
    const isTimsesheetPending = response?.data?.status === "PENDING";
    if (currentTab === "LAST_WEEK" && !isTimsesheetPending) {
      resetCurrentWeek();
    } else {
      setTimesheet(response?.data);
    }
  };

  const handleInputChange = (dayIndex: number, e: any) => {
    let value: string = e.target.value;

    if (value === "") {
      value = "00:00";
    }

    if (value) {
      const regex = /^[0-9:.]+$/;
      if (!regex.test(value)) {
        return;
      }

      if (!value.includes(":") && !value.includes(".") && value.length > 4) {
        return;
      }
      if ((value.includes(":") || value.includes(".")) && value.length > 5) {
        return;
      }
    }

    const updatedValues = [...editableValues];
    updatedValues[dayIndex] = value;
    setEditableValues(updatedValues);
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

  function getHoursAndMinutes(str: string) {
    let hours;
    let minutes;
    if (str.includes(":")) {
      if (str.startsWith(":")) {
        hours = 0;
      } else {
        hours = parseInt(str.split(":")[0]);
      }
      if (str.endsWith(":")) {
        minutes = 0;
      } else {
        minutes = parseInt(str.split(":")[1]);
      }
    } else {
      hours = Math.floor(parseInt(str) / 100);
      minutes = parseInt(str) % 100;
    }

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return [0, 0];
    }

    return [hours, minutes];
  }

  const handleTimesheetUpdate = async (dayIndex: number, e: any) => {
    const editableValue = editableValues[dayIndex];
    let hours;
    let minutes;
    if (editableValue.includes(":")) {
      if (editableValue.startsWith(":")) {
        hours = 0;
      } else {
        hours = parseInt(editableValue.split(":")[0]);
      }
      if (editableValue.endsWith(":")) {
        minutes = 0;
      } else {
        minutes = parseInt(editableValue.split(":")[1]);
      }
    } else if (editableValue.includes(".")) {
      if (editableValue.startsWith(".")) {
        hours = 0;
      } else {
        hours = parseInt(editableValue.split(".")[0]);
      }
      if (editableValue.endsWith(".")) {
        minutes = 0;
      } else {
        minutes = parseInt(editableValue.split(".")[1]);
      }
    } else {
      minutes = Math.floor(parseInt(editableValue) / 100);
      hours = parseInt(editableValue) % 100;
    }

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return;
    }
    // Check if hours are greater than or equal to 24
    if (hours >= 24 || minutes >= 60) {
      setShowDailyLimitModal(true);
      const updatedValues = [...editableValues];
      updatedValues[dayIndex] = `00:00`;
      setEditableValues(updatedValues);
      return;
    }

    const updatedValues = [...editableValues];
    updatedValues[dayIndex] = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
    setEditableValues(updatedValues);

    let loggedTime = convertHHMMToDecimal(hours, minutes);
    let [prevInputHours, prevInputMinutes] = getHoursAndMinutes(prevInput);
    let prevInputTime = convertHHMMToDecimal(prevInputHours, prevInputMinutes);
    if (
      loggedTime + Number(totalHours) - prevInputTime >
      timesheet.weeklyLimit
    ) {
      updatedValues[dayIndex] = prevInput; // resetting the input to the original value
      setShowWeeklyLimitModal(true);
      return;
    }
    const updatedDayEntry = await updateDayEntry(
      timesheet.id,
      loggedTime,
      DAYS_INDEX[dayIndex]
    );
    setTotalHours(updatedDayEntry?.totalWeekHours);
    if (dates && dates.length > 0) {
      const d: any = dates;
      setSearchParams({ weekStart: format(d[0], "yyyy-MM-dd") });
      commit();
    }
  };

  const checkIfDisabled = (dayIndex: number) => {
    if (dates) {
      const currentDate = process.env.NEXT_PUBLIC_TIMESHEET_DATE
        ? new Date(process.env.NEXT_PUBLIC_TIMESHEET_DATE)
        : new Date();
      if (lastEditableDate && currentDate < lastEditableDate) {
        return true;
      }
      const currentDayOfWeek = currentDate.getDay();
      const currentWeekStartDate = new Date(currentDate);
      const startWeekFromMonday: any = {
        0: 6,
        1: 0,
        2: 1,
        3: 2,
        4: 3,
        5: 4,
        6: 5,
      };
      // currDate => currDay => 1 => Make Previous editable

      currentWeekStartDate.setDate(
        currentDate.getDate() - startWeekFromMonday[currentDayOfWeek]
      );
      currentWeekStartDate.setHours(0, 0, 0, 0);

      const previousWeekStartDate = new Date(currentWeekStartDate);
      previousWeekStartDate.setDate(currentWeekStartDate.getDate() - 7);

      const currentWeekEndDate = new Date(currentWeekStartDate);
      currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6); // End of the current week (Sunday)
      currentWeekEndDate.setHours(23, 59, 59, 999);
      // Calculate the start date of the week for the date at dayIndex
      const dateAtDayIndex = new Date(dates[dayIndex]);
      // Condition to check if current date is before monday midnight
      if (currentDate.getDay() === 1 && currentDate.getHours() < 24) {
        return (
          (dateAtDayIndex < previousWeekStartDate ||
          dateAtDayIndex > currentWeekEndDate) ||
          (contractEndDate && dateAtDayIndex > contractEndDate)
        );
      }
      return (
        (dateAtDayIndex < currentWeekStartDate ||
        dateAtDayIndex > currentWeekEndDate) ||
        (contractEndDate && dateAtDayIndex > contractEndDate)
      );
    }
    return false;
  };

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

  if (!dates?.length || !timesheet) {
    return <></>;
  }

  return (
    <>
      <div className="flex justify-between mt-8 sm:mb-4">
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
      <div className="grid grid-cols-2 sm:flex sm:flex-col">
        {dates && (
          <>
            <div className="grid grid-rows-7 mt-5 pt-4 sm:pt-0 sm:flex sm:mt-0 sm:my-4 sm:py-2 border-b border-gray-200 bg-gray-50 rounded-md">
              {dates &&
                dates.map((date, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`flex sm:flex-col justify-end sm:items-center sm:justify-center mx-2 sm:w-24 text-sm font-semibold ${
                      checkDateMatch(date) ? "text-black" : "text-gray-700"
                    }`}
                  >
                    <div className="me-1">
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
              <div className="mx-2 sm:w-24 text-sm font-semibold sm:items-center sm:justify-center justify-end flex">
                Total Hours
              </div>
            </div>
            <div className="sm:flex mt-6 sm:mt-0">
              {dates &&
                dates.map((date, dayIndex) => {
                  let isDisabled: any = checkIfDisabled(dayIndex);
                  return (
                    <div
                      className="flex items-center justify-center mx-2 w-24"
                      key={dayIndex}
                    >
                      <TimeInput
                        defaultValue={editableValues[dayIndex]}
                        handleTimesheetUpdate={handleTimesheetUpdate}
                        dayIndex={dayIndex}
                        handleInputChange={handleInputChange}
                        isDisabled={isDisabled}
                        key={dayIndex}
                        setPrevInput={setPrevInput}
                      />
                    </div>
                  );
                })}
              <div className="flex justify-center mx-2 w-24">
                {totalHours ? decimalToHHMM(totalHours) : "00:00"}
              </div>
            </div>
          </>
        )}
      </div>
      <DailyLimitReachedPopup
        showDailyLimitModal={showDailyLimitModal}
        setShowDailyLimitModal={setShowDailyLimitModal}
      />
      <WeeklyLimitReachedPopup
        showWeeklyLimitModal={showWeeklyLimitModal}
        setShowWeeklyLimitModal={setShowWeeklyLimitModal}
        weeklyLimit={timesheet?.weeklyLimit}
        sendMessageToClient={sendMessageToClient}
      />
    </>
  );
};

export default WeeklyTimesheet;
