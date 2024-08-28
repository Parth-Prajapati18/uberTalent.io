import { classNames } from "@/app/utils";

interface Props {
  data: Record<string, string | number>[];
  onRowClick?: (arg?: any) => void;
}

export default function Table({ data, onRowClick }: Props) {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center"></div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  {Object.keys(data[0])?.map((header, index) => (
                    <th
                      key={header}
                      scope="col"
                      className={classNames(
                        "px-3 py-3.5 text-left text-sm font-semibold text-gray-900 capitalize",
                        index === 0
                          ? "py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                          : ""
                      )}
                    >
                      {header}
                    </th>
                  ))}
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((dataItem) => (
                  <tr
                    key={dataItem.id || ""}
                    onClick={() => onRowClick?.(dataItem)}
                    className={classNames(onRowClick ? "cursor-pointer" : "")}
                  >
                    {Object.values(dataItem)?.map((colItem, index) => (
                      <td
                        key={colItem}
                        className={classNames(
                          index === 0
                            ? "whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0"
                            : "whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                        )}
                      >
                        {colItem}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
