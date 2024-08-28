import React from "react";

type Props = {
  handleInputChange: (dayIndex: number, e: any) => void;
  handleTimesheetUpdate: (dayIndex: number, e: any) => void;
  defaultValue: string;
  isDisabled: boolean;
  dayIndex: number;
  setPrevInput: React.Dispatch<React.SetStateAction<string>>;
};
const TimeInput = ({
  handleInputChange,
  handleTimesheetUpdate,
  defaultValue = "00:00",
  isDisabled,
  dayIndex,
  setPrevInput,
}: Props) => {
  const displayValue =
    defaultValue === "00:00" ||
    defaultValue === "0:0" ||
    defaultValue === "0:00"
      ? ""
      : defaultValue;
  return isDisabled ? (
    <input
      type="text"
      value={displayValue}
      className="px-2 py-1 mb-2 w-24 text-center border-0 text-black"
      placeholder="-"
      onBlur={(e) => handleTimesheetUpdate(dayIndex, e)}
      disabled={isDisabled}
      onFocus={(e) => setPrevInput(e.target?.value)}
    />
  ) : (
    <input
      type="text"
      value={displayValue}
      onChange={(e) => handleInputChange(dayIndex, e)}
      className="border border-gray-300 rounded-md px-2 py-1 mb-2 w-24 text-center text-gray-400 placeholder:text-gray-400"
      placeholder="HH:MM"
      onBlur={(e) => handleTimesheetUpdate(dayIndex, e)}
      onFocus={(e) => setPrevInput(e.target?.value)}
      disabled={isDisabled}
    />
  );
};

export default TimeInput;
