"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import useParamsManager from "../components/hooks/useParamsManager";
import { getAllContract, getContractById } from "../lib/api";
import { isBeforeMondayNoon } from "../utils";

type WeekType = {
  dates: [];
  contractId: string | null;
  weeks: any;
  currentWeekIndex: number;
  changeCurrentWeekIndex: (index: number) => void;
  resetWeek: () => void;
  lastEditableDate: Date | undefined;
  contractEndDate: Date | undefined;
  tabs: any[];
  changeTabs: (tabs: any[]) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
};
const WeekContext = createContext<WeekType>({} as WeekType);

const weekTabs = [
  { name: "Last Week", value: "LAST_WEEK", isShow: true },
  { name: "Current Week", value: "CURRENT_WEEK", isShow: true },
];

export const WeekProvider = ({ children }: { children: ReactNode }) => {
  const { getSearchParams } = useParamsManager();
  const contractId = getSearchParams("contractId");
  const [contractStartDate, setContractStartDate] = useState<Date>();
  const [lastEditableDate, setLastEditableDate] = useState<Date | undefined>();
  const [contractEndDate, setContractEndDate] = useState<Date | undefined>();

  const [tabs, setTabs] = useState(weekTabs);
  const [currentTab, setCurrentTab] = useState<any>(weekTabs[0].value);

  function getMonday(date: Date) {
    date = new Date(date);
    var day = date.getDay(),
      diff = date.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is Sunday
    return new Date(date.setDate(diff));
  }

  const isShowLastWeekTab = (currentMonday: any, contractStartDate: any) => {
    const normalizedContractStartDate = new Date(contractStartDate);
    normalizedContractStartDate.setHours(0, 0, 0, 0);

    const normalizedCurrentMonday = new Date(currentMonday);
    normalizedCurrentMonday.setHours(0, 0, 0, 0);

    // Check Contract start before current week or it is before monday noon
    if (
      normalizedContractStartDate < normalizedCurrentMonday &&
      isBeforeMondayNoon(currentMonday)
    ) {
      setCurrentTab("LAST_WEEK");
      setTabs(
        tabs.map((tab) =>
          tab.value === "LAST_WEEK" ? { ...tab, isShow: true } : tab
        )
      );
    } else {
      setTabs(
        tabs.map((tab) =>
          tab.value === "LAST_WEEK" ? { ...tab, isShow: false } : tab
        )
      );
      setCurrentTab("CURRENT_WEEK");
    }
  };

  const getContractStartDate = async () => {
    if (contractId) {
      if (contractId.toLowerCase() === "all") {
        // Set start date to current monday
        const monday = getMonday(new Date());
        const response = await getAllContract();
        const activeContracts = response?.contracts?.filter(
          (contract: any) => contract?.status === "ACTIVE"
        );
        console.log("ACTIVE CONTRACTS ", activeContracts);

        let minStartDate: any = null;

        activeContracts?.forEach((contract: any) => {
          const startDate = new Date(contract?.startDate);
          if (!minStartDate || startDate < minStartDate) {
            minStartDate = startDate;
          }
        });
        console.log("MAX START DATE ", minStartDate);
        const mondayDate = getMonday(new Date(minStartDate));
        setLastEditableDate(minStartDate || monday);
        isShowLastWeekTab(monday, mondayDate);
        setContractStartDate(mondayDate);
      } else {
        const contract = await getContractById(contractId);
        const mondayDate = getMonday(new Date(contract?.data?.startDate));
        isShowLastWeekTab(getMonday(new Date()), mondayDate);
        setLastEditableDate(contract?.data?.startDate);
        setContractStartDate(mondayDate);
        if (contract?.data?.endDate) {
          const contractED: any = new Date(contract?.data?.endDate);
          contractED.setHours(23, 59, 59, 999);
          setContractEndDate(contractED);
        } else {
          setContractEndDate(undefined);
        }
      }
    }
  };
  useEffect(() => {
    getContractStartDate();
  }, [contractId]);
  const [weeks, setWeeks] = useState<any>();
  const [resetWeekIndex, setResetWeekIndex] = useState(0);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
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
      if (currentTab === "LAST_WEEK") {
        setCurrentWeekIndex(dividedWeeks.length - 3);
      } else {
        setCurrentWeekIndex(dividedWeeks.length - 2);
      }
      setResetWeekIndex(dividedWeeks.length - 2);
      setWeeks(dividedWeeks);
    }
  }, [contractStartDate]);
  const contextValue = {
    contractId,
    weeks,
    currentWeekIndex,
    changeCurrentWeekIndex: (index: number) => {
      setCurrentWeekIndex(index);
    },
    dates: weeks?.[currentWeekIndex],
    resetWeek: () => {
      setCurrentWeekIndex(resetWeekIndex);
    },
    lastEditableDate,
    contractEndDate,
    tabs,
    changeTabs: (tabs: any) => {
      setTabs(tabs);
    },
    currentTab,
    onTabChange: (tab: string) => {
      setCurrentTab(tab);
    },
  };
  return (
    <WeekContext.Provider value={contextValue}>{children}</WeekContext.Provider>
  );
};

export const useWeekContext = () => {
  const weekContext = useContext(WeekContext);
  if (!weekContext) {
    throw new Error("useWeekContext has to be used within WeekProvider");
  }
  return weekContext;
};

export default WeekProvider;
