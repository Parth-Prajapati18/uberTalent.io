"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const tabs = [
  { name: "Saved Jobs", value: "SavedJobs" },
  { name: "Proposals", value: "Proposals" },
  { name: "Offers", value: "Offers"},
  { name: "Contracts", value: "Contracts" },
];
type Tab = {
  name: string;
  value: string;
};
type FreelancerProposalType = {
  currentSection: string;
  changeCurrentSection: (value: string) => void;
  tabs: Tab[];
};
export const FreelancerProposalContext = createContext<FreelancerProposalType>(
  {} as FreelancerProposalType
);

const FreelancerProposalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();

  const [currentSection, setCurrentSection] = useState(
    () => searchParams.get("l1Tab") || tabs[0]?.value
  );
  const { replace } = useRouter();
  const pathname = usePathname();
  const params = new URLSearchParams(searchParams);

  const changeCurrentSection = (value: string) => {
    params.set("l1Tab", value);
    replace(`${pathname}?${params.toString()}`);
    setCurrentSection(value);
  };
  const contextValue = {
    tabs,
    currentSection,
    changeCurrentSection,
  };
  return (
    <FreelancerProposalContext.Provider value={contextValue}>
      {children}
    </FreelancerProposalContext.Provider>
  );
};

export const useFreelancerProposalContext = () => {
  const flProposalContext = useContext(FreelancerProposalContext);
  if (!flProposalContext) {
    throw new Error(
      "useFreelancerProposalContext has to be used within <CurrentUserContext.Provider>"
    );
  }
  return flProposalContext;
};

export default FreelancerProposalProvider;
