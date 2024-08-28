import Link from "next/link";
import React from "react";
import Image from "next/image";

const blogPosts = [
  {
    id: 1,
    title: "Monetize on Your Skills",
    href: "/sign-up",
    description:
      "Find opportunities to boost your income without having to pay fees.",
    imageUrl: "/images/work-the-way-1.jpg",
  },
  {
    id: 2,
    title: "Enjoy Flexibility",
    href: "/sign-up",
    description:
      "Have the flexibility to work on your own terms, whenever and wherever you choose.",
    imageUrl: "/images/work-the-way-2.jpg",
  },
  {
    id: 3,
    title: "Find Exciting Projects",
    href: "/sign-up",
    description:
      "Identify projects that ignite enthusiasm and interest from our diverse client-base.",
    imageUrl: "/images/work-the-way-3.jpg",
  },
  // More posts...
];
const WorkTheWayYouLove = () => {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8 mb-40 sm:mb-48">
      <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Work the Way You Love
        </h2>
        <div className="sm:flex gap-x-6 items-baseline">
          <p className="mt-2 text-lg leading-8 text-gray-600">
            With thousands of clients just a click away, UberTalent puts you in
            control of your professional growth.
          </p>
          <Link
            href="/sign-up"
            className="text-sm font-semibold leading-6 text-gray-400 hover:text-gray-300"
          >
            See our job postings <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-8 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {blogPosts.map((post) => (
          <article
            key={post.id}
            className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80 hover:opacity-75"
          >
            <Image
              src={post.imageUrl}
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover"
              fill={true}
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
            <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

            <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
              <div className="-ml-4 flex items-center gap-x-4">
                <svg
                  viewBox="0 0 2 2"
                  className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50"
                >
                  <circle cx={1} cy={1} r={1} />
                </svg>
              </div>
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
              <a href={post.href}>
                <span className="absolute inset-0" />
                {post.title}
              </a>
            </h3>
            <p className="text-white text-sm">{post.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default WorkTheWayYouLove;
