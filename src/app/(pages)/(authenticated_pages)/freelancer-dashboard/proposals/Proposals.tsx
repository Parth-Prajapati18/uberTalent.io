"use client";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import SectionContainer from "@/app/components/ui/shared/SectionContainer";
import { classNames } from "@/app/utils";
import React, { useEffect, useState } from "react";
import ProposalSlideout from "./PorposalSlideout";
import { format } from "date-fns";
import { ProposalStatus } from "@prisma/client";
import { ProposalsWithJobData, ProposalDetailsType } from "@/app/types";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import SubmitProposalForm from "../proposals/SubmitProposalForm";
import SubmitProposalSlideout from "../proposals/SubmitPropsalSlideout";
import { updateProposal } from "@/app/lib/api";
import { useSelector } from "react-redux";
import { AppState } from "../../messages/store";
import { sendMessage } from "@/app/utils/chatUtils";
import { useRouter } from "next/navigation";

export interface Proposal {
  id: number;
  jobTitle: string;
  jobDescription?: string;
  dateApplied: string;
  proposedHourlyRate: string;
  compType: string;
  status: string;
  coverLetter?: string;
}

const tabs = [
  { name: "Submitted", value: ProposalStatus.SUBMITTED },
  { name: "Disqualified", value: ProposalStatus.DISQUALIFIED },
  { name: "Withdrawn", value: ProposalStatus.WITHDRAWN },
];

