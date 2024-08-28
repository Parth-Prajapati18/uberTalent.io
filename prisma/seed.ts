import { Client, Job, PaymentMethodStatus, PrismaClient, User } from "@prisma/client";
import { hash } from "bcryptjs";
import { faker } from "@faker-js/faker";
import { getISOWeek } from "date-fns";
const prisma = new PrismaClient();

let abcClient: Client;
let jacobClient: Client;
let alice: User;
let john: User;
let jill: User;
let jacob: User;
let wilcox: User; // Password: admin@123
let goff: User; // Password: admin@123
let simon: User; // Password: admin@123

async function createUsers() {
  await prisma.user.deleteMany();
  //const password = await hash("admin", 12);
  alice = await prisma.user.create({
    data: {
      id: "d3a43d41-634e-4e95-b342-525bdb2c72f6",
      email: "alice@prisma.io",
      firstName: "Alice",
      lastName: "Ace",
      clerkId: "user_2aq01mqMeUc0nj38xfzTat8AqPo",
    },
  });
  john = await prisma.user.create({
    data: {
      id: "670795db-ec1c-44df-b8bd-5322a245ccda",
      email: "john@prisma.io",
      firstName: "John",
      lastName: "Doe",
      clerkId: "user_2b0j8ZGj4XZk5gWPb7OoEXOuzfC",
      profileImg:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?&w=256&h=256&q=60",
    },
  });
  jacob = await prisma.user.create({
    data: {
      id: "80af10d8-aae5-4e07-85b1-9e5dc881f289",
      email: "jacob@prisma.io",
      firstName: "Jacob",
      lastName: "Smith",
      clerkId: "user_2b0jhrwGnwT1dCEYqsATdPPG4go",
    },
  });
  jill = await prisma.user.create({
    data: {
      id: "0aa7b3e9-fc74-48c4-8947-8ed657de5c0d",
      email: "jill@prisma.io",
      firstName: "Jill",
      lastName: "Brown",
      clerkId: "user_2b0jll5awWegfaSjfEEeNxeP8S7",
      profileImg:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
    },
  });
  wilcox = await prisma.user.create({
    data: {
      id: "0aa7b3e9-fc74-48c4-8947-8ed657de5c0w",
      email: "wilcox@prisma.io",
      firstName: "Wilcox",
      lastName: "Chase",
      clerkId: "user_2hAi71CBYpFZul1ubIlSrshzw81",
      profileImg:"",
    },
  });
  goff = await prisma.user.create({
    data: {
      id: "0aa7b3e9-fc74-48c4-2451-8ed657de5c0w",
      email: "goff@prisma.io",
      firstName: "Goff",
      lastName: "Mason",
      clerkId: "user_2hAip1D9JvQG9i6xcuyRycTO24Z",
      profileImg:"https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?&w=256&h=256&q=60",
    },
  });
  simon = await prisma.user.create({
    data: {
      id: "0aa7b3e9-fc74-48c4-2425-8ed657de5c0w",
      email: "simon@prisma.io",
      firstName: "Simon",
      lastName: "Nunez",
      clerkId: "user_2hAizn0OpYWLEGDTisCmiqJu9Dh",
      profileImg:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?&w=256&h=256&q=60",
    },
  });

  return { alice, john, jill, jacob, wilcox, goff };
}

