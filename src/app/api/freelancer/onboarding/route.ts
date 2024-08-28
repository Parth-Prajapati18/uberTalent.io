import { NextResponse } from "next/server";
import { freelancerService } from "@/app/services/freelancerService";

export async function POST(request:Request) {
  try {
    const data = await request.json()
    const updatedUser = await freelancerService.onboardFreelancer(data);
    return NextResponse.json(updatedUser, { status: 200 });
    
  }
  catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}