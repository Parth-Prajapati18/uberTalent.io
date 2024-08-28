import { contractService } from "@/app/services/contractService";
import { NextResponse } from "next/server";

export async function PUT(
    req: Request,
  ) {
    try {
        const request = await req.json();  
        const updatedContractStatus = await contractService.updateContractStatus(request.id, request.status, request.rejectedReasonCode);
        return NextResponse.json(updatedContractStatus, { status: 200 })

    } catch (err) {
        console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
    }
   
  }