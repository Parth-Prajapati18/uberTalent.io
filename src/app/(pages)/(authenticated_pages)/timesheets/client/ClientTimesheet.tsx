// import ContractsSelect from "@/app/components/ui/timesheet/ContractsSelect";
// import SwitchWeek from "@/app/components/ui/timesheet/SwitchWeek";
import WeekProvider from "@/app/providers/WeekProvider";
import { contractService } from "@/app/services/contractService";
import ContractsSelect from "../components/ContractsSelect";
import SwitchWeek from "../components/SwitchWeek";

export default async function ClientTimesheet() {
  const contracts = await contractService.getAllContracts();
  const activeContracts = contracts.filter(
    (contract: any) => contract?.status === "ACTIVE"
  );
  return (
    <WeekProvider>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Weekly summary - Hourly
            </h1>
            <div className="w-2/4 mt-2">
              <ContractsSelect contracts={activeContracts} />
            </div>
          </div>
          <div className="sm:ml-16 sm:mt-0 sm:flex-none mt-2">
            <SwitchWeek />
          </div>
        </div>
        <div className="-mx-4 mt-8 flow-root sm:mx-0">
          {/* <table className="min-w-full">
          <colgroup>
            <col className="w-full sm:w-1/2" />
            <col className="sm:w-1/6" />
            <col className="sm:w-1/6" />
          </colgroup>
          <thead className="border-b border-gray-300 text-gray-900">
            <tr>
              <th
                scope="col"
                className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Contract
              </th>

              <th
                scope="col"
                className="hidden px-3 py-3.5 text-right text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Hours
              </th>
              <th
                scope="col"
                className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-0"
              >
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="border-b border-gray-200">
                <td className="max-w-0 py-5 pl-4 pr-3 text-sm sm:pl-0">
                  <div className="font-medium text-gray-900">
                    {project.name}
                  </div>
                  <div className="mt-1 truncate text-gray-500">
                    {project.description}
                  </div>
                </td>
                <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">
                  {project.hours}
                </td>

                <td className="py-5 pl-3 pr-4 text-right text-sm text-gray-500 sm:pr-0">
                  {project.price}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                scope="row"
                className="hidden pl-4 pr-3 pt-4 text-sm font-semibold text-gray-900 sm:table-cell sm:pl-0"
              >
                Total
              </td>
              <th
                scope="row"
                className="pl-4 pr-3 pt-4 text-left text-sm font-semibold text-gray-900 sm:hidden"
              >
                Total
              </th>
              <td className="hidden px-3 py-5 text-right text-sm text-gray-500 sm:table-cell">
                Test
              </td>

              <td className="py-5 pl-3 pr-4 text-right text-sm text-gray-500 sm:pr-0">
                Test
              </td>
            </tr>
          </tfoot>
        </table> */}
        </div>
      </div>
    </WeekProvider>
  );
}
