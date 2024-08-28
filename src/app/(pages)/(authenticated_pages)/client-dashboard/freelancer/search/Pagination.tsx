"use client";
import { classNames } from "@/app/utils";
import { create } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface PageInfo {
  totalRecords: number;
  totalPages: number;
  pageNo: number;
  perPage: number;
  showingStart: number;
  showingEnd: number;
}

export default function Pagination({ pageInfo }: { pageInfo: PageInfo }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const currentPage = Number(searchParams.get("p")) || 1;
  const paging = pageInfo;

  console.log("pageInfo", pageInfo);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("p", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pageBack = () => {
    if (paging?.pageNo !== 1) {
      const url = createPageURL(currentPage - 1);
      replace(url);
    }
  };

  const pageNext = () => {
    if (paging?.pageNo !== paging?.totalPages) {
      const url = createPageURL(currentPage + 1);
      replace(url);
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-center items-center flex-col gap-3 sm:flex-row sm:justify-between">
        <p className="flex gap-1 text-sm text-gray-700">
          Showing
          <span className="font-medium">{paging?.showingStart || 0}</span>
          to
          <span className="font-medium">{paging?.showingEnd || 0}</span>
          of
          <span className="font-medium">{paging?.totalRecords || 0}</span>
          results
        </p>
        <div className="flex gap-3 flex-1 justify-between w-full sm:justify-end">
          <button
            type="button"
            onClick={() => {
              pageBack();
              //commit();
            }}
            className={classNames(
              paging?.showingStart <= 1
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-50",
              "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus-visible:outline-offset-0"
            )}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => {
              pageNext();
              //commit();
            }}
            className={classNames(
              paging?.showingEnd >= paging?.totalRecords
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:bg-gray-50",
              "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus-visible:outline-offset-0"
            )}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
