import {
  ArrowPathIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from "@heroicons/react/20/solid";
import { classNames } from "@/app/utils";
import Link from "next/link";
import Image from "next/image";
import { authUrl } from "@/app/constants";

const primaryFeatures = [
  {
    name: "Join Ubertalent's network of freelancers for free",
  },
  {
    name: "Send proposals for jobs that match your skills and experience",
  },
  {
    name: "Get paid on time through our secure payment system",
  },
];
const secondaryFeatures = [
  {
    name: "Venturing into Independence?",
    description:
      "Worried about not having freelancing experience? We aim to assist novice freelancers in acquiring knowledge and gaining valuable experience.",
      href: "/sign-up",
    icon: CloudArrowUpIcon,
    ctaText: "Take the plunge",
  },
  {
    name: "Not winning enough projects?",
    description:
      "We can help you with optimizing your profile, crafting persuasive proposals, setting a competitive rate and building a strong portfolio. Let’s get you those dream projects that you're ready to tackle.",
    href: "/sign-up",
    icon: LockClosedIcon,
    ctaText: "Get to Work",
  },
  {
    name: "Looking for an ideal client?",
    description:
      "We connect you with the clients that value your skills and match your work style. A brief survey is all it takes to help you find meaningful work.",
      href: "/sign-up",
    icon: ArrowPathIcon,
    ctaText: "Connect With Clients",
  },
];

const testimonials = [
  {
    body: "The UberTalent platform has been an exceptionally useful tool in my journey as a software developer. The collaborative environment and seamless project matching on UberTalent have significantly enhanced my professional growth, allowing me to engage with innovative ideas and tackle challenging tasks with a supportive team.",
    author: {
      name: "Hamzah A.",
      handle: 'hamzaha',
      imageUrl:
        '/images/josh-scorpio-H3Tuh0hwYQk-unsplash.jpg',
    },
  },
  {
    body: "I am very happy with my experience so far using the UberTalent platform. I have worked on a project that provides great flexibility and freedom to express your creativity. Finding projects has never been so easy. I am looking forward to winning more projects.",
    author: {
      name: "Ana B.",
      handle: "anab",
      imageUrl:
        '/images/christina-wocintechchat-com-0Zx1bDv5BNY-unsplash.jpg',
    },
  },
  {
    body: "Working with UberTalent has provided me with numerous opportunities. As a freelance software engineer, I've had the chance to connect with clients from various countries and collaborate on innovative ideas. The platform's remarkable project matching system ensures a consistent flow of exciting projects that perfectly align with my expertise and interests.",
    author: {
      name: "Issa S.",
      handle: "issas",
      imageUrl:
        '/images/issa-wocintechchat-com-Zpzf7TLj_gA-unsplash.jpg',
    },
  },
]

export default function FindWork() {
  return (
    <main className="-mt-48">
      {/* Hero section */}
      <div className="relative isolate">
        <svg
          className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
              width={200}
              height={200}
              x="50%"
              y={-1}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
            <path
              d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"
          />
        </svg>
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40 lg:pb-10">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
            <div className="flex">
              <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                <span className="font-semibold text-black">Join today</span>
                <span className="h-4 w-px bg-gray-900/10" aria-hidden="true" />
                <Link
                  href="/sign-up"
                  className="flex items-center gap-x-1 z-50"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  See open positions
                  <ChevronRightIcon
                    className="-mr-2 h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
            <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Grow Income, Skills, and Land Top Projects.{" "}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Tired of freelancing fees? Say goodbye to high freelancing fees
              and hello to retaining more of your earnings.
              <br /> Join our platform to access your next work opportunity that
              truly values your expertise.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/sign-up"
                className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Get started
              </Link>
            </div>
          </div>
          <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
            <Image width={316} height={684} src="/images/28.jpg" alt="" />
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-12 max-w-7xl sm:mt-32 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-20 sm:rounded-3xl rounded-md sm:px-10 sm:py-24 lg:py-24 xl:px-24">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center lg:gap-y-0">
            <div className="lg:row-start-1 lg:max-w-md">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Working on your own terms is as easy as 1, 2, 3!
              </p>
            </div>
            <Image
              src="/images/25.jpg"
              alt="Product screenshot"
              className="relative -z-20 min-w-full max-w-xl rounded-xl shadow-xl ring-1 ring-white/10 lg:row-span-4 w-0  lg:max-w-none"
              width={2432}
              height={1442}
            />
            <div className="max-w-xl lg:row-start-2 lg:mt-7 lg:max-w-md lg:border-t lg:border-white/70 lg:pt-7">
              <dl className="max-w-xl space-y-8 text-base leading-7 text-gray-300 lg:max-w-none">
                {primaryFeatures.map((feature, idx) => (
                  <div key={feature.name} className="relative">
                    <dt className="inline-block font-semibold text-white text-md">
                      <span className="mr-1">{idx + 1}.</span>
                      <span className="text-lg">{feature.name}</span>
                    </dt>{" "}
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/sign-up"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Get started
              </Link>
            </div>
          </div>
          <div
            className="pointer-events-none absolute left-12 top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-3xl lg:bottom-[-12rem] lg:top-auto lg:translate-y-0 lg:transform-gpu"
            aria-hidden="true"
          >
            <div
              className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-25"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mt-12 max-w-7xl px-6 sm:mt-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Supercharge Your Growth
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-20 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {secondaryFeatures.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-gray-900">
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                  <p className="mt-6">
                    <a
                      href={feature.href}
                      className="text-sm font-semibold leading-6 text-black hover:text-gray-400"
                    >
                      {feature.ctaText} <span aria-hidden="true">→</span>
                    </a>
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Newsletter section */}
      {/* <div className="mx-auto mt-12 max-w-7xl sm:mt-32 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 py-24 shadow-2xl rounded-md sm:rounded-3xl sm:px-24 xl:py-16">
          <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The UberTalent Story
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-gray-300">
            Our founder has hired hundreds of independent professionals over the
            last 15 years. During that time, we developed a hiring method that
            helps new and experienced leaders find the best talent for the team.
            Source and connect to the talent you need to deliver your next
            project.
          </p>
          <div className="flex justify-center mt-16">
            <Link
              href="/sign-up"
              type="submit"
              className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Get Started
            </Link>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2"
            aria-hidden="true"
          >
            <circle
              cx={512}
              cy={512}
              r={512}
              fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
              fillOpacity="0.7"
            />
            <defs>
              <radialGradient
                id="759c1415-0410-454c-8f7c-9a820de03641"
                cx={0}
                cy={0}
                r={1}
                gradientUnits="userSpaceOnUse"
                gradientTransform="translate(512 512) rotate(90) scale(512)"
              >
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" stopOpacity={0} />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div> */}

      {/* Testimonials section */}
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-lg font-semibold leading-8 tracking-tight text-black">
              Testimonials
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              We have collaborated with exceptional and talented individuals
              across the globe.
            </p>
          </div>
          <div className="mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none">
            <div className="-mt-8 sm:-mx-4 sm:columns-1 sm:text-[0] lg:grid lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.author.handle}
                  className="pt-8 sm:inline-block sm:w-full sm:px-4"
                >
                  <figure className="rounded-2xl bg-gray-50 p-8 text-sm leading-6">
                    <blockquote className="text-gray-900">
                      <p>{`“${testimonial.body}”`}</p>
                    </blockquote>
                    <figcaption className="mt-6 flex items-center gap-x-4">
                      <Image
                        src={testimonial.author.imageUrl}
                        alt=""
                        width="42"
                        height="42"
                        className="h-14 w-14 object-cover rounded-full bg-gray-50"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {testimonial.author.name}
                        </div>
                        {/* <div className="text-gray-600">{`@${testimonial.author.handle}`}</div> */}
                      </div>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="relative isolate mt-12 sm:mt-32 sm:pt-32 mb-8 sm:mb-10">
        <svg
          className="absolute inset-0 -z-10 hidden h-full w-full stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)] sm:block"
          aria-hidden="true"
        >
          <defs>
            <pattern
              id="55d3d46d-692e-45f2-becd-d8bdc9344f45"
              width={200}
              height={200}
              x="50%"
              y={0}
              patternUnits="userSpaceOnUse"
            >
              <path d="M.5 200V.5H200" fill="none" />
            </pattern>
          </defs>
          <svg x="50%" y={0} className="overflow-visible fill-gray-50">
            <path
              d="M-200.5 0h201v201h-201Z M599.5 0h201v201h-201Z M399.5 400h201v201h-201Z M-400.5 600h201v201h-201Z"
              strokeWidth={0}
            />
          </svg>
          <rect
            width="100%"
            height="100%"
            strokeWidth={0}
            fill="url(#55d3d46d-692e-45f2-becd-d8bdc9344f45)"
          />
        </svg>
        <div className="relative">
          <div
            className="absolute inset-x-0 top-1/2 -z-10 -translate-y-1/2 transform-gpu overflow-hidden opacity-30 blur-3xl"
            aria-hidden="true"
          >
            <div
              className="ml-[max(50%,38rem)] aspect-[1313/771] w-[82.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div
            className="absolute inset-x-0 top-0 -z-10 flex transform-gpu overflow-hidden pt-8 opacity-25 blur-3xl xl:justify-end"
            aria-hidden="true"
          >
            <div
              className="ml-[-22rem] aspect-[1313/771] w-[82.0625rem] flex-none origin-top-right rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] xl:ml-0 xl:mr-[calc(50%-12rem)]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl sm:text-center">
              <h2 className="text-lg font-semibold leading-8 tracking-tight text-black">
                Testimonials
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                We&apos;ve collaborated with exceptional and talented
                individuals across the globe.{" "}
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 grid-rows-1 gap-8 text-sm leading-6 text-gray-900 sm:mt-20 sm:grid-cols-2 xl:mx-0 xl:max-w-none xl:grid-flow-col xl:grid-cols-4">
              <figure className="col-span-2 hidden sm:block sm:rounded-2xl sm:bg-white sm:shadow-lg sm:ring-1 sm:ring-gray-900/5 xl:col-start-2 xl:row-end-1">
                <blockquote className="p-12 text-xl font-semibold leading-8 tracking-tight text-gray-900">
                  <p className="text-base">{`“${featuredTestimonial.body}”`}</p>
                </blockquote>
                <figcaption className="flex items-center gap-x-4 border-t border-gray-900/10 px-6 py-4">
                  <div className="flex-auto">
                    <div className="font-semibold">
                      {featuredTestimonial.author.name}
                    </div>
                  </div>
                </figcaption>
              </figure>
              {testimonials.map((columnGroup, columnGroupIdx) => (
                <div
                  key={columnGroupIdx}
                  className="space-y-8 xl:contents xl:space-y-0"
                >
                  {columnGroup.map((column, columnIdx) => (
                    <div
                      key={columnIdx}
                      className={classNames(
                        (columnGroupIdx === 0 && columnIdx === 0) ||
                          (columnGroupIdx === testimonials.length - 1 &&
                            columnIdx === columnGroup.length - 1)
                          ? "xl:row-span-2"
                          : "xl:row-start-1",
                        "space-y-8"
                      )}
                    >
                      {column.map((testimonial) => (
                        <figure
                          key={testimonial.author.name}
                          className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5"
                        >
                          <blockquote className="text-gray-900">
                            <p className="text-base">{`“${testimonial.body}”`}</p>
                          </blockquote>
                          <figcaption className="mt-6 flex items-center gap-x-4">
                            <div>
                              <div className="font-semibold">
                                {testimonial.author.name}
                              </div>
                            </div>
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}
    </main>
  );
}
