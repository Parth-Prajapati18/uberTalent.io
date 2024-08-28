import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";

export default function AccountRemovedBanner() {
  const searchParams = useSearchParams();

  return (
    <>
      {searchParams.get("status") === "SUSPENDED" ? (
        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-gray-700">
                Your profile has been removed. Please contact support for
                inquiries about the decision.
              </p>
              <p className="flex items-center gap-3 mt-3 text-sm md:ml-6 md:mt-0">
                <a
                  href="mailto:UberTalent<support@ubertalent.io>"
                  className="whitespace-nowrap font-medium text-gray-700 hover:text-gray-400"
                >
                  Contact support
                </a>
                <a href="/sign-in">
                  <XMarkIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
