"use client";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import SectionContainer from "@/app/components/ui/shared/SectionContainer";
import { classNames, returnFormattedDate } from "@/app/utils";
import React, { useEffect, useState } from "react";
import { ContractStatus } from "@prisma/client";
import { ContractsWithJobClientData } from "@/app/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ContractSlideout from "@/app/components/ui/shared/slideout/ContractSlideout";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import ActiveContractsDropdown from "./ActiveContractsDropdown";
import CloseContractDialog from "@/app/components/ui/shared/CloseContractDialog";
import { updateContractStatus } from "@/app/lib/api";
import { sendMessage } from "@/app/utils/chatUtils";
import { useSelector } from "react-redux";
import { AppState } from "../../messages/store";

type ContractType = "fixed price" | "hourly";

export interface Contract {
  id: number;
  jobTitle: string;
  jobDescription: string;
  timeBilled: string;
  contractType: ContractType;
  hiredBy: string;
  companyName: string;
  rate: number;
  weeklyLimit: number;
  startDate: Date;
  endDate?: Date;
  active: boolean;
}

const tabs: { name: string; value: ContractStatus }[] = [
  { name: "Active", value: "ACTIVE" },
  { name: "Completed", value: "COMPLETED" },
];

type Props = {
  contracts: ContractsWithJobClientData[];
  count: any;
};

