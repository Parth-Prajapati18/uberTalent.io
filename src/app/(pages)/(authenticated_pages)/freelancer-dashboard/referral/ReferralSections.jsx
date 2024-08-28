"use client";
import Alert from "@/app/components/ui/shared/alert";
import { useUserContext } from "@/app/providers/UserProvider";
import { classNames } from "@/app/utils";
import {
  ClipboardDocumentListIcon,
  ArrowPathRoundedSquareIcon,
  HandRaisedIcon,
} from "@heroicons/react/24/outline";

export default function ReferralSection() {
  const { user } = useUserContext();

  return (
    <div className="relative isolate overflow-hidden bg-gray-900 py-16 sm:py-24 lg:py-32 mt-[1.5em] rounded-lg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
          <div className="max-w-xl lg:max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Invite Friends and Unlock Exclusive Benefits!
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-300">
              Share your unique referral link to get started.
            </p>
            <div className="mt-6 flex  max-w-md gap-x-4">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-w-0 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-gray-500 sm:text-sm sm:leading-6"
                placeholder="Enter your email"
                disabled
                value={
                  user?.id
                    ? `${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-referral/${user.id}?utm_campaign=freelancer_referral&utm_source=invite`
                    : ""
                }
              />
              <div className="group relative flex">
                <button
                  type="submit"
                  className={classNames(
                    "flex-none rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500",
                    user.id
                      ? "cursor-pointer hover:bg-stone-800"
                      : "cursor-wait opacity-75"
                  )}
                  disabled={!user.id}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-referral/${user.id}?utm_campaign=freelancer_referral&utm_source=invite`
                    );
                  }}
                >
                  Copy
                </button>
                <span className="absolute top-10 opacity-0 transition-all duration-[2000ms] rounded bg-gray-800 p-2 text-xs text-white group-active:opacity-100 group-active:duration-200">
                  Copied
                </span>
              </div>
            </div>
          </div>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:pt-2">
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                <ClipboardDocumentListIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <dt className="mt-4 font-semibold text-white">How It Works</dt>
              <dd className="mt-2 leading-7 text-gray-400">
                Invite friends using your link. Once 10 sign up, you&apos;ll gain Featured Freelancer status.
              </dd>
            </div>
            <div className="flex flex-col items-start">
              <div className="rounded-md bg-white/5 p-2 ring-1 ring-white/10">
                <ArrowPathRoundedSquareIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </div>
              <dt className="mt-4 font-semibold text-white">Your Reward</dt>
              <dd className="mt-2 leading-7 text-gray-400">
                As a Featured Freelancer, enjoy prime visibility in client searches, maximizing your opportunities.
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>
    </div>
  );
}
