"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const tabs = [
  { name: "Active", value: "ACTIVE" },
  { name: "Completed", value: "COMPLETED" },
];

type Tab = {
  name: string;
  value: string;
};
type FreelancerContractType = {
  currentSection: string;
  changeCurrentSection: (value: string) => void;
  tabs: Tab[];
};
export const FreelancerContractContext = createContext<FreelancerContractType>(
  {} as FreelancerContractType
);

const FreelancerContractProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();

  const [currentSection, setCurrentSection] = useState(tabs[0]?.value);

  const changeCurrentSection = (value: string) => {
    setCurrentSection(value);
  };
  const contextValue = {
    tabs,
    currentSection,
    changeCurrentSection,
  };
  return (
    <FreelancerContractContext.Provider value={contextValue}>
      {children}
    </FreelancerContractContext.Provider>
  );
};

export const useFreelancerContractContext = () => {
  const flContractContext = useContext(FreelancerContractContext);
  if (!flContractContext) {
    throw new Error(
      "useFreelancerContractContext has to be used within <CurrentUserContext.Provider>"
    );
  }
  return flContractContext;
};

export default FreelancerContractProvider;
