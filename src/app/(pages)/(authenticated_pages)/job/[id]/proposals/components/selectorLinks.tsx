"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import TabLinks from "@/app/components/ui/shared/TabLinks";
import React, { useEffect, useState } from "react";

type Tab = {
  name: string;
  value: string | string[];
  class?: string;
  activeLinkClass?: string;
};
const tabs: Tab[] = [
  { name: "Submitted", value: "SUBMITTED" },
  { name: "Shortlisted", value: "SHORT_LISTED" },
  { name: "Disqualified", value: "DISQUALIFIED" },
  { name: "Offers", value: "OFFER" },
  { name: "Hired", value: "HIRED" },
];
type Props = {
  count: any;
};
export const SelectorLinks = ({ count }: Props) => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [currentTab, setCurrentTab] = useState(
    () => params.get("status") || tabs[0].value
  );
  const pathname = usePathname();
  const { replace } = useRouter();

  useEffect(() => {
    if (Array.isArray(currentTab)) {
      params.set("status", currentTab[0]);
      currentTab.slice(1)?.forEach((tab) => params.append("status", tab));
    } else {
      params.set("status", currentTab);
    }

    replace(`${pathname}?${params.toString()}`);
  }, [currentTab]);

  useEffect(() => {
    const statusFromParams = params.get("status") || tabs[0].value;
    if (statusFromParams !== currentTab) {
      setCurrentTab(statusFromParams);
    }
  }, [searchParams]);

  return (
    <TabLinks
      tabLinks={tabs}
      onChange={setCurrentTab}
      currentValue={currentTab}
      count={count}
      label=""
      labelClasses="text-base font-semibold leading-6 text-gray-900 mb-0"
    />
  );
};