type Props = {
  proposals: ProposalsWithJobData[];
  count: any;
};
const Proposals = ({ proposals, count }: Props) => {
  const { getSearchParams, setSearchParams, deleteSearchParam, commit } =
    useParamsManager();
  const proposalStatus = getSearchParams("proposalStatus");
  const [currentTab, setCurrentTab] = useState(
    () => proposalStatus || tabs[0].value
  );
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalDetailsType>();
  const [showSubmitProposal, setShowSubmitProposal] = useState(false);
  const token = useSelector((state: AppState) => state.token);
  const router = useRouter();

  useEffect(() => {
    console.log("Propsals page");
    if (currentTab === "PENDING") {
      setSearchParams({
        l1Tab: "Contracts",
        contractStatus: currentTab,
      });
      deleteSearchParam("proposalStatus");
      commit();
    } else {
      setSearchParams({
        l1Tab: "Proposals",
        proposalStatus: currentTab,
      });
      deleteSearchParam("contractStatus");
      commit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  function handleView(proposalId: string) {
    setSearchParams({
      proposalDetails: proposalId,
    });
    commit();
  }

  const handleJobTitleClick = () => {
    setShowSubmitProposal(false);
  };

  const handleChangeTerms = (proposal: ProposalDetailsType | null) => {
    deleteSearchParam("proposalDetails");
    commit();
    if (proposal) {
      setSelectedProposal(proposal);
      setShowSubmitProposal(true);
    }
  };

  const handleTabChange = (value: string) => {
    setCurrentTab(value);
  };

  async function reactivateProposal(proposal: ProposalsWithJobData | null) {
    let response = await updateProposal(proposal?.id || "", {
      status: "SUBMITTED",
    });
    if (response.error) {
      alert(response.error);
    } else {
      try {
        const messageString = `Proposal for "${proposal?.job.title}" was reactivated. <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/${proposal?.job?.id}/proposals?status=SUBMITTED&proposalDetails=${proposal?.id}">View Proposal</a>`;
        const uniqueConversationTitle =
          "JOBID" + proposal?.job.id + "USERID" + proposal?.userId;
        sendMessage(token, {
          chatFriendlyName: `${proposal?.job?.createdBy?.firstName} ${proposal?.job?.createdBy?.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: proposal?.job?.createdBy?.email || "",
          messageString: messageString,
          extraAttributes: {
            jobTitle: proposal?.job.title || "",
            jobId: proposal?.job.id || "",
          },
        });

        fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: proposal?.job?.createdBy?.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Proposal Reactivated on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Proposal Reactivated</h1>
                          <p style="color: #333333;">Hi ${proposal?.job?.createdBy?.firstName},</p>
                          <p style="color: #333333;">The proposal for "${proposal?.job?.title}" was reactivated by by ${proposal?.user.firstName} ${proposal?.user.lastName}.</p>
                          <p style="color: #333333; text-align: center; margin: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/${proposal?.job?.id}/proposals?status=SUBMITTED&proposalDetails=${proposal?.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Proposal</a>
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
      } finally {
        router.refresh();
      }
    }
  }

  return (
    <>
      <SectionContainer>
        {proposals?.length > 0 ? (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="border-b border-gray-200">
              <div className="sm:flex sm:items-baseline">
                <div className="mt-4  sm:mt-0">
                  <nav className="flex space-x-8 overflow-auto">
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
                            {tab.value === ProposalStatus.SUBMITTED
                              ? (count[tab.value] || 0) +
                                (count[ProposalStatus.SHORT_LISTED] || 0)
                              : count[tab.value] || 0}
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
            {proposals.filter((proposal) => {
              if (currentTab === ProposalStatus.SUBMITTED) {
                const status: any = [
                  ProposalStatus.SUBMITTED,
                  ProposalStatus.SHORT_LISTED,
                ];
                return status.includes(proposal.status);
              } else {
                return proposal.status === currentTab;
              }
            }).length > 0 ? (
              <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                      >
                        Job Title
                      </th>
                      <th
                        scope="col"
                        className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                      >
                        Date Applied
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
                    {proposals
                      .filter((proposal) => {
                        if (currentTab === ProposalStatus.SUBMITTED) {
                          const status: any = [
                            ProposalStatus.SUBMITTED,
                            ProposalStatus.SHORT_LISTED,
                          ];
                          return status.includes(proposal.status);
                        } else {
                          return proposal.status === currentTab;
                        }
                      })
                      .map((proposal, planIdx) => (
                        <tr key={proposal.id}>
                          <td
                            className={classNames(
                              planIdx === 0
                                ? ""
                                : "border-t border-transparent",
                              "relative py-4 pl-4 pr-3 lg:pr-12 text-sm sm:pl-6"
                            )}
                          >
                            <div className="font-medium text-gray-900">
                              {proposal.job.title}
                            </div>
                            <div className="mt-1 flex flex-col text-gray-500 sm:block lg:hidden">
                              <span>
                                {format(proposal.createdAt, "LLLL dd, yyyy")}
                              </span>
                              <span className="hidden sm:inline">·</span>
                              <span>
                                {proposal.job.compType === "HOURLY"
                                  ? `$${proposal.rate}/hr`
                                  : `Fixed price: $${proposal.rate}`}
                              </span>
                              <span className="hidden sm:inline">·</span>
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
                            {format(proposal.createdAt, "LLLL dd, yyyy")}
                          </td>
                          <td
                            className={classNames(
                              planIdx === 0 ? "" : "border-t border-gray-200",
                              "hidden px-3 py-3.5 text-sm text-gray-500 lg:table-cell"
                            )}
                          >
                            {proposal.job.compType === "HOURLY"
                              ? `$${proposal.rate}/hr`
                              : `Fixed price: $${proposal.rate}`}
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
                              <span>
                                <button
                                  type="button"
                                  onClick={() => handleView(proposal?.id)}
                                  className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                                >
                                  View
                                  <span className="sr-only">
                                    , {proposal.job.title}
                                  </span>
                                </button>
                              </span>
                              {proposal?.status ===
                                ProposalStatus.WITHDRAWN && (
                                <span>
                                  <button
                                    type="button"
                                    className="rounded-md bg-black px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                    onClick={(e) => {
                                      reactivateProposal(proposal);
                                    }}
                                  >
                                    Reactivate
                                  </button>
                                </span>
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
              <div className="flex justify-center my-4">
                <EmptyState
                  label={`NO ${currentTab.replace(/_/g, "")} PROPOSALS`}
                />
              </div>
            )}
          </div>
        ) : (
          <EmptyState label="NO PROPOSALS" />
        )}
      </SectionContainer>

      <ProposalSlideout
        handleChangeTerms={handleChangeTerms}
        reactivateProposal={reactivateProposal}
      />
      <SubmitProposalSlideout
        open={showSubmitProposal}
        setOpen={setShowSubmitProposal}
      >
        {selectedProposal && (
          <SubmitProposalForm
            setOpen={setShowSubmitProposal}
            proposal={selectedProposal}
            handleJobTitleClick={handleJobTitleClick}
          />
        )}
      </SubmitProposalSlideout>
    </>
  );
};

export default Proposals;
