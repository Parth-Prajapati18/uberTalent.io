export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { freelancerService } from "@/app/services/freelancerService";

export async function GET(
  request: NextRequest
): Promise<NextResponse<any | { error: string }>> {
  try {
    const email = request?.nextUrl?.searchParams?.get("email") as string;
    const summary: any = await freelancerService.getFreelancerByEmail(email);
    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
