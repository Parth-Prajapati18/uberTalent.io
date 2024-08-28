"use client";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { FreelancerTypeExtended } from "../schema/FreelancerOnboardingSchema";
import NoActiveJobsPopup from "../components/ui/shared/NoActiveJobsPopup";

interface FLSlideOverContextType {
  openSlideOver: boolean;
  setOpenSlideOver: (val: boolean) => void;
  disableInvite: boolean;
  setDisableInvite: (val: boolean) => void;
  noActiveJobs: boolean;
  setNoActiveJobs: (val: boolean) => void;
  openNoActiveJobsPopup: boolean;
  setOpenNoActiveJobsPopup: (val: boolean) => void;
  flSlideOverData: FreelancerTypeExtended | null;
  setFlSlideOverData: Dispatch<SetStateAction<FreelancerTypeExtended | null>>;
}

export const FreelancerSlideOverContext =
  createContext<FLSlideOverContextType | null>(null);

const FreelancerSlideOverProvider = ({ children }: any) => {
  const [openSlideOver, setOpenSlideOver] = useState(false);
  const [disableInvite, setDisableInvite] = useState(false);
  const [flSlideOverData, setFlSlideOverData] =
    useState<FreelancerTypeExtended | null>(null);
  const [noActiveJobs, setNoActiveJobs] = useState(false);
  const [openNoActiveJobsPopup, setOpenNoActiveJobsPopup] = useState(false);

  return (
    <FreelancerSlideOverContext.Provider
      value={{
        openSlideOver,
        setOpenSlideOver,
        disableInvite,
        setDisableInvite,
        flSlideOverData,
        setFlSlideOverData,
        noActiveJobs,
        setNoActiveJobs,
        openNoActiveJobsPopup,
        setOpenNoActiveJobsPopup,
      }}
    >
      {children}
      <NoActiveJobsPopup
        open={openNoActiveJobsPopup}
        setOpen={setOpenNoActiveJobsPopup}
      />
    </FreelancerSlideOverContext.Provider>
  );
};

export const useFLSlideOVerContext = () => {
  const flSlideOverContext = useContext(FreelancerSlideOverContext);

  if (!flSlideOverContext) {
    throw new Error(
      "useFLSlideOVerContext has to be used within <CurrentUserContext.Provider>"
    );
  }

  return flSlideOverContext;
};

export default FreelancerSlideOverProvider;
