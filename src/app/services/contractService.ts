import { Contract, JobCompType, Prisma, ProposalStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/session";
import { CreateContractData } from "../types";

type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'PENDING' | 'REJECTED' | "WITHDRAWN";

export const contractService = {
  async getAllContracts(): Promise<any> {
    const currentUser = await getCurrentUser();

    const whereClause: any = 
      currentUser?.clientId ? { client: { id: currentUser?.clientId } } : {freelancer: { id: currentUser?.id } }
    
    const contracts = await prisma.contract.findMany({
      where: {
        ...whereClause
      },
      include: {
        freelancer: true,
        client: {
          include: {
            user:true
          }
        },
        job: true,
        proposal:true,
      },
    });

    whereClause.status = 'ACTIVE';
    const activeCount = await prisma.contract.count({ where: {
      ...whereClause
    } });
    whereClause.status = 'COMPLETED';
    const completedCount = await prisma.contract.count({ where: {
      ...whereClause
    } });

    return {contracts, activeCount, completedCount};
  },

  async getContractById(contractId: string) {
    const contract = await prisma.contract.findUnique({
      where: {
        id: contractId,
      },
      include: {
        job: {
          include: {
            createdBy: true,
          },
        },
        freelancer: {
          include: {
            freelancerProfile: true,
          },
        },
        client: {
          include: {
            user:true
          }
        },
        proposal: true,
      },
    });
    if (!contract) return { error: "Contract not found" };
    return { data: contract };
  },

  async updateConteactStatus(contractId: string, status: ContractStatus) {
    const updatedContract = await prisma.contract.update({
      where: {
        id: contractId,
      },
      data: {
        status: status,
      },
    });

    return contractId
  },

  async createContract(data: CreateContractData): Promise<any> {
    // Update Proposal Status
    const {
      proposalId,
      type,
      hourlyRate = 0,
      projectCost = 0,
      weeklyLimit,
      endDate,
      title,
      description,
      attachments,
      closeJob,
      paymentService,
    } = data;
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        job: {
          select: {
            compType: true,
            createdBy: {
              select: {
                clientId: true,
              },
            },
          },
        },
      },
    });
    if (!proposal) return { error: "Proposal not found" };

    // Create a contract
    const newContract = await prisma.contract.create({
      data: {
        type,
        rate: type === "HOURLY" ? hourlyRate : projectCost,
        weeklyLimit,
        status: "PENDING",
        clientId: proposal.job.createdBy?.clientId!, // TODO: Confirm how to deal with this
        freelancerId: proposal.userId,
        jobId: proposal.jobId,
        endDate,
        title,
        description,
        attachments,
        proposal: {
          connect: {
            id: proposal.id,
          },
        },
        paymentService,
      },
    });
    if (!newContract) return { error: "Something went wrong" };

    // Update job status to closed if more freelancers don't need to be hired
    if (closeJob) {
      await prisma.job.update({
        where: {
          id: proposal.jobId,
        },
        data: {
          status: "CLOSED",
        },
      });
    }

    // Delete the proposal
    // await prisma.proposal.delete({
    //   where: {
    //     id: proposalId,
    //   },
    // });

    //update propsal
    await prisma.proposal.update({
      where: { id: proposal.id },
      data: {
        status: 'OFFER',
      }
    });
    return newContract;
  },

  async updateContractStatus(contractId: string, status: string, rejectedReasonCode?: string) {
    const dataToUpdate: Prisma.ContractUpdateInput | any = {
      status: status as ContractStatus,
    };

    if (status === 'ACTIVE') {
      dataToUpdate.startDate = new Date();
    }

    if (status === 'COMPLETED') {
      dataToUpdate.endDate = new Date();
    }

    if(rejectedReasonCode) {
      dataToUpdate.rejectedReasonCode = rejectedReasonCode;
    }

    const contract = await prisma.contract.update({
      where: {
        id: contractId,
      },
      data: dataToUpdate,
    });
    return contract
  },

  async updateContract(contractId: string, data: CreateContractData) {
    const {
      type,
      hourlyRate = 0,
      projectCost = 0,
      weeklyLimit,
      endDate,
      rehire,
      status,
      title,
      description,
      attachments,
      proposalId,
      paymentService,
    } = data;

    const updatedContract = await prisma.contract.update({
      where: {
        id: contractId,
      },
      data: {
        type,
        rate: type === "HOURLY" ? hourlyRate : projectCost,
        weeklyLimit,
        // status: "ACTIVE",
        status,
        title,
        description,
        attachments,
        paymentService,
      },
      include: {
        job: true,
        freelancer: true
      },
    });
    if (!updatedContract) return { error: "Something went wrong" };

    if (rehire) {
      await prisma.proposal.update({
        where: { id: proposalId },
        data: { status: "OFFER" },
      });
    }

    return updatedContract;
  },

  async getContractStartDate(contractId: string) {
    const user = await getCurrentUser();
    const contract = await prisma.contract.findUnique({
      where: {
        id: contractId,
        freelancerId: user?.freelancerProfile?.id
      },
      select: {
        startDate: true
      }
    })
    return contract
  }
  
};
