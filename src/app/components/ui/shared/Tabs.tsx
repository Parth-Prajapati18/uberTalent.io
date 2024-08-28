import { classNames } from "@/app/utils";
import React from "react";

interface Tab {
  name: string;
  value: string;
}
interface Props {
  tabs: Tab[];
  count: any;
  label?: string;
  defaultValue?: string;
  currentValue?: string;
  onChange: (val: string) => void;
}
const Tabs = ({
  tabs,
  count,
  defaultValue,
  currentValue = "",
  label = "Select a tab",
  onChange,
}: Props) => {
  const getColor: any = (tab: string) => {
    return count[`Active${tab}`] ? "red" : "gray";
  }
  return (
    <div>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          {label}
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          defaultValue={currentValue || tabs[0].value}
          onChange={(e) => {
            onChange(e?.target?.value);
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.value} value={tab.value}>{tab.name}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => onChange(tab.value)}
              className={classNames(
                tab.value === currentValue
                  ? `bg-${getColor(currentValue)}-100 text-${getColor(currentValue)}-700`
                  : `text-${getColor(tab.value)}-500 hover:text-${getColor(tab.value)}-700`,
                "flex gap-2 rounded-md px-3 py-2 text-sm font-medium"
              )}
            >
              {getColor(tab.value) === "red" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-5 w-5 -mr-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>
              )}
              {tab.name}
              {count ? (
                <span
                  className={classNames(
                    tab.value === currentValue
                      ? `${getColor(currentValue) === "red" ? "bg-pink-200": "bg-gray-200"} text-${getColor(currentValue)}-700`
                      : `bg-${getColor(tab.value)}-100 text-${getColor(tab.value)}-700`,
                    "hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
                  )}
                >
                  {count[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Tabs;
