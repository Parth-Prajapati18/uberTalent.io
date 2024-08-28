import { SignIn } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

import { redirect } from "next/navigation";

export default async function Page() {
  const authUser = await currentUser();
  console.log(
    "authUser",
    authUser ? authUser.emailAddresses[0] : "no authUser"
  );

  if (authUser) {
    redirect("/account-type");
  }

  return <SignIn fallbackRedirectUrl="/account-type" />;
}
