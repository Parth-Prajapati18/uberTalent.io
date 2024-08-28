import { prisma } from "@/app/lib/prisma";
import { SignupType } from "@/app/schema/SignupSchema";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { currentUser as AuthUser } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import { userService } from "@/app/services/userService";

export async function POST(req: Request) {
  console.log('api/register');
  try {

    const user = await userService.registerNewUser();

    return NextResponse.json({ user });

  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code,
      }),
      { status: 500 }
    );
  }
}