async function createFreelancers() {
  await prisma.freelancerProfile.deleteMany();
  await prisma.freelancerProfile.create({
    data: {
      user: {
        connect: {
          id: john.id,
        },
      },
      id: "5b20cb6d-0bfb-4cfe-8b34-dd0f7bc0f040",
      rate: 45,
      skills: ["Web & Mobile Design", "QA Testing"],
      title: "Javascript developer",
      overview: faker.lorem.words(51),
      status: "ACTIVE",
      category: ["Web Development", "Other - Software Development"],
      country: "US",
      availability: "MORE_THAN_30",
      stripe_acct_id: "acct_1PJgYfCa9UI81ub6",
    },
  });
  await prisma.freelancerProfile.create({
    data: {
      user: {
        connect: {
          id: jill.id,
        },
      },
      id: "5736e01b-1446-4ff2-82b5-4b6ee06b40a5",
      rate: 50,
      skills: ["Web & Mobile Design", "QA Testing"],
      title: "Javascript developer",
      overview: faker.lorem.words(51),
      status: "ACTIVE",
      category: ["Other - Software Development", "Web Development"],
      country: "CA",
      availability: "MORE_THAN_30",
      // stripe_acct_id: "acct_1PJgYfCa9UI81ub6",
    },
    //todo: need to change jill brown connected account to the correct one in stripe. 
  });

  await prisma.freelancerProfile.create({
    data: {
      user: {
        connect: {
          id: wilcox.id,
        },
      },
      id: "5736e01b-1446-4ff2-82b5-4b6ee06b40cv5",
      rate: 23.5,
      skills: ["Web & Mobile Design", "QA Testing"],
      title: "Javascript developer",
      overview: faker.lorem.words(25),
      status: "ACTIVE",  //was no payment
      category: ["Other - Software Development", "Web Development"],
      country: "US",
      availability: "MORE_THAN_30",
    },
  });

  await prisma.freelancerProfile.create({
    data: {
      user: {
        connect: {
          id: goff.id,
        },
      },
      id: "5736e01b-2525-4ff2-82b5-4b6ee06b40cv5",
      rate: 21.5,
      skills: ["Web & Mobile Design"],
      title: "Fronend developer",
      overview: faker.lorem.words(60),
      status: "ON_HOLD",
      category: ["Web Development"],
      country: "US",
      availability: "LESS_THAN_30",
    },
  });

  await prisma.freelancerProfile.create({
    data: {
      user: {
        connect: {
          id: simon.id,
        },
      },
      id: "5736e01b-1014-4ff2-82b5-4b6ee06b40cv5",
      rate: 25.5,
      skills: ["Web & Mobile Design"],
      title: "Fullstack Developer",
      overview: faker.lorem.words(55),
      status: "SUSPENDED",
      category: ["Web Development"],
      country: "US",
      availability: "MORE_THAN_30",
    },
  });

  const category: string[] = [
    "Accounting & Bookkeeping",
    "Financial Planning",
    "Management Consulting & Analysis",
    "Other - Accounting & Consulting",
    "Personal & Professional Coaching",
    "Recruiting & Human Resources",
    "Data Entry & Transcription Services",
    "Market Research & Product Reviews",
    "Project Management",
    "Virtual Assistance",
    "Blockchain, NFT & Cryptocurrency",
    "Desktop Application Development",
    "Ecommerce Development",
    "Game Design & Development",
    "Mobile Development",
    "Other - Software Development",
    "Product Management",
    "QA Testing",
    "Scripts & Utilities",
    "Web & Mobile Design",
    "Web Development",
  ];

  const skills: string[] = [
    "Bookkeeping",
    "Financial Reporting",
    "Tax Preparation",
    "Budgeting",
    "Business Analysis",
    "Strategic Planning",
    "Market Research",
    "Process Improvement",
    "Recruitment",
    "Employee Training",
    "Performance Management",
    "Payroll Processing",
    "Typing",
    "Spreadsheet Management",
    "Data Cleaning",
    "Email Management",
    "Calendar Management",
    "Customer Communication",
    "Task Coordination",
    "Resource Planning",
    "Project Scheduling",
    "Community Management",
    "Tech Support",
    "Web & Mobile Design",
    "QA Testing",
  ];

  //generate randon users for testing
  for (let i = 0; i < 50; i++) {
    //
    const user = await prisma.user.create({
      data: {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        //password: await hash("password", 10),
        // Add any other fields you need
      },
    });
    await prisma.freelancerProfile.create({
      data: {
        user: {
          connect: {
            id: user.id,
          },
        },
        id: faker.string.uuid(),
        rate: faker.number.int({ min: 20, max: 100 }),
        skills: [
          skills[faker.number.int({ min: 1, max: skills.length - 1 })],
          skills[faker.number.int({ min: 1, max: skills.length - 1 })],
        ],
        title: faker.person.jobTitle(),
        overview: faker.lorem.words(51),
        status: "ACTIVE",
        category: [
          category[faker.number.int({ min: 1, max: category.length - 1 })],
          category[faker.number.int({ min: 1, max: category.length - 1 })],
        ],
        country: "US",
        availability: "MORE_THAN_30",
      },
    });
  }
}

