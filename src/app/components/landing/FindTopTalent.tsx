import {
  ArrowPathIcon,
  CloudArrowUpIcon,
  FingerPrintIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const features = [
  {
    name: "Post Jobs For Free",
    description: "Zero risk. Lower overhead. No HR hassles.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Gain Access To Qualified Talent",
    description:
      "Customized matches. Verified skills. Professional partnerships.",
    icon: LockClosedIcon,
  },
  {
    name: "Hire Today, Start Right Away",
    description: "All-in-one platform. Agile solution. Reliable results.",
    icon: ArrowPathIcon,
  },
  {
    name: "Secure Payment",
    description: "Easy processing. Safe transactions. Reduced costs.",
    icon: FingerPrintIcon,
  },
];

export default function FindTopTalent() {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Find Top Talent
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          UberTalent is the simple solution to hire, manage, and pay your team.
        </p>
      </div>
      <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
          {features.map((feature) => (
            <div key={feature.name} className="relative pl-16">
              <dt className="text-base font-semibold leading-7 text-gray-900">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-black">
                  <feature.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                {feature.name}
              </dt>
              <dd className="mt-2 text-base leading-7 text-gray-600">
                {feature.description}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-10 flex items-center gap-x-6 justify-center">
        <Link
          href="/auth/sign-up"
          className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black z-10"
        >
          Find Talent Now
        </Link>
      </div>
    </div>
  );
}
