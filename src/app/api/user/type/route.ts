export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/lib/session";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    const userType = currentUser?.clientId ? 'client' : 'freelancer';
    return NextResponse.json(userType, { status: 200 })
  } catch(err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
  
}
