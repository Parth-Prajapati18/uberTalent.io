import { prisma } from "../lib/prisma";
import { Client, JobCompType, User } from "@prisma/client";
import { getCurrentUser } from "../lib/session";
import { mailService } from "./mailService";

export const clientService = {
  async updateClientProfile(data: any): Promise<Client> {
    const { id, industry, companyName } = data;

    const updatedClientProfile = await prisma.client.update({
      where: {
        id: id,
      },
      data: {
        industry: industry,
        companyName: companyName,
        // companyLogo: companyLogo
      },
    });

    return updatedClientProfile;
  },

  async onboardClient(data: any): Promise<User> {
    const { firstName, lastName, companyName, industry, country } = data;
    const currentUser = await getCurrentUser();

    const newClient = await prisma.client.create({
      data: {
        user: {
          connect: {
            id: currentUser.id,
          },
        },
        companyName,
        industry,
        country,
      },
    });
    // Update the user with the new client
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        firstName,
        lastName,
        client: {
          connect: { id: newClient.id },
        },
      },
    });

    return updatedUser;
  },

  async updateClientStripeId(data: any): Promise<Client> {
    const { id, stripe_customer_id } = data;

    const updatedClientProfile = await prisma.client.update({
      where: {
        id: id,
      },
      data: {
        stripe_customer_id: stripe_customer_id,
      },
    });

    return updatedClientProfile;
  },

  async sendNewJobNotification(job: any): Promise<any> {
    const currentUser = await getCurrentUser();
    const payload = {
      to: currentUser.email,
      from: "UberTalent<support@ubertalent.io>",
      subject: `Your Job Listing on UberTalent: ${job.title}`,
      html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
              <tr>
                  <td style="padding: 20px;">
                      <h1 style="color: #333333; text-align: center;">Job Posted!</h1>
                      <p style="color: #333333;">Hi ${currentUser.firstName},</p>
                      <p style="color: #333333;">We're excited to inform you that your job listing titled \"${job.title}\" has been successfully posted on UberTalent. This means that talented freelancers from our community can now view and apply to work on your project!</p>
                      <p style="color: #666666;">Job Details:</p>
                      <p style="color: #333333;"><strong>Job Title: </strong> ${job.title}</p>
                      <p style="color: #333333;white-space: pre-wrap;"><strong>Job Description: </strong> ${job.description}</p>
                      <p style="color: #333333;"><strong>Compensation: </strong> $${job.hourlyMinRate}-${job.hourlyMaxRate}</p>
                      <p style="color: #333333; text-align: center; margin: 30px;"><a href=""${process.env.NEXT_PUBLIC_API_ENDPOINT}/client-dashboard/freelancer/search" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Find Talent</a></p>
                      <p style="color: #333333;">Best regards,<br>The UberTalent Team</p>
                  </td>
              </tr>
          </table>
      
      </body>`,
    };

    await mailService.sendMail(payload);
  },

  async getRecommendedFreelancers(): Promise<any> {
    console.log('recommenderFreelancers');
    const currentUser = await getCurrentUser();
    const where: any = {
      status: { in: ["ACTIVE", "DRAFT"] },
      clientId: currentUser.client!.id,
      isDeleted: false,
    };

    const jobs: any = await prisma.job.findMany({
      where,
      include: {
        proposal: true,
      },
    });
    const uSkills: any = new Set(jobs.flatMap((item: any) => item.skills));
    const uniqueSkills = [...uSkills];

    const uCategories: any = new Set(
      jobs.flatMap((item: any) => item.categories)
    );
    const uniqueCategories = [...uCategories];

    const pageNo = 1;
    const perPage = 4;
    const featuredIds = [
      "fb8e1b21-b456-4164-a991-9887d4e2ab41", // Nicolas
      "ebd15e74-8977-4dcf-a82c-eafadef553c6", // Kaitlin
      "40c5cc93-0167-480c-9343-77aa2942243f", // Lekan
      "d98a4833-de3c-4a2b-bc39-acb5f39a88b7", // Ethan
    ];
    const queryConditions: any = {
      where: {
        user: { id: { in: featuredIds }},
        status: { in: ["ACTIVE"] },
        //isPrivate: false,
        // skills: { hasSome: uniqueSkills },
        // category: { hasSome: uniqueCategories }
      },
      include: {
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

    let freelancers: any = await prisma.freelancerProfile.findMany(
      queryConditions
    );
    if (freelancers.length === 0) {
      queryConditions.where = {
        status: { in: ["ACTIVE"] },
        isPrivate: false,
        skills: { hasSome: uniqueSkills },
        category: { hasSome: uniqueCategories }
      };
      console.log('recommending freelancers based on skills and categories');
      freelancers = await prisma.freelancerProfile.findMany(queryConditions);
    }
    
    //console.log('recommended freelancers', freelancers);
    return { jobs, freelancers };
  },
};
