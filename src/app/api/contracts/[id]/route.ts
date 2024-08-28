import { contractService } from "@/app/services/contractService";
import { ContractDetailsType, ErrorResponse, ProposalDetailsType } from "@/app/types";
import { ProposalStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<
  NextResponse<{ data: ContractDetailsType } | ErrorResponse>
> {
  try {
    const response = await contractService.getContractById(params.id);
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

export async function PUT(req: Request, { params }: { params: { id: string } })
{
  const data = await req.json();  
  try {
    const updatedContract = await contractService.updateContract(params.id, data);
    return NextResponse.json(updatedContract, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}