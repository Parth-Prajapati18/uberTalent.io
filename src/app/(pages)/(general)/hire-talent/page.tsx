import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import { HomeIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import Image from "next/image";
import {
  HandRaisedIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import SparkOpsTestimonial from "@/app/components/landing/SparkOpsTestimonial";

const timeline = [
  {
    name: "Founded company",
    description:
      "Nihil aut nam. Dignissimos a pariatur et quos omnis. Aspernatur asperiores et dolorem dolorem optio voluptate repudiandae.",
    date: "Aug 2021",
    dateTime: "2021-08",
  },
  {
    name: "Secured $65m in funding",
    description:
      "Provident quia ut esse. Vero vel eos repudiandae aspernatur. Cumque minima impedit sapiente a architecto nihil.",
    date: "Dec 2021",
    dateTime: "2021-12",
  },
  {
    name: "Released beta",
    description:
      "Sunt perspiciatis incidunt. Non necessitatibus aliquid. Consequatur ut officiis earum eum quia facilis. Hic deleniti dolorem quia et.",
    date: "Feb 2022",
    dateTime: "2022-02",
  },
  {
    name: "Global launch of product",
    description:
      "Ut ipsa sint distinctio quod itaque nam qui. Possimus aut unde id architecto voluptatem hic aut pariatur velit.",
    date: "Dec 2022",
    dateTime: "2022-12",
  },
];
const values = [
  {
    name: "Keep growth sustainable.",
    description:
      "Scaling your team? Our experts guide you through the process while building a talent pipeline for your business needs.",
    icon: RocketLaunchIcon,
  },
  {
    name: "Build your own talent roster.",
    description:
      "Need help to execute a variety of projects? From junior engineers to SEO experts, you will find the best fit for your company.",
    icon: HomeIcon,
  },
  {
    name: "Make projects happen.",
    description:
      "Looking for the best talent for a specific task? Access our global talent pool instead of sifting through endless CVs.",
    icon: UserGroupIcon,
  },
  {
    name: "Hire based on qualified talent.",
    description:
      "Do you value expertise? You can count on our accomplished freelancers to help you achieve - without any long term contracts or success commissions!",
    icon: ClipboardDocumentCheckIcon,
  },
];

const HireTalent = () => {
  return (
    <main className="isolate -mt-48">
      {/* Hero section */}
      <div className="relative isolate -z-10 overflow-hidden bg-gradient-to-b from-gray-100/20 pt-14">
        <div
          className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-black/10 ring-1 ring-gray-50 sm:-mr-80 lg:-mr-96"
          aria-hidden="true"
        />
        <div className="mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:grid lg:max-w-none lg:grid-cols-2 lg:gap-x-16 lg:gap-y-6 xl:grid-cols-1 xl:grid-rows-1 xl:gap-x-8 items-center">
            <div className="max-w-xl lg:mt-0 xl:col-end-1 xl:row-start-1">
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Hiring, Redefined.
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 mb-8">
                Transform your projects into success stories with
                UberTalent&apos;s curated professionals. From seasoned
                consultants to creative freelancers, we specialize in connecting
                you with the skilled experts who drive your business forward.
              </p>
              <Link
                href="/sign-up"
                className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black w-fit"
              >
                Find Talent
              </Link>
            </div>
            <div className="relative mt-10 aspect-[6/5] max-w-lg sm:mt-10 lg:mt-0 lg:max-w-none xl:row-span-2 xl:row-end-2 xl:mt-10">
              <Image
                src={"/images/23.avif"}
                alt=""
                className="object-cover rounded-2xl"
                fill={true}
              />
            </div>
          </div>
        </div>
        {/* <div className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-white sm:h-32" /> */}
      </div>
      <SparkOpsTestimonial />

      {/* Content section */}
      <div className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 lg:flex lg:flex-col lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8 items-center">
            <div className="lg:w-full lg:order-2 lg:max-w-lg lg:pb-8">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-6 text-xl leading-8 text-gray-600">
                We make hiring as easy as 1, 2, 3!
              </p>
              <ul className="mt-6 mb-8 text-lg leading-8 text-gray-600">
                <li>1. Post your job</li>
                <li>2. Hire from our curated talent</li>
                <li>3. Easy and secure payments</li>
              </ul>
              <Link
                href="/sign-up"
                className="block rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black w-fit"
              >
                Get Started
              </Link>
            </div>
            <div className="relative aspect-[7/5] lg:order-1 sm:order-2 max-w-none">
              <Image
                src="https://images.unsplash.com/photo-1670272502246-768d249768ca?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1152&q=80"
                alt=""
                fill={true}
                className="object-cover rounded-2xl bg-gray-50"
              />
            </div>
          </div>

          {/* ab */}

          <div className="flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
            <div className="mt-12 contents lg:col-span-2 lg:col-end-2 lg:flex lg:w-[37rem] lg:items-start  lg:gap-x-8">
              <div className="lg:flex w-96 flex-auto justify-end lg:w-auto lg:flex-none mt-6 lg:mt-0">
                <div className="relative aspect-[7/5] w-[37rem] max-w-none flex-none bg-gray-50">
                  <Image
                    src="/images/22.avif"
                    alt=""
                    fill={true}
                    className="object-cover rounded-2xl"
                  />
                </div>
              </div>
              <div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none mt-6 lg:mt-0">
                <div className="relative aspect-[4/3] w-[24rem] max-w-none bg-gray-50">
                  <Image
                    src="/images/24.jpg"
                    alt=""
                    className="rounded-2xl object-cover"
                    fill={true}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ab */}
        </div>
      </div>

      {/* Unique Features Section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <Link
            href="/sign-up"
            className="text-base font-semibold leading-7 text-black hover:text-gray-400"
          >
            Get started
          </Link>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Unique Features
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Here&apos;s how we help you source and connect with the talent you
            need to make your next project a success.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base leading-7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:gap-x-16">
          {values.map((value) => (
            <div key={value.name} className="relative pl-9">
              <dt className="inline font-semibold text-lg text-gray-800">
                <value.icon
                  className="absolute left-1 top-1 h-5 w-5 text-black"
                  aria-hidden="true"
                />
                {value.name}
              </dt>{" "}
              <dd className="inline text-gray-600">{value.description}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Our Customers Love Us Section */}
      <div className="mx-auto mt-16 max-w-7xl sm:mt-16 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl rounded-md sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Find Exceptional Talent for Your Projects with UberTalent
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
            Discover top-notch freelancers at UberTalent for your diverse
            project needs. Our curated pool of talent includes visionary
            designers, cutting-edge developers, and strategic marketing experts.
            With over 15 years of experience, our founder has refined a hiring
            method used by UberTalent, connecting you with the perfect talent
            for your projects.
          </p>

          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              href="/sign-up"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Get started
            </Link>
          </div>

          <div
            className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl"
            aria-hidden="true"
          >
            <div
              className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25"
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HireTalent;
