import { timesheetService } from "@/app/services/timesheetService";
import { NextResponse } from "next/server";

export async function PUT(request: Request, { params: { id: timesheetId } }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const updatedDayEntry = await timesheetService.updateDayEntry(timesheetId, body);
        return NextResponse.json(updatedDayEntry, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
   

}