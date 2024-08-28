import Link from "next/link";
import Image from "next/image";

const navigation = {
  terms: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms Of Service", href: "/terms-of-service" },
    { name: "Cookie Policy", href: "/privacy-policy" },
  ],
  links: [
    { name: "Home", href: "/" },
    { name: "Hire Talent", href: "/hire-talent" },
    { name: "Find Work", href: "/find-work" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 mt-2" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-12 sm:pt-12 lg:px-8 lg:pt-12">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <Image
            src="/logos/white_UberTalent.svg"
            alt="UberTalent"
            height={80}
            width={200}
          />
          <div className="mt-16 grid grid-cols-2 gap-28 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2">
              <div />

              {/* //// */}
              <div>
                <h3 className="text-sm font-semibold leading-6 text-white">
                  Contact Us
                </h3>
                <a
                  href="mailto:UberTalent<support@ubertalent.io>"
                  className="text-sm leading-6 text-gray-300 hover:text-white flex gap-2 w-fit mt-6"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>

                  <span className="hidden sm:block">support@ubertalent.io</span>
                </a>
              </div>
              {/* //// */}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                  Terms
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.terms.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold leading-6 text-gray-900">
                  Links
                </h3>
                <ul role="list" className="mt-6 space-y-4">
                  {navigation.links.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm leading-6 text-gray-300 hover:text-white"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-900/10 pt-8 flex justify-center md:items-center">
          <p className="mt-8 text-xs leading-5 text-gray-500 md:order-1 md:mt-0">
            &copy; 2024 UberTalent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// {
//   name: "Email",
//   href: "mailto:UberTalent<support@ubertalent.io>",
//   icon: (props: any) => (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       fill="none"
//       viewBox="0 0 24 24"
//       strokeWidth="1.5"
//       stroke="currentColor"
//       className="w-6 h-6"
//       {...props}
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
//       />
//     </svg>
//   ),
// },