async function createJobs(creator: User) {
  const newDate = new Date();
  await prisma.job.deleteMany();
  await prisma.job.createMany({
    data: [
      {
        id: "6c953e8c-8fcf-4f3f-b233-84575acfc937",
        clientId: abcClient.id,
        title: "Front end developer",
        description:
          "We are looking for a talented react developer to join our team",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: false,
        status: "DRAFT",
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 3
        ),
        createdById: creator.id,
        hourlyMinRate: 35,
        hourlyMaxRate: 45,
      },
      {
        id: "fb122fc2-aa8b-4518-ab25-d2bd8df36f56",
        clientId: abcClient.id,
        title: "Backend developer",
        description:
          "We are looking for a talented backend developer to join our team",
        categories: ["Other - Software Development", "Web Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 2
        ),
        hourlyMinRate: 15,
        hourlyMaxRate: 25,
      },
      {
        id: "610ba85e-722a-4b46-bb71-228525be6df9",
        clientId: abcClient.id,
        title: "Full stack developer",
        description:
          "We are searching for a javascript developer with experience working with Vue.js and Express.js",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 5
        ),
        hourlyMinRate: 45,
        hourlyMaxRate: 60,
      },
      {
        id: "610ba85e-722a-4b46-bb71-228525be6gb1",
        clientId: abcClient.id,
        title: "Web3 developer",
        description:
          "We are searching for a web3 developer with experience working with Solana",
        categories: ["Web Development"],
        skills: ["Web & Mobile Design"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 5
        ),
        hourlyMinRate: 45,
        hourlyMaxRate: 60,
      },
      {
        id: "e223cc0e-8515-4505-9d47-40ca0e591cd9",
        clientId: abcClient.id,
        title: "Javascript developer",
        description: "We are searching for a javascript developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 1
        ),
        hourlyMinRate: 25,
        hourlyMaxRate: 40,
      },
      {
        id: "e223cc0e-8515-4505-9d47-40ca0e591cg4",
        clientId: abcClient.id,
        title: "Associate Javascript developer",
        description: "We are searching for an associate javascript developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 1
        ),
        hourlyMinRate: 25,
        hourlyMaxRate: 40,
      },
    ],
  });
}

