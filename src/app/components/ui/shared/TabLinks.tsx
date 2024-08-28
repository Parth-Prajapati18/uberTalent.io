import { classNames } from "@/app/utils";

interface TabLink {
  name: string;
  value: string | string[] | any;
}
interface Props {
  tabLinks: TabLink[];
  label?: string;
  defaultValue?: string;
  currentValue?: string | string[];
  onChange: (val: string | string[]) => void;
  labelClasses?: string;
  count?: any;
}
export default function TabLinks({
  tabLinks,
  defaultValue,
  currentValue = "",
  label = "Select a tab",
  labelClasses = "",
  onChange,
  count,
}: Props) {
  return (
    <div className="relative border-b border-gray-200 pb-5 sm:pb-0">
      <div className="md:flex md:items-center md:justify-between">
        <h3
          className={classNames(
            "leading-6 text-gray-900 bolder text-2xl mb-6",
            labelClasses
          )}
        >
          {label}
        </h3>
      </div>
      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="current-tab" className="sr-only">
            {label}
          </label>
          <select
            id="current-tab"
            name="current-tab"
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black"
            value={currentValue}
            onChange={(event) => {
              onChange(event.target.value);
            }}
            defaultValue={defaultValue || tabLinks[0].value}
          >
            {tabLinks.map((link) => (
              <option key={link.name} value={link.value}>
                {link.name}
              </option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav className="-mb-px flex space-x-8">
            {tabLinks.map((link) => (
              <div
                key={link.name}
                onClick={() => onChange(link.value)}
                className={classNames(
                  link.value === currentValue
                    ? "border-gray-500 text-black"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer"
                )}
                aria-current={link.name === currentValue ? "page" : undefined}
              >
                {link.name}
                {count ? (
                  <span
                    className={classNames(
                      link.value === currentValue
                        ? "bg-gray-100 text-black"
                        : "bg-gray-100 text-gray-900",
                      "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
                    )}
                  >
                    {count[link.value] || 0}
                  </span>
                ) : null}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
