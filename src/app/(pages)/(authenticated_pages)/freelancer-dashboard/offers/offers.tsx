"use client";
import React, { useEffect, useState } from "react";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import SectionContainer from "@/app/components/ui/shared/SectionContainer";
import { classNames } from "@/app/utils";
import { format } from "date-fns";
import { ContractsWithJobClientData } from "@/app/types";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useFreelancerProposalContext } from "@/app/providers/FreelancerProposalProvider";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import { ContractStatus } from "@prisma/client";
import NoPaymentPopup from "./NoPaymentPopup";
import { useUserContext } from "@/app/providers/UserProvider";
import { AppState } from "../../messages/store";
import { useSelector } from "react-redux";
import { sendMessage } from "@/app/utils/chatUtils";
import OfferJobDetailSlideout from "./OfferJobDetailSlideout";
import DeclineOfferPopup from "./DeclineOfferPopup";
import { REJECTED_REASONS_CODE } from "@/app/constants";

// Lazy load the OfferSlideout component
const OfferSlideout = dynamic(() => import("./offerSlideOut"), { ssr: false });

type Props = {
    contracts: ContractsWithJobClientData[];
    setContract: (val: boolean) => void;
    count: any;
};

const tabs: { name: string; value: ContractStatus }[] = [
    { name: "Active", value: "PENDING" },
    { name: "Declined", value: "REJECTED" },
];

