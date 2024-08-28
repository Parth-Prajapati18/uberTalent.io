import { NextResponse } from "next/server";
import { ErrorResponse } from "@/app/types";
import { Timesheet } from "@prisma/client";
import { timesheetService } from "@/app/services/timesheetService";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse<Timesheet | ErrorResponse>> {
  try {
    const data = await request.json();
    const timeseet: Timesheet = await timesheetService.patchTimesheet(params.id, data);
    return NextResponse.json(timeseet, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
