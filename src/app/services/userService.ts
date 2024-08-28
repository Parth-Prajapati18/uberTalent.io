import { User } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { currentUser as AuthUser } from "@clerk/nextjs/server";
import { getCurrentUser } from "../lib/session";
import { UserType } from "../types";

export const userService = {
  async registerNewUser(): Promise<UserType> {
    const authUser = await AuthUser();

    console.log("regisgtering user: ", authUser);

    const email = authUser?.emailAddresses[0].emailAddress || ""; // Assign an empty string if authUser or emailAddresses[0] is undefined

    const user = await prisma.user.create({
      data: {
        clerkId: authUser?.id || null,
        email: email,
        firstName: authUser?.firstName || null,
        lastName: authUser?.lastName || null,
        profileImg: authUser?.hasImage ? authUser?.imageUrl : null,
      },
    });

    const currentUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        freelancerProfile: true,
        client: true,
        jobCreatedBy: true,
      },
    });

    return currentUser as UserType;
  },

  async updateProfileImage(data: any): Promise<User> {
    const currentUser = await getCurrentUser();
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        profileImg: data,
      },
      include: { freelancerProfile: true },
    });
    return updatedUser;
  },

  async getUserById(id: string): Promise<User | null> {
    const foundUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        client: true,
        contract: true,
        freelancerProfile: true,
        jobInvites: true,
      },
    });
    if (!foundUser) throw new Error("No user found");
    return foundUser;
  },

  async updateUserProfile(data: any): Promise<User> {
    const { id, firstName, lastName, country, isPrivate } = data;
    const currentUser = await getCurrentUser();

    if (currentUser.client) {
      await prisma.client.update({
        where: { id },
        data: { country },
      });
    } else {
      await prisma.freelancerProfile.update({
        where: { id },
        data: { country, isPrivate },
      });
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
      },
      include: { client: true, freelancerProfile: true },
    });

    return updatedUser;
  },

  //async loginUser(userData) {
  // Login logic here
  //},
  // more user-related functions...
};
