export const dynamic = 'force-dynamic';
import { clientService } from "@/app/services/clientService";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await clientService.getRecommendedFreelancers();
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
