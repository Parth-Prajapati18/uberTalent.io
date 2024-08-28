import { contractService } from "@/app/services/contractService";
import {
  ContractDetailsType,
  ErrorResponse,
  ProposalDetailsType,
} from "@/app/types";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
): Promise<NextResponse<{ data: ContractDetailsType } | ErrorResponse>> {
  const body = await request.json();
  try {
    const response = await contractService.createContract(body);
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
