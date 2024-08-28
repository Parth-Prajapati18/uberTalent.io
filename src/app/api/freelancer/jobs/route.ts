import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getCurrentUser } from "@/app/lib/session";
import { FreelancerJobsType } from "@/app/types";

/**
 * Note: I don't see this being called? 
 * @param request 
 * @returns 
 */
export async function GET(request: Request) {
  try {
    console.log("Get Freelaancer Saved Jobs, Contracts and Proposals");
    console.log("GET /api/freelancer/jobs");
    const currentUser = await getCurrentUser();

    const savedJobs = await prisma.savedJobs.findMany({
      where: {
        userId: currentUser.id,
        job: { 
          status: "ACTIVE", 
          isPublished: true, 
          proposal: { none: {} }
        }
      },
      include: {
        job: {
          include: {
            proposal: true,
            createdBy: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            client: {
              select: {
                companyLogo: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    const contracts = await prisma.contract.findMany({
      where: {
        freelancerId: currentUser.id,
      },
      include: {
        job: true,
        proposal: true,
        client: {
          select: {
            companyName: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImg: true,
              },
            },
          },
        },
        freelancer: {
          select: {
            firstName: true,
            lastName: true,
            profileImg: true,
          },
        },
      },
    });

    const proposals = await prisma.proposal.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        user: true,
        job: { include: {createdBy: { select: { email: true, firstName: true, lastName: true }}}
      }
      },
    });

    const result: FreelancerJobsType = {
      savedJobs: savedJobs,
      contract: contracts,
      proposal: proposals,
    };

    console.log("freelancer dashboard data", result);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    // console.error(err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
