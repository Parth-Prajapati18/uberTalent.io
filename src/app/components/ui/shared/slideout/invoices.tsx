import { useEffect, useState } from "react";
import { getInvoicesTimesheet } from "@/app/lib/api";
import { decimalToHHMM } from "@/app/utils";
import EmptyState from "../EmptyState";

interface Props {
  contractId: string;
  contractStartDate: any;
}

export default function Invoices({ contractId, contractStartDate }: Props) {
  const [weeks, setWeeks] = useState<any>();
  const [timesheet, setTimesheet] = useState<any>([]);

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

  const [endDate, setEndDate] = useState(() => {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const daysToAdd = currentDayOfWeek !== 0 ? 7 - currentDayOfWeek : 0; // Calculate days until next Sunday
    const nextSunday = new Date(currentDate);
    nextSunday.setDate(currentDate.getDate() + daysToAdd); // Set to next Sunday
    nextSunday.setDate(nextSunday.getDate() + 7); // Add one week
    nextSunday.setHours(23);
    nextSunday.setMinutes(59);
    nextSunday.setSeconds(0);
    return nextSunday;
  });

  const generateDates = () => {
    if (contractStartDate) {
      const dates = [];
      const currentDate = new Date(contractStartDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return dates;
    }
  };

  const divideIntoWeeks = (dates: any) => {
    const weeks = [];
    let currentWeek: any = [];

    dates.forEach((date: any) => {
      currentWeek.push(date);

      if (new Date(date).getDay() === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]); // Push a copy of currentWeek to weeks array
        currentWeek = []; // Reset currentWeek
      }
    });

    // Add the last week if it's not complete
    if (currentWeek.length > 0) {
      weeks.push([...currentWeek]);
    }

    return weeks;
  };

  useEffect(() => {
    if (contractStartDate) {
      const dates = generateDates();
      const dividedWeeks = divideIntoWeeks(dates);
      setWeeks(dividedWeeks);
    }
  }, [contractStartDate]);

  useEffect(() => {
    if (contractId && weeks && weeks.length) {
      getTimesheets();
    }
  }, [contractId, weeks]);

  const getTimesheets = async () => {
    try {
      const response = await getInvoicesTimesheet(contractId);
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
          .filter(
            (ts: any) =>
              ts.week && ts?.totalWeekHours && ts?.totalWeekHours !== "0"
          )
      );
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
    }
  };

  if (timesheet === undefined) {
    return <></>;
  }

  return (
    <>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Invoices
          </h1>
          {/* <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, title,
            email and role.
          </p> */}
        </div>
        {/* <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add user
          </button>
        </div> */}
      </div>
      <div className="-mx-4 mt-8 sm:-mx-0">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Week
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
              >
                Rate
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Hours
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                Payment Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
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
            {timesheet.map((item: any) => (
              <tr key={item.id}>
                <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                  {item.week}
                  <dl className="font-normal lg:hidden">
                    <dt className="sr-only">Rate</dt>
                    <dd className="mt-1 truncate text-gray-700">
                      Rate: ${item.rate}
                    </dd>
                    <dt className="sr-only sm:hidden">Hours</dt>
                    <dd className="mt-1 truncate text-gray-500 sm:hidden">
                      Hours:{" "}
                      {item?.totalWeekHours &&
                        decimalToHHMM(item?.totalWeekHours)}
                    </dd>
                  </dl>
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 lg:table-cell">
                  ${item.rate}
                </td>
                <td className="hidden px-3 py-4 text-sm text-gray-500 sm:table-cell">
                  {item?.totalWeekHours && decimalToHHMM(item?.totalWeekHours)}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {item?.isPaid
                    ? "PAID"
                    : item?.status === "APPROVED"
                    ? "PAYMENT PENDING"
                    : item?.status === "SUBMITTED"
                    ? "APRROVAL PENDING"
                    : "IN PROGRESS"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
