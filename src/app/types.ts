import {
  ContractStatus,
  Job,
  Client,
  JobCompType,
  Prisma,
  SavedJobs,
  PrismaClient,
  FreelancerProfile,
} from "@prisma/client";
import { CreateContractType } from "./schema/CreateContractSchema";
import { User } from "@twilio/conversations";


const userType = {
  include: {
    client: true,
    freelancerProfile: {
      include: {
        languages: true,
      },
    },
    jobCreatedBy: true,
  },
} satisfies Prisma.UserDefaultArgs;
export type UserType = Prisma.UserGetPayload<typeof userType>;

const clientType = {
  include: {
    user: true,
  },
} satisfies Prisma.ClientDefaultArgs;
export type ClientType = Prisma.ClientGetPayload<typeof clientType>;

const jobType = {
  include: {
    client: true,
    savedJobs: true,
    proposal: true,
  },
} satisfies Prisma.JobDefaultArgs;
type JobBaseType = Prisma.JobGetPayload<typeof jobType>;
export type JobType = JobBaseType & { 
  isSavedJob?: boolean,
  hasProposals?: boolean
};
 
const SavedJobsType = {
  include: {
    job: true,
  }
} satisfies Prisma.SavedJobsDefaultArgs;
export type SavedJobsType = Prisma.SavedJobsGetPayload<typeof SavedJobsType>;


export type SavedJobsWithJobData = Prisma.SavedJobsGetPayload<{
  include: {
    job: {
      include: {
        createdBy: {
          select: {
            email: true;
            firstName: true;
            lastName: true;
          };
        };
        client: {
          select: {
            companyLogo: true;
            companyName: true;
          };
        };
      };
    };
  };
}>;
export type ContractsWithJobClientData = Prisma.ContractGetPayload<{
  include: {
    job: true;
    proposal: true;
    client: {
      select: {
        companyName: true;
        user: {
          select: {
            firstName: true;
            lastName: true;
            profileImg: true;
            email: true;
          };
        };
      };
    };
    freelancer: {
      select: {
        firstName: true;
        lastName: true;
        profileImg: true;
      };
    };
  };
}>;

export type ContractsWithJobClientFreelancerData = Prisma.ContractGetPayload<{
  type: string;
  include: {
    job: true;
    client: {
      select: {
        companyName: true;
        user: true;
      };
    };
    freelancer: {
      select: {
        firstName: true;
        lastName: true;
        email: true;
      };
    };
  };
}>;
export type ProposalsWithJobData = Prisma.ProposalGetPayload<{
  include: { 
    user: true
    job: {
      include: {
        createdBy: {
          select: {
            email: true;
            firstName: true;
            lastName: true;
          };
        };
      },
    };
   };
}>;
export type FreelancerJobsType = {
  savedJobs: SavedJobsType[];
  contract: ContractsWithJobClientData[];
  proposal: ProposalsWithJobData[];
  totalCount?: any,
  proposalCount?: any,
  contractCount?: any
};

type SummaryData = {
  contract: number;
  HoursWorked: number;
  Earnings: number;
};

export type SummaryDbresponse = {
  _count: Partial<SummaryData>;
} | null;

export type SummaryResponse = {
  activeContracts: number;
  hoursWorked: number;
  earnings: number;
};

export type GenericResponse<T> = T & {
  isError: boolean;
};


export type JobWithProposalCount = Job & { _count: { proposal: number } };

export type ErrorResponse = {
  error: string;
};

export type ProposalsWithUserAndJobType = Prisma.ProposalGetPayload<{
  include: {
    user: true;
    job: true;
    contract: {
      include: {
        client: {
          include: {
            user:true
          }
        },
      }
    };
  };
}>;

export type ProposalDetailsType = Prisma.ProposalGetPayload<{
  include: {
    user: {
      include: {
        freelancerProfile: true;
      };
    };
    job: {
      include: {
        createdBy: true,
      },
    };
  };
}>;

export type ContractDetailsType = Prisma.ContractGetPayload<{
  include: {
    job: {
      include: {
        createdBy: true,
      },
    };
    proposal: true;
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
  };
}>;

export type DataWithError<T> = {
  data?: T;
} & ErrorResponse & { isError: boolean };



export type JobWithSavedStatus = Prisma.JobGetPayload<{
  include: {
    createdBy: {
      select: {
        client: {
          select: {
            companyLogo: true;
            companyName: true;
          };
        };
      };
    };
    savedJobs: {
      select: {
        userId: true
      }
    }
  }
}>;

export type CreateContractData = CreateContractType & {
  proposalId?: string;
  closeJob?: boolean;
  rehire?: boolean;
  status?: ContractStatus;
};
