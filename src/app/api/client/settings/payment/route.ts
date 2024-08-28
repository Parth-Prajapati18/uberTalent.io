import { clientService } from "@/app/services/clientService";
import { NextResponse } from "next/server";


export async function PUT(req: Request) {
  try {
    const request = await req.json();
    const updatedClientProfile = await clientService.updateClientStripeId(request);
    return NextResponse.json(updatedClientProfile, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}