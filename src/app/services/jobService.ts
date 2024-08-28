import { prisma } from "../lib/prisma";
import { JobWithProposalCount, JobType } from "../types";
import { Job, JobStatus, ProjectDuration, User } from "@prisma/client";
import { getCurrentUser } from "../lib/session";
import { Select } from "@twilio-paste/core";

export const jobService = {
  async addJob(data: any): Promise<Job> {
    const currentUser = await getCurrentUser();
    const {
      title,
      description,
      categories,
      skills,
      projectDuration,
      compensation,
      hourlyMinRate,
      hourlyMaxRate,
      projectCost,
      status,
      isPublished,
    } = data;
    const commonPayload = {
      client: {
        connect: {
          id: currentUser.client!.id,
        },
      },
      title,
      description,
      categories,
      skills,
      duration: projectDuration,
      compType: compensation,
      isPublished,
      status: status as JobStatus,
      createdBy: {
        connect: {
          id: currentUser.id,
        },
      },
      updatedBy: {
        connect: {
          id: currentUser.id,
        },
      },
    };
    let payload;
    if (compensation === "HOURLY") {
      payload = {
        ...commonPayload,
        hourlyMinRate,
        hourlyMaxRate,
      };
    } else {
      payload = {
        ...commonPayload,
        projectCost,
      };
    }

    const job = await prisma.job.create({
      data: payload,
    });
    return job;
  },

  async getAllJobs(): Promise<JobWithProposalCount[] | any> {
    const currentUser = await getCurrentUser();
    const where: any = {
      clientId: currentUser.client!.id,
      isDeleted: false
    };

    const jobs: any = await prisma.job.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        _count: {
          select: {
            proposal: {
              where: {
                OR: [
                  {
                    status: "SUBMITTED",
                    contract: null,
                  },
                  {
                    status: "WITHDRAWN",
                    contract: null,
                  },
                  {
                    status: "SHORT_LISTED",
                    contract: null,
                  },
                  {
                    status: "DISQUALIFIED",
                    contract: null,
                  },
                  {
                    status: "OFFER",
                    contract: { status: { in: ["ACTIVE", "PENDING", "REJECTED", "WITHDRAWN"] } },
                  }
                ]
              },
            },
          },
        },
      },
    });

    return jobs;
  },

  async getActiveClientJobs(params: any | undefined): Promise<Job[]> {
    const currentUser = await getCurrentUser();
    const jobs = await prisma.job.findMany({
      where: {
        clientId: currentUser.client!.id,
        ...(params && params),
      },
      include: {
        proposal: true,
      },
    });
    return jobs;
  },

  async getJobById(id: string): Promise<Job> {
    const currentUser = await getCurrentUser();
    const job = await prisma.job.findFirst({
      where: {
        id: id,
      },
      include: {
        createdBy: {
          select: {
            client: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                companyLogo: true,
                companyName: true,
              },
            },
          },
        },
        proposal: {
          where: {
            userId: currentUser.id,
          },
        },
        contract: {
          select: {
            id: true,
            freelancerId: true,
            status: true
          }
        }
      },
    });
    return job!;
  },
  async getJobDetailById(id: string): Promise<any> {
    const job = await prisma.job.findUnique({
      where: {
        id: id,
        status: "ACTIVE"
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        categories: true,
        skills: true,
        compType: true,
        hourlyMinRate: true,
        hourlyMaxRate: true,
        projectCost: true,
        duration: true,
        description: true,
      },
    });
    return job!;
  },
  async updateJob(jobId: string, data: any): Promise<Job> {
    const currentUser = await getCurrentUser();
    const {
      title,
      description,
      categories,
      skills,
      projectDuration,
      compensation,
      hourlyMinRate,
      hourlyMaxRate,
      projectCost,
      status,
      isPublished,
    } = data;
    const commonPayload = {
      title,
      description,
      categories,
      skills,
      duration: projectDuration as ProjectDuration,
      compType: compensation,
      isPublished,
      status: status as JobStatus,
      createdBy: {
        connect: {
          id: currentUser.id,
        },
      },
      updatedBy: {
        connect: {
          id: currentUser.id,
        },
      },
    };
    let payload;
    if (compensation === "HOURLY") {
      payload = {
        ...commonPayload,
        hourlyMinRate,
        hourlyMaxRate,
      };
    } else {
      payload = {
        ...commonPayload,
        projectCost,
      };
    }

    const job = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: payload,
    });
    return job;
  },

  async patchJobStatus(jobId: string, data: any): Promise<Job> {
    const payload: Record<string, any> = {};
    if (data?.status) {
      payload.status = data.status as JobStatus;
    }

    if (data?.isPublished !== undefined) {
      payload.isPublished = data.isPublished;
    }

    const job = await prisma.job.update({
      where: {
        id: jobId,
      },
      data: payload,
    });

    return job;
  },

  async searchJobs(searchQuery: string, sortQuery: string, categories: string, hourlyRate: string, pageNo: number, perPage: number): Promise<any> {
    console.log("JobServie.searchJobs()", searchQuery, sortQuery);
    let jobs: JobType[];
    const currentUser = await getCurrentUser();

    const queryConditions: any = {
      where: {
        status: "ACTIVE",
        isPublished: true
      },
      include: {
        createdBy: {
          select: {
            client: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                companyLogo: true,
                companyName: true,
              },
            },
          },
        },
        savedJobs: {
          where: {
            userId: currentUser.id,
          },
          select: {
            userId: true,
          },
        },
        proposal: {
          where: {
            userId: currentUser.id,
          },
        },
      },
      skip: (pageNo - 1) * perPage,
      take: perPage,
    };

    if (searchQuery) {
      queryConditions.where = {
        ...queryConditions.where,
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { categories: { has: searchQuery } },
        ],
      };
    }

    if (categories) {
      const catArr = categories.split(",");
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          categories: { hasSome: catArr }
        }
      }
    }

    if (hourlyRate) {
      const hrArr = hourlyRate.split(",");
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          AND: [
            { hourlyMinRate: { lte: parseInt(hrArr[1]) } },
            { hourlyMaxRate: { gte: parseInt(hrArr[0]) } },
          ],
        }
      }
    }

    if (sortQuery === "newest") {
      queryConditions.orderBy = { createdAt: "desc" };
    }

    const totalCount = await prisma.job.count({ where: queryConditions.where });

    const perPageCalc = Math.min(perPage, totalCount);
    const showingStart = (pageNo - 1) * perPageCalc + 1;
    const showingEnd = showingStart + perPageCalc - 1;

    const pageInfo = {
      totalRecords: totalCount,
      totalPages: Math.ceil(totalCount / perPage),
      pageNo: pageNo,
      perPage: perPageCalc,
      showingStart: Math.min(showingStart, totalCount),
      showingEnd: Math.min(showingEnd, totalCount),
    };

    jobs = (await prisma.job.findMany(queryConditions)) as JobType[];

    jobs.forEach((job) => {
      job.isSavedJob = job.savedJobs.length > 0;
      job.hasProposals = job.proposal.length > 0;
    });

    return { jobs, pageInfo };
  },
  async addJobToSavedJobs(userId: string, jobId: string) {
    try {
      const reponse = await prisma.savedJobs.create({
        data: {
          userId,
          jobId,
        },
      });
      console.log("Job added to SavedJobs successfully.");
      return reponse;
    } catch (error) {
      console.error("Error adding job to SavedJobs:", error);
    }
  },

  async removeJobFromSavedJobs(userId: string, jobId: string) {
    try {
      const response = await prisma.savedJobs.delete({
        where: {
          userId_jobId: {
            userId,
            jobId,
          },
        },
      });
      console.log("Job removed from SavedJobs successfully.");

      return response;
    } catch (error) {
      console.error("Error removing job from SavedJobs:", error);
    }
  },

  async removeJob(jobId: string) {
    try {
      const response = await prisma.job.update({
        where: {
          id: jobId,
        },
        data: { isDeleted: true },
      });
      return response;
    } catch (error) {
      console.error("Error removing job from SavedJobs:", error);
    }
  },

  async updateSaveJobStatus(request: any) {
    const { jobId, type } = request;
    const currentUser = await getCurrentUser();
    let response;
    if (type === "SAVE") {
      response = await this.addJobToSavedJobs(currentUser.id, jobId);
    } else {
      response = await this.removeJobFromSavedJobs(currentUser.id, jobId);
    }
    return response;
  },

  async addJobInvite(data: any) {
    const {
      userId,
      jobId,
      message,
    } = data;

    const currentUser = await getCurrentUser();

    try {
      const reponse = await prisma.jobInvite.create({
        data: {
          clientId: currentUser?.clientId || "",
          createdById: currentUser?.id || "",
          userId,
          jobId,
          message,
        },
      });
      return reponse;
    } catch (error) {
      console.error("Error adding job to SavedJobs:", error);
    }
  },

  async checkJobSavedStatus(jobId: string) {
    try {
      const currentUser = await getCurrentUser();

      const savedJob = await prisma.savedJobs.findFirst({
        where: {
          AND: [{ jobId: jobId }, { userId: currentUser.id }],
        },
      });
      if (savedJob) return true;
      else return false;
    } catch (err) {
      return false;
    }
  },

  async getJobRate(): Promise<any> {
    const result = await prisma.job.aggregate({
      where: {
        status: "ACTIVE",
        isPublished: true
      },
      _max: {
        hourlyMaxRate: true,
      },
      _min: {
        hourlyMinRate: true,
      },
    });

    return {
      max: result._max.hourlyMaxRate,
      min: result._min.hourlyMinRate,
    };
  },
};
