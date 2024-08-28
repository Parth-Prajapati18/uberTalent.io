import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { freelancerService } from "@/app/services/freelancerService";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await freelancerService.unsaveJob(params.id);
    return NextResponse.json({ error: false }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
