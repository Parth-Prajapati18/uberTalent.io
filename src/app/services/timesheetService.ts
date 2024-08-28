import { getISOWeek } from "date-fns";
import { prisma } from "../lib/prisma";
import { getCurrentUser } from "../lib/session";
import { convertLocalToUTC } from "../utils";
import { Timesheet } from "@prisma/client";
import ConversationTitleModal from "../(pages)/(authenticated_pages)/messages/components/modals/ConversationTitleModal";

export const timesheetService = {
  async getTimesheetContracts(): Promise<any> {
    const currentUser = await getCurrentUser();

    const whereClause: any =
      currentUser?.clientId ? { client: { id: currentUser?.clientId } } : { freelancer: { id: currentUser?.id } }

    const contracts = await prisma.contract.findMany({
      where: {
        ...whereClause,
        OR: [
          {
            status: "ACTIVE",
          },
          {
            status: "COMPLETED",
            timesheets: {
              some: {
                status: "PENDING"
              }
            }
          }
        ],
      },
      include: {
        timesheets: {
          where: {
            status: "PENDING"
          }
        }
      }
    });

    return {contracts: JSON.parse(JSON.stringify(contracts))};
  },

    async getOrCreateTimesheet(contractId: string, weekStart: string) {
        const localWeekStart = new Date(weekStart);
        const utcDate = new Date(localWeekStart.getUTCFullYear(), localWeekStart.getUTCMonth(), localWeekStart.getUTCDate(), 0, 0, 0, 0);
        const weekNumber = getISOWeek(utcDate);
        const currentUser = await getCurrentUser();

        console.log('weekNumber', weekNumber);
        console.log('weekStart input', weekStart);
        console.log('weekStart as localweekstart', localWeekStart.toISOString());
        console.log('utcDate', utcDate);

        const contract = await prisma.contract.findUnique({
            where: {
              id: contractId,
              status: {in: ["ACTIVE",  "COMPLETED"]}
            }
          });

        if (!contract) {
            return null;
        }
          
    
        // Check if timesheet already exists based on weekNumber to avoid utc issues
        let timesheet = await prisma.timesheet.findFirst({
            where: {
                contractId,
                weekNumber: weekNumber,
                //weekStart: utcDate.toISOString(),
                userId: currentUser?.id
            }
            
        });
        // If timesheet doesn't exist, create a new one
        if (!timesheet) {
            timesheet = await prisma.timesheet.create({
                data: {
                    weekStart: utcDate,
                    status: "PENDING",
                    contractId,
                    userId: currentUser?.id,
                    weekNumber: weekNumber,
                    rate: contract.rate    
                },
            });
        }
    
        return {...timesheet, weeklyLimit: contract?.weeklyLimit};
    },


    async updateDayEntry(timesheetId: string, { hours, day }: { hours: number, day: string }) {
        const timesheet: Timesheet | null = await prisma.timesheet.findUnique({
            where: {
                id: timesheetId
            }
        })
        let totalHours: number = 0.00;
        if (!timesheet) {
            throw new Error("Timesheet not found")
        }
        Object.keys(timesheet).forEach(key => {
            if (['mondayHours', 'tuesdayHours', 'wednesdayHours', 'thursdayHours', 'fridayHours', 'saturdayHours', 'sundayHours'].includes(key) && key !== day) {
                let hour = timesheet[key as keyof typeof timesheet] || 0.00
                totalHours = totalHours + parseFloat(hour.toString())
            }
        })
        totalHours = totalHours + hours
        const updatedDayEntry = await prisma.timesheet.update({
            where: {
                id: timesheetId
            },
            data: {
                [day]: hours,
                totalWeekHours: totalHours
            }
        })
        return updatedDayEntry
    },

    async getAllTimesheetsByContractId(contractId: string, weekStart: string) {
        const localWeekStart = new Date(weekStart);
        const utcDate = convertLocalToUTC(localWeekStart);
        const contract = await prisma.contract.findUnique({
            where: {
              id: contractId
            }
          });
        if (contract?.status !== "ACTIVE") {
            return null;
        }
          
        const timesheets = await prisma.timesheet.findMany({
            where: {
                contractId: contractId,
                weekStart: utcDate
            }
        })
        return timesheets;
    },
    async getAllTimesheetsByClientId(contractId: string, weekStart: string) {
        const localWeekStart = new Date(weekStart);
        const utcDate = convertLocalToUTC(localWeekStart);
        const weekNumber = getISOWeek(utcDate);
        const currentUser = await getCurrentUser();

        let where: any = {
          status: { in: ["ACTIVE", "COMPLETED"] },
          OR: [
            {
              timesheets: {
                none: {},
              },
            },
            {
              timesheets: {
                some: {
                  status: "PENDING",
                },
              },
            },
          ],
        };

        if (contractId === "All") {
          where = {
            ...where,
            clientId: currentUser.clientId!,
          };
        } else {
          where = {
            ...where,
            id: contractId,
          };
        }

        const activeContracts = await prisma.contract.findMany({
            where,
            include: {
              freelancer: true,
              job: true,
              timesheets: {
                where: {
                  weekNumber: weekNumber
                }
              }
            }
          });
          
          const contractsWithTimesheets = activeContracts.map(contract => {
            if (contract?.timesheets.length === 0) {
              return {
                ...contract,
                timesheets: [{
                  mondayHours: null,
                  tuesdayHours: null,
                  wednesdayHours: null,
                  thursdayHours: null,
                  fridayHours: null,
                  saturdayHours: null,
                  sundayHours: null,
                  totalWeekHours: null,
                  status: "PENDING",
                  issueStatus: null,
                  issueDetail: null,
                  resolutionDetail: null
                }]
              };
            } else {
              return contract;
            }
          });
        return contractsWithTimesheets;
    },
    async getHistoricalTimesheet(contractId: string, weekStart: string) {
      const localWeekStart = new Date(weekStart);
      const utcDate = convertLocalToUTC(localWeekStart);
      const weekNumber = getISOWeek(utcDate);
      const currentUser = await getCurrentUser();

      // Check if timesheet already exists based on weekNumber to avoid utc issues
      let where = { weekNumber: weekNumber };

      if (currentUser.clientId) {
        if (contractId === "All") {
          where = {
            ...where,
            ...{ contract: { clientId: currentUser.clientId!, status: {in: ["ACTIVE",  "COMPLETED"]} } },
          };
        } else {
          where = { ...where, ...{ contractId } };
        }
      } else {
        where = { ...where, ...{ contractId, userId: currentUser?.id } };
      }

      let timesheet = await prisma.timesheet.findFirst({ 
        where, 
        include: {
          contract: true
        }
      });

      return { ...timesheet };
    },
    async getUnpaidTimesheet(contractId: string) {
      const currentUser = await getCurrentUser();

      let where: any = { isPaid: false };

      if (currentUser.clientId) {
        if (contractId === "All") {
          where = {
            ...where,
            ...{ contract: { clientId: currentUser.clientId!, status: {in: ["ACTIVE"]} } },
          };
        } else {
          where = { ...where, ...{ contractId, contract: { status: {in: ["ACTIVE"]} } } };
        }
      } else {
        where = { ...where, ...{ contractId, userId: currentUser?.id, contract: { status: {in: ["ACTIVE"]} }  } };
      }

      return await prisma.timesheet.findMany({ 
        where, 
        include: {
          contract: {
            include: {
              job: true,
            }
          }
        }
      });
    },
    async getInvoicesTimesheet(contractId: string) {
      let where: any = { contractId };

      return await prisma.timesheet.findMany({ 
        where, 
        include: {
          contract: {
            include: {
              job: true,
            }
          }
        },
        orderBy: {
          weekStart: 'desc'
        },
        take: 3
      });
    },
    async patchTimesheet(timesheetId: string, data: any): Promise<Timesheet> {
      const payload: Record<string, any> = {};
  
      if (data?.isPaid !== undefined) {
        payload.isPaid = data.isPaid;
      }
  
      const timeseet = await prisma.timesheet.update({
        where: {
          id: timesheetId,
        },
        data: payload,
      });
  
      return timeseet;
    },
  
};