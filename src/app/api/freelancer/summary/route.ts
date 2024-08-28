export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { freelancerService } from "@/app/services/freelancerService";
import { getCurrentUser } from "@/app/lib/session";
import { SummaryDbresponse, SummaryResponse } from "@/app/types";

export async function GET(
  request: Request
): Promise<NextResponse<SummaryResponse | { error: string }>> {
  try {
    const currentUser = await getCurrentUser();
    const summary: SummaryResponse = await freelancerService.getSummary(
      currentUser.id
    );
    console.log('summary: ', summary);
    return NextResponse.json(summary, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
