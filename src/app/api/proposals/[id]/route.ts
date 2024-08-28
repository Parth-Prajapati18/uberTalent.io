import { proposalService } from "@/app/services/proposalService";
import { ErrorResponse, ProposalDetailsType } from "@/app/types";
import { ProposalStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<{ data: ProposalDetailsType } | ErrorResponse>> {
  try {
    const response = await proposalService.getProposalById(params.id);
    if (response.error) throw new Error(response.error);
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<any | ErrorResponse>> {
  try {
    const body = await request.json();
    const response = await proposalService.updateProposal(params.id, body);
    if (response.error) throw new Error(response.error);
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
