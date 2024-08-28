import { NextResponse } from "next/server";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/session";
import { FreelancerProfile, FreelancerStatus, User } from "@prisma/client";
import { SummaryDbresponse , SummaryResponse, FreelancerJobsType} from "../types";
import { FreelancerTypeExtended } from "../schema/FreelancerOnboardingSchema";
import { orderBy, sum } from "lodash";
import { getISOWeek } from "date-fns";
import { mailService } from "./mailService";
import { currentUser } from "@clerk/nextjs/dist/types/server";
import { env } from "process";
import { LanguageProficiency } from "@prisma/client";

export const freelancerService = {
  async unsaveJob(jobId: string) {
    try {
      const currentUser = await getCurrentUser();

      await prisma.savedJobs.delete({
        where: {
          userId_jobId: {
            userId: currentUser.id,
            jobId,
          },
        },
      });
      return NextResponse.json({ error: false }, { status: 200 });
    } catch (err) {
      console.log(err);
      return NextResponse.json({ error: true }, { status: 500 });
    }
  },
  async updateFreelacerProfile(data: any): Promise<FreelancerProfile> {
    const {
      id,
      hourlyRate,
      hoursPerWeek,
      profileSummary,
      skills,
      title,
      category,
    } = data;

    const currentUser = await getCurrentUser();

    let languages: {id: string, language: string, proficiency: LanguageProficiency, freelancerId: string }[] = [];

    // create, update or delete languages
    const dataLangs = [...data.languages];

    const savedLanguages = await prisma.language.findMany({
      where: {
        freelancerId: currentUser.freelancerProfile?.id,
      },
    });

    if (dataLangs.length > 0) {
      // get new languages
      const newLanguages = dataLangs.filter((lang) => {
        return lang.id === '' || lang.id === null
      });

      
      // save new languages
      if (newLanguages.length > 0 ) {
        newLanguages.forEach(async (nl) => {
          const lang = await prisma.language.create({
            data: {
              language: nl.language,
              proficiency: nl.proficiency,
              freelancer: {
                connect: {
                  id: currentUser.freelancerProfile?.id,
                },
              },
            },
          });
          languages.push(lang);
        });
      }
  
      const languagesToUpdate = dataLangs.filter((l) => savedLanguages.some((sl) => sl.id === l.id));

      if (languagesToUpdate.length > 0) {
        languagesToUpdate.forEach(async (ltu) => {
          const lang = await prisma.language.update({
            where: { id: ltu.id },
            data: {
              language: ltu.language,
              proficiency: ltu.proficiency,
              freelancer: {
                connect: {
                  id: currentUser.freelancerProfile?.id,
                },
              },
            },
          });
          languages.push(lang);
        });
      }
    }
    const languagesToDelete = savedLanguages.filter((sl) => !dataLangs.some((lang) => lang.id === sl.id));

      if (languagesToDelete.length > 0) {
        languagesToDelete.forEach(async (ltu) => await prisma.language.delete({
          where: { id: ltu.id },
        }));
      }

    const updatedFreelancerProfile = await prisma.freelancerProfile.update({
      where: {
        id: id,
      },
      data: {
        rate: parseInt(hourlyRate),
        skills: skills,
        title: title,
        overview: profileSummary,
        availability: hoursPerWeek,
        category: category,
      },
      include: {
        languages: true,
      },
    });

    updatedFreelancerProfile.languages = [...languages]
    
    return updatedFreelancerProfile;
  },

  async onboardFreelancer(data: any): Promise<User> {
    const {
      firstName,
      lastName,
      categories,
      skills,
      country,
      hourlyRate,
      hoursPerWeek,
      title,
      profileSummary,
    } = data;
    const currentUser = await getCurrentUser();

    const newFreelancerProfile = await prisma.freelancerProfile.create({
      data: {
        user: {
          connect: {
            id: currentUser.id,
          },
        },
        rate: parseInt(hourlyRate),
        skills: skills,
        title: title,
        overview: profileSummary,
        country: country,
        category: categories,
        availability: hoursPerWeek,
        status: "ACTIVE"
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName,
        lastName,
        freelancerProfile: {
          connect: {
            id: newFreelancerProfile.id,
          },
        },
      },
    });

    return updatedUser;
  },

  async getSummary(userId: string): Promise<SummaryResponse> {

    const summary = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        _count: {
          select: {
            contract: {
              where: {
                status: "ACTIVE",
              },
            },
          },
        },
      },
    });

    // Calculate hours worked in the last 30 days
    const hoursWorked = await prisma.timesheet.aggregate({
      _sum: {
        totalWeekHours: true,
      },
      where: {
        userId: userId,
        weekStart: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    // Convert Decimal to number
    const hoursWorkedNumber = hoursWorked._sum.totalWeekHours ? Number(hoursWorked._sum.totalWeekHours) : 0;
    
    const localWeekStart = new Date(new Date().setDate(new Date().getDate() - 30));
    const utcDate = new Date(localWeekStart.getUTCFullYear(), localWeekStart.getUTCMonth(), localWeekStart.getUTCDate(), 0, 0, 0, 0);
    const weekNumber = getISOWeek(utcDate);
    
    const earnignsByContract = await prisma.$queryRaw`SELECT c.id, SUM(t.total_week_hours) as totalWeekHours, c.rate  FROM contract c
      INNER JOIN timesheet t
      ON c.id = t.contract_id
      WHERE
      c.freelancer_id = ${userId}
      AND "week_number" >= ${weekNumber}
      GROUP BY c.id
      `;

    const resp: SummaryResponse = {
      activeContracts: summary ? summary._count.contract : 0,
      hoursWorked: hoursWorkedNumber,
      // earnings: earnings._sum.amount ? earnings._sum.amount : 0,
      earnings:
        earnignsByContract && Array.isArray(earnignsByContract)
          ? earnignsByContract
              ?.map(({ rate, totalweekhours }) => rate * totalweekhours)
              ?.reduce((a, b) => (a += b), 0)
          : 0,
    };
    return resp;
  },

  async getEarningSummary(contractId: string): Promise<any> {

    const currentUser = await getCurrentUser();

    const query = `
        SELECT
          SUM(CASE WHEN is_paid THEN total_week_hours * rate ELSE 0 END) AS paid,
          SUM(CASE WHEN NOT is_paid THEN total_week_hours * rate ELSE 0 END) AS toBePaid,
          SUM(total_week_hours) AS totalHours
        FROM timesheet
        WHERE contract_id = $1 AND user_id = $2
      `;

    const result: any = await prisma.$queryRawUnsafe(query, contractId, currentUser.id);
    const { totalhours, paid, tobepaid } = result[0];

    return { totalHours: Number(totalhours), paid: Number(paid), toBePaid: Number(tobepaid) };
  },

  async submitProposal(data: any) {
    const { coverLeter, jobId, rate, attachments } = data;
    const currentUser = await getCurrentUser();
    const job = await prisma.job.findUnique({
      where: {
          id: jobId,
      },
    });

    if (!job || job.status !== "ACTIVE") {
        console.log("job not active can't create proposal", job);
        //todo: this error message doen't surface in teh api response nor is it logged to conole !!!
        //todo:  all api errors needs to be reviewed and fixed with proper logging and response pattern. 
        throw new Error("Only active jobs are allowed to submit proposal.");
    }
    const proposal = await prisma.proposal.create({
      data: {
        user: {
          connect: {
            id: currentUser.id,
          },
        },
        job: {
          connect: {
            id: jobId,
          },
        },
        rate,
        status: "SUBMITTED",  // TODO: COnfirm if setting SUBMITTED as default is correct
        coverLeter,
        attachments,
      },
      include: {
        job: {
          include: {
            createdBy: true,
          },
        },
      },
    });

    console.log("proposal", proposal);
    return proposal;
  },

  async getFreelancers(searchQuery: string, pageNo: number, perPage: number, categories: string, countries: string, hourlyRate: string, availability: string, sort: string) {

    const queryConditions: any = {
      where: { status: {in: ["ACTIVE"]}, isPrivate: false },
      include: {
        languages: true,
        user: {
          include: {
            contract: true,
            jobInvites: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: (pageNo - 1) * perPage,
      take: perPage,
    };

    if (searchQuery) {
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" } },
            { overview: { contains: searchQuery, mode: "insensitive" } },
            { skills: { hasSome: [searchQuery] } },
            { category: { hasSome: [searchQuery] } }
          ]
        }
      }
    }

    if(categories) {
      const catArr = categories.split(",");
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          category: { hasSome: catArr }
        }
      }
    }

    if(countries) {
      const coArr = countries.split(","); 
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          country: { in: coArr }
        }
      }
    }

    if(availability) {
      const avArr = availability.split(","); 
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          availability: { in: avArr }
        }
      }
    }

    if(sort === "rateasc") {
      queryConditions.orderBy = { rate: "asc" }
    }

    if(sort === "ratedesc") {
      queryConditions.orderBy = { rate: "desc" }
    }

    if(hourlyRate) {
      const hrArr = hourlyRate.split(",");
      queryConditions.where = {
        ...queryConditions.where,
        ...{
          AND: [{ rate: { gte: parseInt(hrArr[0]) } }, { rate: { lte: parseInt(hrArr[1]) } }],
        }
      }
    }

    const totalCount = await prisma.freelancerProfile.count({ where: queryConditions.where });

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

    const freelancers: any = await prisma.freelancerProfile.findMany(queryConditions);

    const data = freelancers.map((item: { user: { id: string, firstName: string; lastName: string; email: string; profileImg: string; jobInvites: { clientId: string }[]; contract: any;}; country: string; title: string; overview: string; category: string; skills: string; rate: number; availability: string; languages: any; }) => ({
      userId: item.user.id,
      firstName: item.user.firstName,
      lastName: item.user.lastName,
      country: item.country,
      title: item.title,
      profileSummary: item.overview,
      categories: item.category,
      skills: item.skills,
      languages: item.languages,
      hourlyRate: item.rate,
      hoursPerWeek: item.availability,
      email: item.user.email,
      jobInvites: [...item.user.jobInvites],
      contract: [...item.user.contract],
      imageUrl: item.user.profileImg || null
    }));

    // Return the formatted freelancers array
    return {data, pageInfo};
  },

  async getFreelancerByEmail(email: string) {

    const queryConditions: any = {
      where: { 
        status: {in: ["ACTIVE"]}, 
        isPrivate: false,
        user: {
          email
        }
      },
      include: {
        user: true,
      }
    };

    const freelancer: any = await prisma.freelancerProfile.findFirst(queryConditions);

    const data = {
      userId: freelancer.user.id,
      firstName: freelancer.user.firstName,
      lastName: freelancer.user.lastName,
      country: freelancer.country,
      title: freelancer.title,
      profileSummary: freelancer.overview,
      categories: freelancer.category,
      skills: freelancer.skills,
      hourlyRate: freelancer.rate,
      hoursPerWeek: freelancer.availability,
      email: freelancer.user.email,
      jobInvites: [],
      contract: [],
      imageUrl: freelancer.user.profileImg || null
    };

    // Return the formatted freelancers array
    return {data};
  },

  async getFreelancerJobs(userId: string): Promise<FreelancerJobsType> {
    const savedJobs = await prisma.savedJobs.findMany({
      where: {
        userId: userId,
        job: {
          status: "ACTIVE",
          isPublished: true,
          proposal: {
            none: {
              userId: userId
            },
          },
        },
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

    const savedJobsCount = await prisma.savedJobs.count({
      where: {
        userId: userId,
        job: {
          status: "ACTIVE",
          isPublished: true,
          proposal: {
            none: {
              userId: userId
            },
          },
        },
      }
    })

    const contracts = await prisma.contract.findMany({
      where: {
        freelancerId: userId,
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
        proposal: true,
        client: {
          select: {
            companyName: true,
            user: {
              select: {
                email: true,
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

    const offerCount = await prisma.contract.count({
      where: {
        freelancerId: userId,
        status: {in: ["PENDING", "REJECTED"]}
      }
    });

    const ActiveOfferCount = await prisma.contract.count({
      where: {
        freelancerId: userId,
        status: {in: ["PENDING"]}
      }
    });

    const contractCount = await prisma.contract.count({
      where: {
        freelancerId: userId,
        status: {in: ["ACTIVE", "COMPLETED"]}
      }
    });

    const contractStatusCount = await prisma.contract.groupBy({
      where: {
        freelancerId: userId,
      },
      by: ["status"],
      _count: {
        status: true
      }
    });

    const proposals = await prisma.proposal.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: true,
        job: {
          include: {
            createdBy: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    const proposalCount = await prisma.proposal.count({
      where: {
        userId: userId,
        status: {in: ["SUBMITTED", "SHORT_LISTED", "DISQUALIFIED", "WITHDRAWN"]}
      }
    });

    const proposalStatusCount = await prisma.proposal.groupBy({
      where: {
        userId: userId,
      },
      by: ["status"],
      _count: {
        status: true
      }
    });

    const result: FreelancerJobsType = {
      savedJobs: savedJobs,
      contract: contracts,
      proposal: proposals,
      totalCount: {SavedJobs: savedJobsCount, Proposals: proposalCount, Offers: offerCount, ActiveOffers: ActiveOfferCount, Contracts: contractCount},
      proposalCount: proposalStatusCount?.reduce((acc: any, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + item?._count?.status;
        return acc;
      }, {}),
      contractCount: contractStatusCount?.reduce((acc: any, item: any) => {
        acc[item.status] = (acc[item.status] || 0) + item?._count?.status;
        return acc;
      }, {})
    };

    return result;
  },

  async updateFreelancerStripeAcctId(data: any): Promise<FreelancerProfile> {
    const { id, stripe_acct_id } = data;

    const updatedfreelancerProfile = await prisma.freelancerProfile.update({
      where: {
        id: id,
      },
      data: {
        stripe_acct_id: stripe_acct_id,
      },
    });

    return updatedfreelancerProfile;
  },

  async getFreelancerRate(): Promise<any> {
    const result = await prisma.freelancerProfile.aggregate({
      _max: {
        rate: true,
      },
      _min: {
        rate: true,
      },
    });

    return {
      max: result._max.rate,
      min: result._min.rate,
    };
  },

  async sendNewJobNotification(job: any): Promise<any> {
    console.log("Sending new job notification");
    if (process.env.NEXT_PUBLIC_NEW_JOB_WEBHOOK_ENABLED === "true") {
      try {
        const response = await fetch(
          "https://hook.us1.make.com/dd6f1tneox662doz87xbun7dgkdfj8ee",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(job),
          }
        );
        if (response.ok) {
          console.log("Make.com Job notification sent successfully");
        } else {
          console.error("Make.com Failed to send job notification");
        }
      } catch (error) {
        console.error("Make.com Failed to send job notification", error);
      }
    }

    const queryConditions = {
      where: {
        category: { hasSome: job.categories || [] },
        status: FreelancerStatus.ACTIVE,
      },
      include: {
        user: true,
      },
    };
    const freelancers: any = await prisma.freelancerProfile.findMany(
      queryConditions
    );
    
    console.log('new job nofitication freelancer count:', freelancers.length);

    for (const freelancer of freelancers) {

      const email = {
          to: freelancer.user.email,
          from: "UberTalent<support@ubertalent.io>",
          subject: `New Job for you on UberTalent`,
          html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                <tr>
                  <td style="padding: 20px;">
                    <h1 style="color: #333333; text-align: center;">New Job for you on UberTalent</h1>
                    <p style="color: #333333;">Hi ${freelancer.user.firstName} ${freelancer.user.lastName},</p>
                    <p style="color: #333333;">A new job has been posted that we think you would be interested in. </p>
                    <p style="color: #666666;">Job Details:</p>
                    <p style="color: #333333;"><strong>${job.title} - ($${job.hourlyMinRate}-${job.hourlyMaxRate})</strong></p>
                    <p style="color: #333333;white-space: pre-wrap;">${job.description}</p>
                    <p style="color: #333333; text-align: center; margin: 30px;">
                      <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/search?jobId=${job.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Check it out</a>
                    </p>
                    <p style="color: #333333;">Best regards,<br>The UberTalent Team</p>
                  </td>
                </tr>
              </table>
          </body>`,
      }

      await mailService.sendMail(email); // Send each email individually
      await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate processing time (optional)

    }


  },

  async createPortfolio(data: any) {
    return await prisma.portfolio.create({
      data: {
        ...data,
        content: {
          create: data.content.map((content: any) => ({
            type: content.type,
            content: content.content,
          })),
        },
      },
    });
  },

  async getPortfolio(userId: string) {
    const currentUser = await getCurrentUser();
    return await prisma.portfolio.findMany({
      where: {
        freelancerProfile: {
          userId: userId ? userId : currentUser.id
        }
      },
      include: {
        content: true
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async getPortfolioById(id: string) {
    const currentUser = await getCurrentUser();
    return await prisma.portfolio.findUnique({
      where: {
        id,
        freelancerProfile: {
          userId: currentUser.id
        }
      },
      include: {
        content: true
      }
    });
  },

  async updatePortfolio(
    id: string,
    data: any) {
    const currentUser = await getCurrentUser();
    return await prisma.portfolio.update({
      where: {
        id,
        freelancerProfile: {
          userId: currentUser.id
        }
      },
      data: {
        ...data,
        content: {
          deleteMany: {}, // Deletes all existing content
          create: data.content.map((content: any) => ({
            type: content.type,
            content: content.content,
          })),
        },
      },
    });
  },

  async deletePortfolio(id: string) {
    const currentUser = await getCurrentUser();

    return await prisma.portfolio.delete({
      where: {
        id,
        freelancerProfile: {
          userId: currentUser.id
        }
      }
    });
  },
};
