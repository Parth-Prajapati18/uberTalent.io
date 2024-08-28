"use client";

import { createContext, useContext, useEffect, useState } from "react";
import HiredForJobBanner from "../components/ui/banners/HiredForJobBanner";
import { usePathname } from "next/navigation";

type HiredForJobBannerType = {
  changeJob: (value: string) => void;
};
export const HiredForJobBannerContext = createContext<HiredForJobBannerType>(
  {} as HiredForJobBannerType
);

const HiredForJobBannerProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const [job, setJob] = useState();

  const changeJob = (value: any) => {
    setJob(value);
  };

  const contextValue = {
    changeJob,
  };

  useEffect(() => {
    setJob(undefined);
  }, [pathname]);

  return (
    <HiredForJobBannerContext.Provider value={contextValue}>
      <HiredForJobBanner job={job}/>
      {children}
    </HiredForJobBannerContext.Provider>
  );
};

export const useHiredForJobBannerContext = () => {
  const context = useContext(HiredForJobBannerContext);
  if (!context) {
    throw new Error(
      "useHiredForJobBannerContext has to be used within <CurrentUserContext.Provider>"
    );
  }
  return context;
};

export default HiredForJobBannerProvider;
