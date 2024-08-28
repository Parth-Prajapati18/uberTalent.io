import { Suspense } from "react";
import EditProfile from "../EditProfile";
import ProfileHeader from "./ProfileHeader";

export default function FreelancerProfile() {
  return (
    <Suspense>
      <ProfileHeader />
      <EditProfile />
    </Suspense>
  );
}