async function createJobsForJacob(creator: User) {
  const newDate = new Date();
  //await prisma.job.deleteMany();
  await prisma.job.createMany({
    data: [
      //Johns jobs
      {
        id: "c4f2a2a7-8e84-455a-b513-a2a4d4903591",
        clientId: jacobClient.id,
        title: "Sr. Javascript developer",
        description: "We are looking for a senior javascript developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 7
        ),
        hourlyMinRate: 90,
        hourlyMaxRate: 120,
      },
      {
        id: "44218016-ef89-4a55-95a7-0432f6f5f038",
        clientId: jacobClient.id,
        title: "Nest.js developer",
        description: "We are looking for a Nest.js developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 8
        ),
        hourlyMinRate: 70,
        hourlyMaxRate: 90,
      },
      {
        id: "c615328b-b3bf-4a71-bc4f-9de65ba8ecf1",
        clientId: jacobClient.id,
        title: "Python developer",
        description: "We are looking for a Python developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 5
        ),
        hourlyMinRate: 30,
        hourlyMaxRate: 50,
      },
      {
        id: "6963c681-cb4f-4821-91d2-209046d281c2",
        clientId: jacobClient.id,
        title: "Java developer",
        description: "We are looking for a Java developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: false,
        status: "DRAFT",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 10
        ),
        hourlyMinRate: 15,
        hourlyMaxRate: 30,
      },
      {
        id: "7da52ec7-c67e-4eae-966f-994c94f9a05a",
        clientId: jacobClient.id,
        title: "Javascript developer",
        description: "We are looking for a junior JavaScript developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 12
        ),
        hourlyMinRate: 15,
        hourlyMaxRate: 25,
      },
      {
        id: "cea207de-2a89-443d-ace8-0f1a8a690c78",
        clientId: jacobClient.id,
        title: "Angular developer",
        description: "We are looking for a senior Angular developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: false,
        status: "DRAFT",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 4
        ),
        hourlyMinRate: 75,
        hourlyMaxRate: 90,
      },
      {
        id: "128d4f54-c9d3-4b59-b602-5df0ae461005",
        clientId: jacobClient.id,
        title: ".Net developer",
        description: "We are looking for a senior .Net developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: false,
        status: "DRAFT",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 3
        ),
        hourlyMinRate: 120,
        hourlyMaxRate: 150,
      },
      {
        id: "57358ff2-c939-4f3d-a4fe-746c52f69d7e",
        clientId: jacobClient.id,
        title: "React developer",
        description: "We are looking for a React developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 9
        ),
        hourlyMinRate: 30,
        hourlyMaxRate: 50,
      },
      {
        id: "7163c517-3593-4e54-b476-b3af15ae4f2c",
        clientId: jacobClient.id,
        title: "Express.js developer",
        description: "We are looking for an Express.js developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 1
        ),
        hourlyMinRate: 20,
        hourlyMaxRate: 40,
      },
      {
        id: "0cb46673-9bed-4f1f-bb1a-001e1451d7cd",
        clientId: jacobClient.id,
        title: "Nest.js developer",
        description: "We are looking for a senior Nest.js developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 10
        ),
        hourlyMinRate: 25,
        hourlyMaxRate: 40,
      },
      {
        id: "9a1434a5-4d4d-4853-ba1c-b769c4235cbd",
        clientId: jacobClient.id,
        title: "React JS developer",
        description: "We are looking for a senior React js developer ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 5
        ),
        hourlyMinRate: 30,
        hourlyMaxRate: 45,
      },
      {
        id: "18fedc4c-368f-4234-bc28-adb1ba09a5c6",
        clientId: jacobClient.id,
        title: "JavaScript / TypeScript developer",
        description:
          "We are looking for a JavaScript and TypeScript developer for our full stack project ",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 8
        ),
        hourlyMinRate: 30,
        hourlyMaxRate: 45,
      },
      {
        id: "3aafe0a4-e548-4813-aba2-9381b3412e09",
        clientId: jacobClient.id,
        title: "Vue.js developer",
        description: "We are looking for a Vue.js developer",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 2
        ),
        hourlyMinRate: 30,
        hourlyMaxRate: 45,
      },
      {
        id: "a3cf6daf-bf47-479c-9d49-acc0830ec76b",
        clientId: jacobClient.id,
        title: "Node.js developer",
        description: "We are looking for a Node.js developer",
        categories: ["Web Development", "Mobile Development"],
        skills: ["Web & Mobile Design", "QA Testing"],
        duration: "ONE_TO_THREE_MONTHS",
        compType: "HOURLY",
        isPublished: true,
        status: "ACTIVE",
        createdById: creator.id,
        createdAt: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate() - 20
        ),
        hourlyMinRate: 80,
        hourlyMaxRate: 100,
      },
    ],
  });
}

