import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { ProposalStatus } from "@prisma/client";
import { freelancerService } from "@/app/services/freelancerService";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId } = body;
    console.log("new proposal", body);

    const proposal = await freelancerService.submitProposal(body);
    await freelancerService.unsaveJob(jobId);
    // TODO: Determine if a response is needed
    return NextResponse.json(proposal);
  } catch (err) {
    // console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
