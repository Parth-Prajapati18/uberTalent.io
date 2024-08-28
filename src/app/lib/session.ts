
import { prisma, } from "@/app/lib/prisma"
import { currentUser, auth } from "@clerk/nextjs/server";
import { UserType } from "../types";


export const getCurrentUser = async (): Promise<UserType> => {
  console.log("getUser");
  const { userId } = auth();
  console.log("userId", userId);
  if (!userId) {
    throw new Error("unauthorized");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
    include: {
      freelancerProfile: {
        include: {
          languages: true,
          portfolio: true
        }
      },
      client: true,
      jobCreatedBy: true,
    },
  });

  console.log("currentUser", currentUser?.id, currentUser?.email);
  return currentUser as UserType;
};



export const isAuthenticatedClient = async () => {
  const currentUser = await getCurrentUser();
  return !!currentUser?.clientId;
}