async function createProposals(employeeA: User, employeeB: User, jobs: Job[]) {
  await prisma.proposal.deleteMany();
  await prisma.proposal.createMany({
    data: [
      {
        id: "a4c222e8-f279-4218-83f1-45bbf44d5143",
        userId: employeeA.id,
        jobId: jobs[1].id,
        coverLeter: "Proposal cover letter for job. Status is shortlisted",
        rate: 50,
        status: "SHORT_LISTED",
      },
      {
        id: "35968b03-0d9f-40ba-ae74-042ff02a666b",
        userId: employeeA.id,
        jobId: jobs[3].id,
        coverLeter: "Proposal cover letter for job. Status is submitted",
        rate: 35,
        status: "SUBMITTED",
      },
      {
        id: "6447f9d2-dd29-4cfe-ad5c-58de99a95aa4",
        userId: employeeB.id,
        jobId: "fb122fc2-aa8b-4518-ab25-d2bd8df36f56",
        coverLeter: "Proposal cover letter for job. Status is submitted",
        rate: 15,
        status: "OFFER",
      },
      {
        id: "e1aef6c6-5cb3-4aeb-be9a-e01b0e0411bc",
        userId: employeeB.id,
        jobId: jobs[2].id,
        coverLeter: "Proposal cover letter for job. Status is under review",
        rate: 38,
        status: "SUBMITTED",
      },
      {
        id: "6c7bde7a-e0e7-4571-94b9-471fbc908b35",
        userId: employeeB.id,
        jobId: jobs[4].id,
        coverLeter: "proposal cover letter for job. Status is submitted",
        rate: 3000,
        status: "SUBMITTED",
      },
    ],
  });
}

async function createSavedJobs(employee: User, jobs: Job[]) {
  await prisma.savedJobs.deleteMany();
  await prisma.savedJobs.createMany({
    data: [
      {
        id: "c9fe8c15-86d9-4af8-bd04-4938a18c5692",
        userId: employee.id,
        jobId: "9a1434a5-4d4d-4853-ba1c-b769c4235cbd",
      },
      {
        id: "fe32fc8d-dff8-4456-b317-d7fa0f64962f",
        userId: employee.id,
        jobId: "18fedc4c-368f-4234-bc28-adb1ba09a5c6",
      },
      {
        id: "0912f5ed-b3fe-41b1-b00d-bbfdb671684c",
        userId: employee.id,
        jobId: "3aafe0a4-e548-4813-aba2-9381b3412e09",
      },
      {
        id: "680e4354-f979-4bce-97ca-f41f4d160ef2",
        userId: employee.id,
        jobId: "a3cf6daf-bf47-479c-9d49-acc0830ec76b",
      },
    ],
  });
}

async function createClients() {
  await prisma.client.deleteMany();
  abcClient = await prisma.client.create({
    data: {
      id: "31723125-3510-4191-b479-3255ce42403e",
      companyName: "ABC company",
      industry: "Tech",
      user: {
        connect: {
          id: alice.id,
        },
      },
      country: "US",
      stripe_customer_id: "cus_Q9LbI1abyKkCWq",
      paymentMethodStatus:  PaymentMethodStatus.VALID
    },
  });

  jacobClient = await prisma.client.create({
    data: {
      id: "31723125-3510-4191-b479-3255ce42403f",
      companyName: "Jacob Motors",
      industry: "Tech",
      user: {
        connect: {
          id: jacob.id,
        },
      },
      country: "US",
      stripe_customer_id: "cus_QSlknC27YOEU64",
      paymentMethodStatus: PaymentMethodStatus.VALID,
    },
  });

  //return client;
}

async function createContracts() {
  await prisma.contract.deleteMany();
  await prisma.contract.createMany({
    data: [
      {
        id: "d5bfb81c-b5d2-4f10-88a2-9f386746c57f",
        freelancerId: jill.id,
        jobId: "fb122fc2-aa8b-4518-ab25-d2bd8df36f56",
        type: "HOURLY",
        rate: 15,
        status: "ACTIVE",
        startDate: "2023-12-16T01:29:50.856Z",
        weeklyLimit: 40,
        clientId: abcClient.id,
        title: "Backend developer",
      },
      {
        id: "a3e8799c-dfb2-42d7-808a-5a5ceaa46fae",
        freelancerId: john.id,
        jobId: "7163c517-3593-4e54-b476-b3af15ae4f2c",
        type: "HOURLY",
        rate: 20,
        status: "ACTIVE",
        startDate: "2023-12-16T01:29:50.856Z",
        weeklyLimit: 25,
        clientId: jacobClient.id,
        title: "Express.js developer",
      },
    ],
  });
}

