import Profile from "@/app/components/ui/shared/Profile";
import EditProfile from "./EditProfile";
import { Suspense } from "react";

export default async function FreelancerSettings() {
  return (
    <Suspense>
      <Profile>
        <EditProfile />
      </Profile>
    </Suspense>
  );
}
