import { timesheetService } from "@/app/services/timesheetService";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const contractId = request?.nextUrl?.searchParams?.get(
    "contractId"
  ) as string;
  const weekStart = request?.nextUrl?.searchParams?.get("weekStart") as string;
  try {
    const timesheets = await timesheetService.getHistoricalTimesheet(
      contractId,
      weekStart
    );
    return NextResponse.json(
      { message: "success", data: timesheets },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
