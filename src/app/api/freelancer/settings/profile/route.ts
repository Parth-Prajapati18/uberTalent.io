import { freelancerService } from "@/app/services/freelancerService";
import { NextResponse } from "next/server";


export async function PUT(req: Request) {
  try {
    const request = await req.json();  
    const updatedFreelancerProfile = await freelancerService.updateFreelacerProfile(request);
    return NextResponse.json(updatedFreelancerProfile, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}