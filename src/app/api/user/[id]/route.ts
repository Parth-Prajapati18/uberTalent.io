import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/app/services/userService";
import { User } from "@prisma/client";
import { ErrorResponse } from "@/app/types";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await userService.getUserById(params.id);

    return NextResponse.json(user, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
