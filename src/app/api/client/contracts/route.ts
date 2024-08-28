export const dynamic = 'force-dynamic';
import { contractService } from "@/app/services/contractService";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const contracts = await contractService.getAllContracts();
    return NextResponse.json(contracts, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}