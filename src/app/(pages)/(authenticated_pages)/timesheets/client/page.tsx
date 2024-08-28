import WeekProvider from "@/app/providers/WeekProvider";
import ContractsSelect from "../components/ContractsSelect";
import TimesheetTable from "../components/TimesheetTable";
import HistoricalTimesheet from "../components/HistoricalTimesheet";
import NoTimesheetPopup from "../components/NoTimesheetPopup";
import UnpaidTimesheet from "../components/UnpaidTimesheet";
import { timesheetService } from "@/app/services/timesheetService";

export default async function ClientTimesheet() {
  const resp = await timesheetService.getTimesheetContracts();
  let contracts;
  if (resp?.contracts?.length > 0) {
    contracts = resp?.contracts || [];
  } else {
    contracts = [];
  }
  contracts.unshift({
    id: "All",
    jobId: "",
    freelancerId: "",
    clientId: contracts[0]?.clientId,
    type: "HOURLY",
    rate: 0,
    status: "ACTIVE",
    weeklyLimit: 0,
    startDate: new Date(),
    endDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "All",
    description: null,
    attachments: null,
    paymentService: false,
  });
  return (
    <WeekProvider>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Weekly summary - Hourly
            </h1>
            <div className="mt-2">
              <ContractsSelect contracts={contracts} />
            </div>
          </div>
        </div>
        <div className="-mx-4 mt-6 flow-root sm:mx-0">
          <TimesheetTable />
        </div>
        <UnpaidTimesheet />
        <HistoricalTimesheet />
      </div>
      <NoTimesheetPopup contract={!resp?.contracts?.length} />
    </WeekProvider>
  );
}