async function createTimesheets() {
  await prisma.timesheet.deleteMany();
  
  const date = new Date();

  const oneMondaysAgo = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
  const mondayDate1 = new Date(oneMondaysAgo.setDate(oneMondaysAgo.getDate() - oneMondaysAgo.getDay() + (oneMondaysAgo.getDay() === 0 ? -7 : 1)));

  const twoMondaysAgo = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 14);
  const mondayDate2 = new Date(twoMondaysAgo.setDate(twoMondaysAgo.getDate() - twoMondaysAgo.getDay() + (twoMondaysAgo.getDay() === 0 ? -7 : 1)));

  await prisma.timesheet.create({
    data: {
      id: "d5bfb81c-b5d2-4f10-99a2-9f386746c57f",
      contractId: "a3e8799c-dfb2-42d7-808a-5a5ceaa46fae",
      weekStart: mondayDate1,
      weekNumber: getISOWeek(mondayDate1),
      status: "PENDING",
      totalWeekHours: 20,
      userId: john.id,
      mondayHours: 5,
      tuesdayHours: 5,
      wednesdayHours: 0,
      thursdayHours: 0,
      fridayHours: 5,
      saturdayHours: 5,
      sundayHours: 0,
      rate: 20
    },
  });

  await prisma.timesheet.create({
    data: {
      id: "d5bfb81c-b5d2-4f10-99a2-9f386746c58f",
      contractId: "a3e8799c-dfb2-42d7-808a-5a5ceaa46fae",
      weekStart: mondayDate2,
      weekNumber: getISOWeek(mondayDate2),
      status: "PENDING",
      totalWeekHours: 10,
      userId: john.id,
      mondayHours: 2,
      tuesdayHours: 2,
      wednesdayHours: 2,
      thursdayHours: 2,
      fridayHours: 2,
      saturdayHours: 0,
      sundayHours: 0,
      rate: 20
    },
  });

  await prisma.timesheet.create({
    data: {
      id: "d5bfb81c-b5d2-4f10-3333-9f386746c57f",
      contractId: "d5bfb81c-b5d2-4f10-88a2-9f386746c57f",
      weekStart: mondayDate1,
      weekNumber: getISOWeek(mondayDate1),
      status: "PENDING",
      totalWeekHours: 40,
      userId: jill.id,
      mondayHours: 8,
      tuesdayHours: 8,
      wednesdayHours: 8,
      thursdayHours: 6,
      fridayHours: 10,
      saturdayHours: 0,
      sundayHours: 0,
      rate: 15
    },
  });

  await prisma.timesheet.create({
    data: {
      id: "d5bfb81c-b5d2-4f10-4444-9f386746c58f",
      contractId: "d5bfb81c-b5d2-4f10-88a2-9f386746c57f",
      weekStart: mondayDate2,
      weekNumber: getISOWeek(mondayDate2),
      status: "APPROVED",
      totalWeekHours: 40,
      userId: jill.id,
      mondayHours: 10,
      tuesdayHours: 9,
      wednesdayHours: 10,
      thursdayHours: 9,
      fridayHours: 2,
      saturdayHours: 0,
      sundayHours: 0,
      isPaid: true,
      rate: 15
    },
  });
}