const Offers = ({ contracts, setContract, count }: Props) => {
    const { user } = useUserContext();
    const [contractsData, setContractsData] =
        useState<ContractsWithJobClientData[]>(contracts);
    const { deleteSearchParam, setSearchParams, commit, getSearchParams } =
        useParamsManager();
    const [showDetails, setShowDetails] = useState(false);
    const [showNoPaymentModal, setShowNoPaymentModal] = useState(false);
    const [showDeclineOfferModal, setShowDeclineOfferModal] = useState(false);
    const [jobDetailSlideout, setJobDetailSlideout] = useState(false);
    const [rejectedReasonCode, setRejectedReasonCode] = useState("");
    const [contractDetails, setContractDetails] =
        useState<ContractsWithJobClientData>();
    const contractStatus: any = getSearchParams("contractStatus");
    const token = useSelector((state: AppState) => state.token);
    const isStatusAvailable = tabs.find((tab) => tab.value === contractStatus);
    const [currentTab, setCurrentTab] = useState((isStatusAvailable ? contractStatus : tabs[0].value));
    const router = useRouter();

    useEffect(() => {
      setContractsData(contracts);
      const contractId = getSearchParams("contractId");
        if (contractId) {
            const contract = contracts.find((con) => con.id === contractId);
            if (contract) {
                handleSelect(contract);
            }
            deleteSearchParam("contractId");
        }
    }, [contracts]);

    async function sendAcceptOfferMessage (contract: ContractsWithJobClientData) {
        try {
            const res = await fetch(`/api/user/${contract.job?.createdById}`);
            const createdBy = await res.json();
            if(!createdBy) {
                console.log("Client data not found");
                return;
            }
            const messageString = `Good news! Your offer for the job "${contract.job?.title}" was accepted. <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/client-dashboard?contractDetails=${contract.id}">View Contract</a>`;
            const uniqueConversationTitle = "JOBID" + contract?.job.id + "USERID" + contract?.freelancerId;
            sendMessage(token, {
                chatFriendlyName: `${createdBy?.firstName} ${createdBy?.lastName}`,
                chatUniqueName: uniqueConversationTitle,
                participantEmail: createdBy?.email || "",
                messageString: messageString,
                extraAttributes: { jobTitle: contract?.job.title || "", jobId: contract?.job.id || "" },
            });

            fetch("/api/mail", {
              method: "POST",
              body: JSON.stringify({
                to: createdBy?.email,
                from: "UberTalent<support@ubertalent.io>",
                subject: `Offer Accepted on UberTalent`,
                html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="padding: 20px;">
                                <h1 style="color: #333333; text-align: center;">Offer Accepted</h1>
                                <p style="color: #333333;">Hi ${createdBy?.firstName},</p>
                                <p style="color: #333333;">Good news! Your offer for the job "${contract?.job.title}" was accepted by ${contract?.freelancer.firstName} ${contract?.freelancer.lastName}.</p>
                                
                                <p style="color: #333333; text-align: center; margin: 30px;">
                                  <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/client-dashboard?contractDetails=${contract.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Contract</a>
                                </p>
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

            // fetch("/api/mail", {
            //   method: "POST",
            //   body: JSON.stringify({
            //     to: createdBy?.email,
            //     from: "UberTalent<support@ubertalent.io>",
            //     subject: `Close Your Job on UberTalent`,
            //     html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
      
            //         <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
            //             <tr>
            //                 <td style="padding: 20px;">
            //                     <h1 style="color: #333333; text-align: center;">You Have Hired!</h1>
            //                     <p style="color: #333333;">Hi ${createdBy?.firstName},</p>
            //                     <p style="color: #333333;">Congratulations! You have successfully hired for the job "${contract?.job.title}". Would you like to close the job listing or continue seeking more candidates?</p>
            //                     <p style="color: #333333; text-align: center; margin: 30px;">
            //                       <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/a3cf6daf-bf47-479c-9d49-acc0830ec76b" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Job</a>
            //                       <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/client-dashboard/freelancer/search" style="color: #000; text-decoration: none; padding: 10px 20px; background-color: rgba(255, 255, 255); border-radius: 5px; border: 2px solid #000;">Find Talent</a>
            //                     </p>
            //                     <p style="color: #333333;">Best regards,<br>The UberTalent Team</p>
            //                 </td>
            //             </tr>
            //         </table>
            //       </body>`,
            //   }),
            //   headers: {
            //     "Content-Type": "application/json",
            //   },
            // });
    
            } catch (err) {
    
            console.log("Err: ", err);
    
            }
    }

    async function sendRejectOfferMessage (contract: ContractsWithJobClientData) {
        try {
            const res = await fetch(`/api/user/${contract.job?.createdById}`);
            const createdBy = await res.json();
            if(!createdBy) {
                console.log("Client data not found");
                return;
            }

            await fetch("/api/mail", {
              method: "POST",
              body: JSON.stringify({
                to: createdBy?.email,
                from: "UberTalent<support@ubertalent.io>",
                subject: `Offer Declined on UberTalent`,
                html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                        <tr>
                            <td style="padding: 20px;">
                                <h1 style="color: #333333; text-align: center;">Offer Declined</h1>
                                <p style="color: #333333;">Hi ${createdBy?.firstName},</p>
                                <p style="color: #333333;">Unfortunately, your offer for the job "${contract?.job.title}" has been declined by ${contract?.freelancer.firstName} ${contract?.freelancer.lastName}.</p>
                                <p style="color: #333333;"><strong>Reason: </strong>${REJECTED_REASONS_CODE[rejectedReasonCode]}</p>
                                <p style="color: #333333; text-align: center; margin: 30px;">
                                <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/client-dashboard/freelancer/search" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Find New Talent</a>
                                </p>
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
        } catch (err) {
            console.log("Err: ", err);
        }
    }

    async function sendDeclineOfferMessage(
        contract: ContractsWithJobClientData
      ) {
        try {
          const messageString = `Your offer for the job "${contract.job?.title}" has been declined.`;
          const uniqueConversationTitle =
            "JOBID" + contract?.job.id + "USERID" + contract?.freelancerId;
          await sendMessage(token, {
            chatFriendlyName: `${user?.firstName} ${user?.lastName}`,
            chatUniqueName: uniqueConversationTitle,
            participantEmail: user?.email || "",
            messageString: messageString,
            extraAttributes: {
              jobTitle: contract?.job.title || "",
              jobId: contract?.job.id || "",
            },
          });
        } catch (err) {
          console.log("Err: ", err);
        }
    }

    useEffect(() => {
        setSearchParams({
            l1Tab: "Offers",
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
        setSearchParams({
            contractStatus: value,
        });
        setCurrentTab(value as ContractStatus);
        commit();
    };

    async function updateContractStatus(
        contractId: string,
        data: string,
        proposalId: string | undefined,
    ) {
        try {
            const response = await fetch(`/api/contracts/${contractId}/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: contractId,
                    status: data,
                    proposalId,
                    rejectedReasonCode
                }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const updatedContract = await response.json();

            if (data === "ACTIVE") {
                setContractsData((prevContract) => {
                    const arr: any = prevContract.map((contract) => {
                        if (contract.id === contractId) {
                            return {
                                ...contract,
                                status: "ACTIVE",
                            };
                        }
                        return contract;
                    });
                    setTimeout(() => {
                        setContract(arr);
                    }, 500);
                    return arr;
                });
            }

            if (data === "REJECTED") {
                setContractsData((prevContract) => {
                    return prevContract.map((contract) => {
                        if (contract.id === contractId) {
                            return {
                                ...contract,
                                status: "REJECTED",
                            };
                        }
                        return contract;
                    });
                });
                setCurrentTab("REJECTED" as ContractStatus);
                setSearchParams({
                    contractStatus: "REJECTED",
                });
                commit();
            }

            return updatedContract;
        } catch (error) {
            console.error("Failed to update contract status:", error);
            return null;
        } finally {
            router.refresh();
        }
    }

    useEffect(() => {
        if(rejectedReasonCode && contractDetails) {
            updateContractStatus(contractDetails?.id, "REJECTED", contractDetails?.proposal?.id);
            sendRejectOfferMessage(contractDetails);
            sendDeclineOfferMessage(contractDetails);
            setShowDeclineOfferModal(false);
        }
    }, [rejectedReasonCode]);

    const getTabColor: any = (tab: string) => {
      return tab === 'PENDING' && count[tab] ? "red" : "gray";
    }

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
                              ? `${getTabColor(currentTab) === "red" ? "border-pink-500": "border-gray-500"} text-${getTabColor(currentTab)}-700`
                              : `border-transparent text-${getTabColor(tab.value)}-500 hover:border-${getTabColor(tab.value)}-300 hover:text-${getTabColor(tab.value)}-700`,
                            "flex gap-2 whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer"
                          )}
                          aria-current={
                            tab.value === currentTab ? "page" : undefined
                          }
                        >
                          {getTabColor(tab.value) === "red" && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="h-5 w-5 -mr-1"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                          )}
                          {tab.name}
                          {count ? (
                            <span
                              className={classNames(
                                tab.value === currentTab
                                  ? `bg-${getTabColor(currentTab)}-100 text-${getTabColor(currentTab)}-700`
                                  : `bg-${getTabColor(tab.value)}-100 text-${getTabColor(tab.value)}-900`,
                                "hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
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
              {contractsData.filter(
                (contract) => contract.status === currentTab
              ).length > 0 ? (
                <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                        >
                          Contract Title
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                        >
                          Offer Date
                        </th>
                        <th
                          scope="col"
                          className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                        >
                          Rate
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                        >
                          <span className="sr-only">View</span>
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
                                planIdx === 0
                                  ? ""
                                  : "border-t border-transparent",
                                "relative py-4 pl-4 pr-3 lg:pr-12 text-sm sm:pl-6"
                              )}
                            >
                              <div className="font-medium text-gray-900">
                                {contract.job.title}
                              </div>
                              {/* small Screen */}
                              <div className="mt-1 flex flex-col text-gray-500 lg:hidden">
                                <span>
                                  {format(contract.createdAt, "LLLL dd, yyyy")}
                                </span>

                                <span>
                                  {contract.job.compType === "HOURLY"
                                    ? `$${contract.rate}/hr`
                                    : `Fixed price: $${contract.rate}`}
                                </span>
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
                              {format(contract.createdAt, "LLLL dd, yyyy")}
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0 ? "" : "border-t border-gray-200",
                                "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                              )}
                            >
                              {contract.job.compType === "HOURLY"
                                ? `$${contract.rate}/hr`
                                : `Fixed price: $${contract.rate}`}
                            </td>
                            <td
                              className={classNames(
                                planIdx === 0
                                  ? ""
                                  : "border-t border-transparent",
                                "relative py-3.5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                              )}
                            >
                              <div className="flex flex-col md:flex-row gap-3 justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleSelect(contract)}
                                  className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                >
                                  View
                                </button>
                                {contract.status !== "REJECTED" && (
                                  <button
                                    type="button"
                                    className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                    onClick={(e) => {
                                      if(contract.paymentService && !user?.freelancerProfile?.stripe_acct_id) {
                                          setShowNoPaymentModal(true);
                                      } else {
                                        updateContractStatus(
                                          contract.id,
                                          "ACTIVE",
                                          contract?.proposal?.id || ""
                                        );
                                        sendAcceptOfferMessage(contract);
                                      }
                                    }}
                                  >
                                    Accept Offer
                                  </button>
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
              ) : (
                <div className="mt-4">
                  <EmptyState
                    label={`NO ${
                      currentTab === "PENDING" ? "ACTIVE" : "DECLINED"
                    } OFFERS`}
                  />
                </div>
              )}
              {/* Here */}
            </div>
          ) : (
            <EmptyState label="NO CONTRACTS" />
          )}
        </SectionContainer>
        {!!contractDetails && (
          <OfferSlideout
            contract={contractDetails}
            open={showDetails}
            setOpen={setShowDetails}
            setJobDetailSlideout={setJobDetailSlideout}
            update={async (contractId, status, proposalId) => {
              if (status === "ACTIVE") {
                await updateContractStatus(contractId, status, proposalId);
                sendAcceptOfferMessage(contractDetails);
              } else if (status === "REJECTED") {
                setShowDeclineOfferModal(true);
              } else {
                await updateContractStatus(contractId, status, proposalId);
              }
            }}
            setShowNoPaymentModal={setShowNoPaymentModal}
          />
        )}
        <NoPaymentPopup
          showNoPaymentModal={showNoPaymentModal}
          setShowNoPaymentModal={setShowNoPaymentModal}
        />
        <DeclineOfferPopup
          open={showDeclineOfferModal}
          setOpen={setShowDeclineOfferModal}
          setRejectedReasonCode={setRejectedReasonCode}
        />
        <OfferJobDetailSlideout
          job={contractDetails?.job || {}}
          open={jobDetailSlideout}
          setOpen={setJobDetailSlideout}
        />
      </>
    );
};

export default Offers;
