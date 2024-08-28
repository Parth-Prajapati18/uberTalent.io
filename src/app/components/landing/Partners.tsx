import React from "react";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

const points = [
  "Post Jobs For Free",
  "Gain Access to Qualified Talent",
  "Hire Today, Start Right Away",
  "Secure Payment Worldwide",
];
const Partners = () => {
  return (
    <div className="bg-white pt-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-none">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Find Top Talent
            </h2>
            <div className="mt-1 flex items-center gap-x-6 justify-center">
              <Link
                href="/sign-up"
                className="mt-2 flex text-sm font-semibold leading-6 text-gray-400 hover:text-gray-300"
              >
                Start Hiring <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              UberTalent is the simple solution to hire, manage, and pay talent
              around the world.{" "}
            </p>
          </div>
          <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-2 lg:grid-cols-4">
            {points.map((point, indx) => (
              <div
                key={indx}
                className="flex items-center gap-x-2 bg-gray-400/5 p-7"
              >
                <CheckCircleIcon className="h-5" />
                <dt className="text-sm font-semibold leading-6 text-gray-600">
                  {point}
                </dt>

                {/* <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900">
                  {point}
                </dd> */}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Partners;
