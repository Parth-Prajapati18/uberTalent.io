"use client";

import { PlusIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";

interface Props {
  label?: string;
  ctaText?: string;
  ctaHref?: string;
  handleCTA?: (val: boolean) => void;
  type?: string;
}
export default function EmptyState({ label, ctaText, ctaHref, handleCTA, type }: Props) {
  const router = useRouter();

  function handleClick() {
    if (ctaHref) {
      router.push(ctaHref);
    } else if (handleCTA) {
      handleCTA(true);
    }
  }
  return (
    <div className="text-center flex flex-col justify-center">
      {label &&
        (
          <>
            {type && type ==="search" ?
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="mx-auto text-gray-400 w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            :
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>}
            <h3 className="mt-2 text-sm font-semibold text-gray-900">{label}</h3>
          </>
        )
      }
      {ctaText && (
        <div className="mt-6">
          <button
            className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            onClick={handleClick}
          >
            {type && type !== "search" && <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />}
            {ctaText}
          </button>
        </div>
      )}
    </div>
  );
}