async function createPortfolio() {
  // Remove all portfolio and it's content/media
  await prisma.portfolio.deleteMany();
  await prisma.portfolioContent.deleteMany();

  // Portfolio 1
  await prisma.portfolio.create({
    data: {
      id: "d12443a2-c833-48c2-baf6-2cedd8276640",
      title: "UberTalent",
      description:
        "UberTalent is the simple solution to hire, manage, and pay talent around the world.",
      url: "https://www.ubertalent.io/",
      skills: [
        "React",
        "Next.js",
        "Database Management",
        "HTML",
        "CSS",
        "Tailwind CSS",
      ],
      createdAt: new Date(),
      freelancerId: "5b20cb6d-0bfb-4cfe-8b34-dd0f7bc0f040",
    },
  });

  await prisma.portfolioContent.createMany({
    data: [
      {
        id: "5fc5d535-b41d-43f9-bf95-3700be067964",
        type: "IMAGE",
        content:
          "https://ha0zvfuhxvqxvltz.public.blob.vercel-storage.com/portfolio/ut1-ne9zQaf58HkX8T8GOZYLhRUYZVRjPl.png",
        portfolioId: "d12443a2-c833-48c2-baf6-2cedd8276640",
      },
      {
        id: "374ae3bc-b24d-4a98-b67d-3d2c8319d35c",
        type: "IMAGE",
        content:
          "https://ha0zvfuhxvqxvltz.public.blob.vercel-storage.com/portfolio/ut2-ab5JTyQQAQfsTY9Hi6mkOMNAp90cA8.png",
        portfolioId: "d12443a2-c833-48c2-baf6-2cedd8276640",
      },
      {
        id: "02b8fce1-82d3-4a10-84e7-0c85b9bd9aca",
        type: "IMAGE",
        content:
          "https://ha0zvfuhxvqxvltz.public.blob.vercel-storage.com/portfolio/ut3-2zGrynooqlocseVzEj7yT8INZ1xCVC.png",
        portfolioId: "d12443a2-c833-48c2-baf6-2cedd8276640",
      },
    ],
  });

  // Portfolio 2
  await prisma.portfolio.create({
    data: {
      id: "df37d29a-3603-4cca-b244-4307d324fe4e",
      title: "Ecommerce",
      description:
        "E-commerce is the activity of electronically buying or selling products on online services or over the Internet.",
      url: "https://www.google.com/",
      skills: [
        "Angular",
        "Node.js",
        "Express.js",
        "SQL",
        "Bootstrap",
        "HTML",
        "CSS",
        "TypeScript",
      ],
      createdAt: new Date(),
      freelancerId: "5b20cb6d-0bfb-4cfe-8b34-dd0f7bc0f040",
    },
  });

  await prisma.portfolioContent.createMany({
    data: [
      {
        id: "f7ca4fb2-5b71-4386-a9ca-6798a8eb986e",
        type: "IMAGE",
        content:
          "https://ha0zvfuhxvqxvltz.public.blob.vercel-storage.com/portfolio/ecommerce-d7e19a12ebed400eb1b2344b2cbb0e7d-RhEKUt5BMHDAMKlLx2aoyat9gcQ2GP.png",
        portfolioId: "df37d29a-3603-4cca-b244-4307d324fe4e",
      },
      {
        id: "dc7add93-9ade-4655-9d9c-48741af8ae10",
        type: "IMAGE",
        content:
          "https://ha0zvfuhxvqxvltz.public.blob.vercel-storage.com/portfolio/What_is_an_E-commerce_business-RQiwTPLrGYXLmTF8ICnRXUx1zkgURL.jpg",
        portfolioId: "df37d29a-3603-4cca-b244-4307d324fe4e",
      },
      {
        id: "3e649852-7293-4428-bc36-b811e60720fc",
        type: "PDF",
        content:
          "https://ha0zvfuhxvqxvltz.public.blob.vercel-storage.com/portfolio/dummy-CIa6Oqd6i8GzaCYqiGU0OgIy2nsi1t.pdf",
        portfolioId: "df37d29a-3603-4cca-b244-4307d324fe4e",
      },
    ],
  });
}

async function main() {
  // Creating users
  const users = await createUsers();
  // const { alice, john, jill, jacob } = users;

  // Creating freelancer profiles
  await createFreelancers();

  // Creating Clients
  await createClients();

  // Creating jobs
  await createJobs(alice);
  await createJobsForJacob(jacob);

  // Getting jobs for future DB interactions
  const jobs = await prisma.job.findMany();

  // Creating proposals
  await createProposals(john, jill, jobs);

  // Creating saved jobs
  await createSavedJobs(john, jobs);

  // Creating contracts
  await createContracts();

  await createTimesheets();

  // Creating Freelancer Portfoilo
  await createPortfolio();
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
