import { NextResponse } from "next/server";
import { freelancerService } from "@/app/services/freelancerService";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await freelancerService.getPortfolioById(params.id);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    const updatedProject = await freelancerService.updatePortfolio(
      params.id,
      data
    );

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deletedProject = await freelancerService.deletePortfolio(params.id);

    return NextResponse.json(deletedProject, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
