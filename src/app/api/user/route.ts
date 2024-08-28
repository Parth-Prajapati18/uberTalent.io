export const dynamic = 'force-dynamic';
import { prisma } from "@/app/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { currentUser, auth } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/app/lib/session";

export async function GET(req: NextRequest) {
  try {

    const currentUser = await getCurrentUser();

    return NextResponse.json(currentUser, { status: 200 })
  } catch(err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
  
}
