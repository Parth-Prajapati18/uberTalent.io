import { prisma } from "../lib/prisma";
import { ProposalStatus, Proposal } from "@prisma/client";
import { getCurrentUser } from "../lib/session";

export const proposalService = {
  async getProposalsByJob(jobId: string, proposalStatus: ProposalStatus | any) {
    const currentUser = await getCurrentUser();
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        contract: true,
        createdById: true,
      },
    });
    if (!job) return { error: "Job not found" };
    if (job.createdById !== currentUser.id) return { error: "Unauthorized" };

    let where = { jobId };

    switch (proposalStatus) {
      case "SUBMITTED":
        where = {
          ...where,
          ...{
            OR: [
              // Case: status is SUBMITTED and no contract status
              {
                status: "SUBMITTED",
                contract: null, // or undefined if you want to include cases where contract is null
              },
              // Case: status is WITHDRAWN when freelancer WITHDRAWN and no contract status
              {
                status: "WITHDRAWN",
                contract: null,
              },
            ],
          },
        };
        break;
      case "OFFER":
        where = {
          ...where,
          ...{ status: proposalStatus, contract: { status: { in: ["PENDING", "REJECTED", "WITHDRAWN"]} } },
        };
        break;
      case "HIRED":
        where = {
          ...where,
          ...{ status: "OFFER", contract: { status: "ACTIVE" } },
        };
        break;
      default:
        where = {
          ...where,
          ...{ status: proposalStatus },
        };
    }

    const proposals = await prisma.proposal.findMany({
      where,
      include: {
        user: true,
        job: true,
        contract: {
          include: {
            client: {
              include: {
                user:true
              }
            }
          }
        },
      },
    });

    const SUBMITTED = await prisma.proposal.count({
      where: {
        jobId,
        OR: [
          // Case: status is SUBMITTED and no contract status
          {
            status: "SUBMITTED",
            contract: null, // or undefined if you want to include cases where contract is null
          },
          // Case: status is WITHDRAWN when freelancer WITHDRAWN and no contract status
          {
            status: "WITHDRAWN",
            contract: null,
          },
        ],
      },
    });

    const SHORT_LISTED = await prisma.proposal.count({
      where: {
        jobId,
        status: "SHORT_LISTED",
      },
    });

    const DISQUALIFIED = await prisma.proposal.count({
      where: {
        jobId,
        status: "DISQUALIFIED",
      },
    });

    const OFFER = await prisma.proposal.count({
      where: {
        jobId,
        status: "OFFER",
        contract: { status: { in: ["PENDING", "REJECTED", "WITHDRAWN"] } },
      },
    });

    const HIRED = await prisma.proposal.count({
      where: {
        jobId,
        status: "OFFER",
        contract: { status: "ACTIVE" },
      },
    });

    return {
      data: proposals,
      count: { SUBMITTED, SHORT_LISTED, DISQUALIFIED, OFFER, HIRED },
    };
  },

  async getProposalById(proposalId: string) {
    const currentUser = await getCurrentUser();

    const proposal = await prisma.proposal.findUnique({
      where: {
        id: proposalId,
      },
      include: {
        user: {
          include: {
            freelancerProfile: true,
          },
        },
        job: {
          include: {
            createdBy: true,
          },
        },
      },
    });
    if (!proposal) return { error: "Proposal not found" };
    return { data: proposal };
  },

  async updateProposal(proposalId: string, data: Partial<Proposal>) {
    const proposal = await prisma.proposal.update({
      where: {
        id: proposalId,
      },
      data: {
        ...data,
      },
      include: {
        job: {
          include: {
            createdBy: true,
          },
        },
      },
    });
    if (!proposal) return { error: "Proposal not found" };

    if (proposal.status === "WITHDRAWN" ||
      proposal.status === "DISQUALIFIED" ||
      proposal.status === "OFFER") {
        const contract = await prisma.contract.findFirst({
          where: {
            AND: [{ jobId: proposal.jobId}, {freelancerId: proposal.userId}],
          },
        });
        if (contract) {
          if (proposal.status === "OFFER") {
            await prisma.contract.update({
              where: { id: contract.id },
              data: { status: "PENDING"},
            });
          } else if (proposal.status === "WITHDRAWN") {
            await prisma.contract.update({
              where: { id: contract.id },
              data: { status: "WITHDRAWN"},
            });
          } else if (proposal.status === "DISQUALIFIED") {
            await prisma.contract.update({
              where: { id: contract.id },
              data: { status: "REJECTED"},
            });
          }
        }
    }
    return { data: proposal };
  },
};
