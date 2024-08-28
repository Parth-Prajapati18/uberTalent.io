import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { useUserContext } from "@/app/providers/UserProvider";
import { usePathname } from 'next/navigation'

export default function ProfileBanner() {
  const { user, userType } = useUserContext();

  const pathname = usePathname()

  const isFreelancerProfile = userType == "FREELANCER";

  return (
    <>
      {isFreelancerProfile === true &&
      pathname !== "/settings/freelancer" &&
      (!user.profileImg || user.profileImg === "") ? (
        <div className="rounded-md bg-gray-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3 flex-1 md:flex md:justify-between">
              <p className="text-sm text-gray-700">
                Your profile is incomplete. Add your Profile Photo now.
              </p>
              <p className="mt-3 text-sm md:ml-6 md:mt-0">
                <a
                  href="/settings/freelancer"
                  className="whitespace-nowrap font-medium text-gray-700 hover:text-v-400"
                >
                  Add
                  <span aria-hidden="true"> &rarr;</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
