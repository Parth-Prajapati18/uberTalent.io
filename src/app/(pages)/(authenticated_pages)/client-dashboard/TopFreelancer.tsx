"use client";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { FreelancerTypeExtended } from "@/app/schema/FreelancerOnboardingSchema";
import { BriefcaseIcon, UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const people: FreelancerTypeExtended[] = [
  {
    categories: [
      "Accounting & Bookkeeping",
      "Financial Planning",
      "Management Consulting & Analysis",
      "Personal & Professional Coaching",
    ],
    skills: [
      "Software Developer",
      "Finance Accountant",
      "AI Developer",
      "QA Tester",
    ],
    country: "US",
    firstName: "Jane",
    hourlyRate: 35,
    hoursPerWeek: "20",
    title: "Accountant",
    lastName: "Cooper",
    profileSummary:
      "Profile summary of placeholder employee Jane Cooper. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam architecto amet voluptates fuga? Nostrum, veritatis aperiam! Nostrum iure vitae optio? Dolorem consectetur repellendus dicta! Sint soluta quas ex ut ducimus, maiores sit excepturi hic quasi distinctio nulla ea ab necessitatibus, inventore exercitationem quod, cum rem quidem? Qui repellendus dolore ad officia",
    email: "janecooper@email.com",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
  },
  {
    categories: [
      "AI & Machine Learning",
      "Data Analysis & Testing",
      "Data Design & Visualization",
      "Data Extraction/ETL",
    ],
    skills: [
      "Software Developer",
      "Finance Accountant",
      "AI Developer",
      "QA Tester",
    ],
    country: "US",
    firstName: "Alan",
    hourlyRate: 90,
    hoursPerWeek: "40",
    title: "AI Engineer",
    lastName: "Smith",
    profileSummary:
      "Profile summary of placeholder employee Alan Smith. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam architecto amet voluptates fuga? Nostrum, veritatis aperiam! Nostrum iure vitae optio? Dolorem consectetur repellendus dicta! Sint soluta quas ex ut ducimus, maiores sit excepturi hic quasi distinctio nulla ea ab necessitatibus, inventore exercitationem quod, cum rem quidem? Qui repellendus dolore ad officia",
    email: "alansmith@email.com",
    imageUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?&w=256&h=256&q=60",
  },
  {
    categories: [
      "Market Research & Product Reviews",
      "Project Management",
      "Other - Accounting & Consulting",
    ],
    skills: [
      "Software Developer",
      "Finance Accountant",
      "AI Developer",
      "QA Tester",
    ],
    country: "CA",
    firstName: "John",
    hourlyRate: 30,
    hoursPerWeek: "25",
    title: "Project Manager",
    lastName: "Doe",
    profileSummary:
      "Profile summary of placeholder employee John Doe. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Aperiam architecto amet voluptates fuga? Nostrum, veritatis aperiam! Nostrum iure vitae optio? Dolorem consectetur repellendus dicta! Sint soluta quas ex ut ducimus, maiores sit excepturi hic quasi distinctio nulla ea ab necessitatibus, inventore exercitationem quod, cum rem quidem? Qui repellendus dolore ad officia",
    email: "johndoe@email.com",
    imageUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?&w=256&h=256&q=60",
  },

  // More people...
];

export default function TopFreelancers() {
  const { setFlSlideOverData, setOpenSlideOver } = useFLSlideOVerContext();
  const viewFreelancerProfile = (data: any) => {
    setFlSlideOverData(data);
    setOpenSlideOver(true);
  };
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {people.map((person) => (
        <li
          key={person.email}
          className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
        >
          <div className="flex w-full items-center justify-between space-x-6 p-6">
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-sm font-medium text-gray-900">
                  {person.firstName} {person.lastName}
                </h3>
                {/* <span className="inline-flex flex-shrink-0 items-center rounded-full bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {person.role}
                </span> */}
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">
                Regional Paradigm Technician
              </p>
            </div>
            <Image
              className="flex-shrink-0 rounded-full bg-gray-300"
              src={person.imageUrl}
              alt=""
              height={40}
              width={40}
            />
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-200">
              <div className="flex w-0 flex-1">
                <button
                  onClick={() => viewFreelancerProfile(person)}
                  className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-bl-lg border border-transparent py-4 text-sm font-semibold text-gray-900"
                >
                  <UserIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  View
                </button>
              </div>
              <div className="-ml-px flex w-0 flex-1">
                <button className="relative inline-flex w-0 flex-1 items-center justify-center gap-x-3 rounded-br-lg border border-transparent py-4 text-sm font-semibold text-gray-900">
                  <BriefcaseIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  Hire
                </button>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
