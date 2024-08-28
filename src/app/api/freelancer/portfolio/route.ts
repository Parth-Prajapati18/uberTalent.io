import { NextRequest, NextResponse } from "next/server";
import { freelancerService } from "@/app/services/freelancerService";

/**
 * Fetches the freelancer's portfolio
 * @param request
 * @returns
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request?.nextUrl?.searchParams?.get("userId") as string;
    const portfolio = await freelancerService.getPortfolio(userId);
    return NextResponse.json(portfolio, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newProject = await freelancerService.createPortfolio(data);
    return NextResponse.json(newProject, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
