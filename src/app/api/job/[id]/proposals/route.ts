import { proposalService } from "@/app/services/proposalService";
import { ErrorResponse, ProposalsWithUserAndJobType } from "@/app/types";
import { ProposalStatus } from "@prisma/client";
import { NextResponse } from "next/server";

function mapQueryParamToEnum(
  statusQueryParam: string | null = ""
): ProposalStatus {
  switch (statusQueryParam?.toLowerCase()) {
    case "disqualified":
      return "DISQUALIFIED";
    case "short_listed":
      return "SHORT_LISTED";
    case "submitted":
      return "SUBMITTED";
    default:
      return "SUBMITTED";
  }
}
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<
  NextResponse<{ data: ProposalsWithUserAndJobType[] } | ErrorResponse>
> {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const statusList = searchParams.getAll("status") as ProposalStatus[];
  try {
    const response = await proposalService.getProposalsByJob(
      params.id,
      statusList
    );
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