const Contracts = ({ contracts, count }: Props) => {
  const [contractsData, setContractsData] =
    useState<ContractsWithJobClientData[]>(contracts);
  const { deleteSearchParam, setSearchParams, commit, getSearchParams } =
    useParamsManager();
  const [showDetails, setShowDetails] = useState(false);
  const [contractDetails, setContractDetails] =
    useState<ContractsWithJobClientData>();
  const contractStatus: any = getSearchParams("contractStatus");
  const isStatusAvailable = tabs.find((tab) => tab.value === contractStatus);
  const [currentTab, setCurrentTab] = useState((isStatusAvailable ? contractStatus : tabs[0].value));
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const token = useSelector((state: AppState) => state.token);

  useEffect(() => {
    setContractsData(contracts);
  }, [contracts]);

  useEffect(() => {
    setSearchParams({
      l1Tab: "Contracts",
      contractStatus: currentTab,
    });
    deleteSearchParam("proposalStatus");
    commit();
  }, [currentTab]);

  function handleSelect(data: ContractsWithJobClientData) {
    setContractDetails(data);
    setShowDetails(true);
  }

  const handleTabChange = (value: string) => {
    setContractsData(contracts.filter((contract) => contract.status === currentTab));
    setSearchParams({
      contractStatus: value,
    });
    setCurrentTab(value as ContractStatus);
    commit();
  };

  const handleEndContract = () => {
    setShowDialog(true);
  };

  const isCompleted = currentTab === "COMPLETED";
  const handleEndContractClick = (contract: ContractsWithJobClientData) => {
    setShowDialog(true);
    setContractDetails(contract);
  };

  const handleContractAction = async (contractId: string, type: string) => {
    if (type === "close") {
      const updatedContract = await updateContractStatus(
        contractId,
        "COMPLETED"
      );
      const messageString = `The contract for the job "${contractDetails?.job?.title}" has ended.`;
      const uniqueConversationTitle =
        "JOBID" +
        contractDetails?.job.id +
        "USERID" +
        contractDetails?.freelancerId;
      await sendMessage(token, {
        chatFriendlyName: `${contractDetails?.client?.user[0]?.firstName} ${contractDetails?.client?.user[0]?.lastName}`,
        chatUniqueName: uniqueConversationTitle,
        participantEmail: contractDetails?.client?.user[0]?.email || "",
        messageString: messageString,
        extraAttributes: {
          jobTitle: contractDetails?.job.title || "",
          jobId: contractDetails?.job.id || "",
        },
      });
      await fetch("/api/mail", {
        method: "POST",
        body: JSON.stringify({
          to: contractDetails?.client?.user[0]?.email,
          from: "UberTalent<support@ubertalent.io>",
          subject: `Contract Ended on UberTalent`,
          html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Contract Ended</h1>
                          <p style="color: #333333;">Hi ${contractDetails?.client?.user[0]?.firstName} ${contractDetails?.client?.user[0]?.lastName},</p>
                          <p style="color: #333333;">The contract for the job "${contractDetails?.job?.title}" has ended.</p>
                          <p style="color: #666666;">Contract Details:</p>
                          <p style="color: #333333;"><strong>Contractor: </strong>${contractDetails?.freelancer?.firstName} ${contractDetails?.freelancer?.lastName}</p>
                          <p style="color: #333333;"><strong>Contract Title: </strong>${contractDetails?.title}</p>
                          <p style="color: #333333;"><strong>Hourly Rate: </strong>$${contractDetails?.rate}</p>
                          <p style="color: #333333;"><strong>Weekly Limit: </strong>${contractDetails?.weeklyLimit} hours</p>
                          <p style="color: #333333;">Best regards,<br>The UberTalent Team</p>
                      </td>
                  </tr>
              </table>
            </body>`,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      setContractsData((prevContract) => {
        return prevContract.map((contract) => {
          if (contract.id === contractId) {
            return {
              ...contract,
              status: "COMPLETED",
              endDate: updatedContract?.endDate,
            };
          }
          return contract;
        });
      });
      setCurrentTab("COMPLETED" as ContractStatus);
      setSearchParams({
        contractStatus: "COMPLETED",
      });
      commit();
      setShowDialog(false);
    }
  };
  return (
    <>
      <SectionContainer>
        {contractsData?.length > 0 ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gray-200">
              <div className="sm:flex sm:items-baseline">
                <div className="mt-4  sm:mt-0">
                  <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                      <div
                        key={tab.name}
                        onClick={() => handleTabChange(tab.value)}
                        className={classNames(
                          currentTab === tab.value
                            ? "border-gray-500 text-black"
                            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                          "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer"
                        )}
                        aria-current={
                          tab.value === currentTab ? "page" : undefined
                        }
                      >
                        {tab.name}
                        {count ? (
                          <span
                            className={classNames(
                              tab.value === currentTab
                                ? "bg-gray-100 text-black"
                                : "bg-gray-100 text-gray-900",
                              "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
                            )}
                          >
                            {count[tab.value] || 0}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
            {/* Here */}
            {
              contractsData.filter((contract) => contract.status === currentTab).length > 0 ?
                <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                        >
                          Hired By
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                        >
                          {isCompleted ? "End date" : "Start Date"}
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                        >
                          Rate
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                        >
                          Weekly Limit
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">Select</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractsData
                        .filter((contract) => contract.status === currentTab)
                        .map((contract, planIdx: Number) => (
                          <tr key={contract.id}>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-transparent",
                                "relative py-4 pl-4 pr-3 text-sm sm:pl-6"
                              )}
                            >
                              <div className="font-medium text-gray-900">
                                {contract.title}
                              </div>
                              <div className="mt-1 flex flex-col text-gray-500 sm:block lg:hidden">
                                <span>{contract.client.companyName}</span>
                                <span className="hidden sm:inline">·</span>
                                <span className="hidden sm:inline">·</span>
                                <span>
                                  {contract.type === "HOURLY"
                                    ? `$${contract.rate}/hr`
                                    : `Fixed price: $${contract.rate}`}
                                </span>
                                <span className="hidden sm:inline">·</span>
                                <span>{contract.weeklyLimit || "-"}</span>
                              </div>
                              {planIdx !== 0 ? (
                                <div className="absolute -top-px left-6 right-0 h-px bg-gray-200" />
                              ) : null}
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-gray-200",
                                "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                              )}
                            >
                              <span>{contract.client.companyName}</span>
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-gray-200",
                                "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                              )}
                            >
                              {returnFormattedDate(
                                isCompleted ? contract.endDate : contract.startDate,
                                "LLLL dd, yyyy"
                              )}
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-gray-200",
                                "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                              )}
                            >
                              {contract.type === "HOURLY"
                                ? `$${contract.rate}/hr`
                                : `Fixed price: $${contract.rate}`}
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-gray-200",
                                "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                              )}
                            >
                              {contract.weeklyLimit || "-"}
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-transparent",
                                "relative py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                              )}
                            >
                              <div className="flex flex-none items-center gap-x-4">
                                <button
                                  type="button"
                                  onClick={() => handleSelect(contract)}
                                  className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                >
                                  View
                                  <span className="sr-only">
                                    , {contract.title}
                                  </span>
                                </button>
                                {currentTab === "ACTIVE" && (
                                  <ActiveContractsDropdown
                                    contract={contract}
                                    handleEndContractClick={handleEndContractClick}
                                  />
                                )}
                              </div>

                              {planIdx !== 0 ? (
                                <div className="absolute -top-px left-0 right-6 h-px bg-gray-200" />
                              ) : null}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                :
                <div className="mt-4">
                  <EmptyState label={`NO ${currentTab.toUpperCase()} CONTRACTS`}/>
                </div>
            }
            {/* Here */}
          </div>
        ) : (
          <EmptyState label="NO CONTRACTS" />
        )}
      </SectionContainer>

      {!!contractDetails && (
        <ContractSlideout
          open={showDetails}
          setOpen={setShowDetails}
          contractDetails={contractDetails}
          handleContractAction={handleEndContract}
        />
      )}
      <CloseContractDialog
        open={showDialog}
        setOpen={setShowDialog}
        handleContractAction={handleContractAction}
        contractId={contractDetails?.id}
      />
    </>
  );
};

export default Contracts;
