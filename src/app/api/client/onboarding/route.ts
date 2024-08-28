import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/session";
import { clientService } from "@/app/services/clientService";

export async function POST(request:Request) {
  try {
    console.log("POST: client/onboarding ");
    const data = await request.json();
    console.log("data: ", data);
    const updatedUser = await clientService.onboardClient(data);
    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
 

}