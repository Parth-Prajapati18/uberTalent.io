"use client";

import useParamsManager from "@/app/components/hooks/useParamsManager";
import { useFLSlideOVerContext } from "@/app/providers/FreelancerSlideOverProvider";
import { useUserContext } from "@/app/providers/UserProvider";

export default function ProfileHeader() {
  const { user, userType } = useUserContext();
  const { setSearchParams, commit } = useParamsManager();
  const { setDisableInvite, setOpenSlideOver, setFlSlideOverData } =
    useFLSlideOVerContext();

  function handleViewProfile() {
    const { freelancerProfile } = user;
    const freelancer: any = {
      userId: user?.id || null,
      firstName: user?.firstName || null,
      lastName: user?.lastName || null,
      country: freelancerProfile?.country || null,
      email: user?.email,
      imageUrl: user?.profileImg || null,
      title: freelancerProfile?.title || null,
      profileSummary: freelancerProfile?.overview || null,
      categories: freelancerProfile?.category || null,
      skills: freelancerProfile?.skills || null,
      hourlyRate: freelancerProfile?.rate || null,
      hoursPerWeek: freelancerProfile?.availability || null,
      jobInvites: [],
      contract: [],
    };
    setSearchParams({ link: "preview" });
    commit();
    setDisableInvite(true);
    setFlSlideOverData(freelancer);
    setOpenSlideOver(true);
  }

  return (
    <div className="flex justify-between items-start gap-x-8 mb-6 pb-6 space-y-6 divide-y divide-gray-100 border-b border-gray-200">
      <div>
        <h2 className="text-base font-semibold leading-7 text-gray-900">
          Profile Information
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          This information will be visible on your profile and accessible to
          clients on the platform.
        </p>
      </div>
      {userType === "FREELANCER" && (
        <button
          type="button"
          onClick={handleViewProfile}
          className="rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-black hover:bg-stone-800 text-white focus:outline-none focus:ring-2 focus:ring-white"
        >
          Preview
        </button>
      )}
    </div>
  );
}
