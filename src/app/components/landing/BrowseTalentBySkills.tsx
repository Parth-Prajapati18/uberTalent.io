import Link from "next/link";

const skills = [
  "Graphic Design",
  "Web Development",
  "UI/UX Design",
  "Illustration",
  "Virtual Assistance",
  "Digital Marketing",
  "Mobile App Development",
  "Transcription Services",
  "Social Media Management",
  "Copywriting and Editing",
  "Writing and Content Creation",
  "Video Editing and Animation",
  "Photography and Videography",
  "Customer Support and Service",
  "Translation and Localization",
  "Data Entry and Administration",
  "Voiceover and Audio Production",
  "SEO (Search Engine Optimization)",
  "Consulting and Business Strategy",
  "E-commerce Development and Management",
];

export default function BrowseTalentBySkills() {
  return (
    <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
      <div className="mx-auto max-w-2xl lg:text-center">
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Browse Talent by Skills
        </p>
        <p className="mt-6 text-lg leading-8 text-gray-600">
        Whether you&apos;re seeking a gig or searching for freelance talent, Ubertalent is your one-stop destination for everything you need.
        </p>
      </div>
      <div className="border border-gray-200 rounded-lg shadow py-10 px-6 mx-auto mt-8 max-w-2xl sm:mt-8 lg:mt-8 lg:max-w-4xl">
      <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4 lg:gap-y-4 lg:gap-x-1">
          {skills.map((skill) => (
            <div key={skill} className="relative pl-16">
              <dt>
                <div className="absolute left-8 top-0 flex items-center justify-center rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                <Link
                  href="/sign-up"
                  className="text-sm text-gray-900 hover:text-black">
                  {skill}
                </Link>
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
