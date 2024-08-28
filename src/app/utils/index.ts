import { format, isValid } from "date-fns";

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export function padNumber(
  number: number = 0,
  padChar: string = "0",
  padCharAmout: number = 2
) {
  return number.toString()?.padStart(padCharAmout, padChar);
}

export function capitalizeFirstLetter(str: string | undefined) {
  if (!str) return "";

  return str[0].toUpperCase() + str.substring(1);
}

export function formatBytes(bytes: number = 0, decimals?: number) {
  if (bytes == 0) return "0 Bytes";
  var k = 1024,
    dm = decimals || 2,
    sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return sizes[i] ? parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i] : "";
}

export function returnFormattedDate(date: any, formatStr: string) {
  if (!date) return "-";

  // Using try catch to prevent errors in case date is not valid
  // The built-in function "isValid" had unexpected behaviour
  try {
    return format(date, formatStr);
  } catch (err) {
    return "-";
  }
}

export function convertLocalToUTC(localDate: Date) {
  var localOffset = localDate.getTimezoneOffset() * 60000;
  var utcTime = localDate.getTime() + localOffset;
  var utcDate = new Date(utcTime);

  return utcDate;
}

export function convertHHMMToDecimal(hours: number, minutes: number) {
  return hours + minutes / 60;
}

export function decimalTimeTodecimalHHMM(decimalTime: number) {
  const hours = Math.floor(decimalTime); // Gets the integer part for hours
  const minutes = Math.round((decimalTime - hours) * 60); // Calculates the minutes
  return parseFloat(`${hours}.${minutes}`);
}
export function decimalToHHMM(decimalHours: number) {
  const hours = Math.floor(decimalHours); // Gets the integer part for hours
  const minutes = Math.round((decimalHours - hours) * 60); // Calculates the minutes
  if(Number.isNaN(hours) || Number.isNaN(minutes)) return `00:00`;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export const filterNumericInput = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value;
  if (!/^\d*$/.test(value)) {
    event.target.value = value.replace(/\D/g, ''); // Replace non-numeric characters
  }
};

export const isBeforeMondayNoon = (mondayDate: any) => {
  // Get the current time or the specified time from environment variables
  const now = process.env.NEXT_PUBLIC_TIMESHEET_DATE
    ? new Date(process.env.NEXT_PUBLIC_TIMESHEET_DATE)
    : new Date();

  // Convert the input Monday date to a Date object
  const mondayNoon = new Date(mondayDate);

  // Set the hours of the Monday date to 12:00 PM noon in UTC
  mondayNoon.setUTCHours(12, 0, 0, 0);

  // Compare the current time with Monday noon UTC
  return now < mondayNoon;
};