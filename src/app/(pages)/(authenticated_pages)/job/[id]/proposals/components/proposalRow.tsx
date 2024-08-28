"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import clsx from 'clsx';
import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import { ProposalsWithUserAndJobType } from "@/app/types";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { useRouter, useSearchParams } from "next/navigation";
import { classNames } from "@/app/utils";
import { bindActionCreators } from "redux";
import {
  AppState,
  actionCreators,
} from "@/app/(pages)/(authenticated_pages)/messages/store";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@twilio/conversations";
import { sendMessage } from "@/app/utils/chatUtils";
import { updateProposal } from "@/app/lib/api";
import { UserCircleIcon } from "@heroicons/react/24/outline";

const ProposalRow = ({
  id,
  user,
  job,
  createdAt,
  rate,
  coverLeter,
  status,
  userId,
  contract
}: ProposalsWithUserAndJobType) => {
  const { setSearchParams, commit } = useParamsManager();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { setNewConvoData } = bindActionCreators(actionCreators, dispatch);
  const token = useSelector((state: AppState) => state.token);
  function handleReplace(id: string) {
    // const params = new URLSearchParams(searchParams);
    // params.set("proposalDetails", id);
    // replace(`${pathname}?${params.toString()}`);
    setSearchParams({ proposalDetails: id });
    commit();
  }

  function handleReplaceContract(id: string) {
    setSearchParams({ contractDetails: id });
    commit();
  }

  function openHireSlideout() {
    setSearchParams({
      proposalId: id,
      hire: "true",
    });
    commit();
  }

  function openUpdateSlideout() {
    if (status === "WITHDRAWN") {
      setSearchParams({
        rehire: "true",
      });
    } else {
      setSearchParams({
        rehire: "false",
      });
    }
    setSearchParams({
      contractId: contract?.id || "",
      update: "true",
    });
    commit();
  }

  interface ButtonMapType {
    [key: string]: string[];
  }
  const [buttonMap, setButtonMap] = useState<ButtonMapType>(
    job.status === "CLOSED"
      ? {
          SUBMITTED: ["Message"],
          SHORT_LISTED: ["Message"],
          OFFER: ["Message"],
          DISQUALIFIED: ["Message"],
          WITHDRAWN: ["Message"],
        }
      : {
          SUBMITTED: ["Shortlist", "Message", "Disqualify", "Hire"],
          SHORT_LISTED: ["Message", "Disqualify", "Hire"],
          DISQUALIFIED: ["Message", "Shortlist", "Hire"],
          WITHDRAWN: ["Message"],
        }
  );

  useEffect(() => {
    if (job.status !== "CLOSED") {
      const statusFromParams = params.get("status");
      if (statusFromParams === "HIRED") {
        setButtonMap((prevMap) => ({
          ...prevMap,
          OFFER: ["Message"],
        }));
      } else {
        if (
          statusFromParams === "OFFER" &&
          contract?.status === "WITHDRAWN" &&
          status === "OFFER"
        ) {
          setButtonMap((prevMap) => ({
            ...prevMap,
            OFFER: ["Message", "Reactivate"],
          }));
        } else if (
          statusFromParams === "OFFER" &&
          contract?.status === "REJECTED" &&
          status === "OFFER"
        ) {
          setButtonMap((prevMap) => ({
            ...prevMap,
            OFFER: ["Message", "Update"],
          }));
        } else {
          setButtonMap((prevMap) => ({
            ...prevMap,
            OFFER: ["Message", "Update", "Withdraw Offer"],
          }));
        }
      }
    }
  }, [params.get("status"), contract?.status]);

  async function updateContractStatus(contractId: string, data: string, proposalId: string) {
    try {
      const response = await fetch(`/api/contracts/${contractId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contractId,
          status: data,
          proposalId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const updatedContract = await response.json();

      return updatedContract;

    } catch (error) {
      console.error('Failed to update contract status:', error);
      return null;
    } finally {
      router.refresh();
    }
  }

  async function disqualifyProposal() {
    try {
      setIsLoading(true);
      let response = await updateProposal(id, {
        status: "DISQUALIFIED",
      });
      setIsLoading(false);
      if (response.error) {
        alert(response.error);
      } else {
        router.refresh();
        const uniqueConversationTitle = "JOBID" + job.id + "USERID" + user.id;
        sendMessage(token, {
          chatFriendlyName: `${user.firstName} ${user.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: user.email,
          messageString: `Unfortunately, your proposal for the job "${job.title}" has been disqualified.`,
          extraAttributes: {
            jobTitle: job.title,
            jobId: job?.id,
          },
        });
        fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: user.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Proposal Disqualified on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Proposal Disqualified</h1>
                          <p style="color: #333333;">Hi ${user.firstName},</p>
                          <p style="color: #333333;">Unfortunately, your proposal for job "${job.title}" has been disqualified.</p>
                          <p style="color: #333333; text-align: center; margin: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/search" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Find New Opportunities</a>
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
      }
    } catch (error) {
      console.error("Failed to update contract status:", error);
      return null;
    } finally {
    }
  }

  async function withdrawOffer() {
    try {
      setIsLoading(true);
      const contractId = contract?.id || "";
      let response = await updateContractStatus(contractId, "WITHDRAWN", id);
      setIsLoading(false);
      if (response.error) {
        alert(response.error);
      } else {
        router.refresh();
        const uniqueConversationTitle = "JOBID" + job.id + "USERID" + user.id;
        sendMessage(token, {
          chatFriendlyName: `${user.firstName} ${user.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: user.email,
          messageString: `Unfortunately, the client has withdrawn the offer for this job.`,
          extraAttributes: {
            jobTitle: job.title,
            jobId: job?.id,
          },
        });
        let companyName = contract?.client.companyName;
        if (!companyName) {
          companyName = `${contract?.client.user[0].firstName} ${contract?.client.user[0].lastName}`;
        }
        fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: user.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Offer Withdrawn on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Offer Withdrawn</h1>
                          <p style="color: #333333;">Hi ${user.firstName},</p>
                          <p style="color: #333333;">Unfortunately, the offer for the job "${job.title}" has been withdrawn by ${companyName}.</p>
                          <p style="color: #333333; text-align: center; margin: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/search" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Find Other Jobs</a>
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
      }
    } catch (error) {
      console.error("Failed to update contract status:", error);
      return null;
    } finally {
    }
  }

  async function reactivate() {
    try {
      setIsLoading(true);
      const contractId = contract?.id || "";
      let response = await updateContractStatus(contractId, "PENDING", id);
      setIsLoading(false);
      if (response.error) {
        alert(response.error);
      } else {
        router.refresh();
        const uniqueConversationTitle = "JOBID" + job.id + "USERID" + user.id;
        sendMessage(token, {
          chatFriendlyName: `${user.firstName} ${user.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: user.email,
          messageString: `Good news the client has reactivated the offer for this job.`,
          extraAttributes: {
            jobTitle: job.title,
            jobId: job?.id,
          },
        });
        let companyName = contract?.client.companyName;
        if (!companyName) {
          companyName = `${contract?.client.user[0].firstName} ${contract?.client.user[0].lastName}`;
        }
        fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: user.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Offer Reactivated on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Offer Reactivated</h1>
                          <p style="color: #333333;">Hi ${user.firstName},</p>
                          <p style="color: #333333;">Good news, the offer for the job "${job.title}" has been reactivated by ${companyName}.</p>
                          <p style="color: #333333; text-align: center; margin: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-dashboard?l1Tab=Offers&contractStatus=PENDING&contractId=${contractId}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Offer</a>
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
      }
    } catch (error) {
      console.error("Failed to update contract status:", error);
      return null;
    } finally {
    }
  }

  return (
    <div
      className="hover:bg-gray-50 p-1 rounded-lg cursor-pointer"
      onClick={() =>
        !isLoading && (status === "OFFER"
          ? handleReplaceContract(contract?.id || "")
          : handleReplace(id))
      }
    >
      <div className="md:flex md:items-center md:justify-between md:space-x-5">
        <div className="flex items-start space-x-5">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="h-16 w-16">
                {user?.profileImg ? (<Image
                  className="rounded-full"
                  src={user?.profileImg || ""}
                  alt=""
                  fill
                />) : (<UserCircleIcon />)}
              </div>
              <span
                className="absolute inset-0 rounded-full shadow-inner"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="pt-1.5">
            <div className="flex">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {contract?.status === 'ACTIVE' ? user?.lastName : ''}
              </h1>
              {((status === "OFFER" && contract?.status !== 'ACTIVE') ||
                status === "WITHDRAWN"
              ) && (<div className={clsx(
                "rounded-md py-1 px-2 my-1 mx-2 text-xs font-medium ring-1 ring-inset",
                {
                  "text-gray-600 bg-gray-50 ring-gray-500/10": (status === "OFFER" && contract?.status === 'PENDING'),
                  "text-red-600 bg-red-50 ring-red-500/10": (status === "OFFER" && (contract?.status === 'WITHDRAWN' || contract?.status === 'REJECTED')),
                  "text-red-700 bg-red-50 ring-red-600/10": status === "WITHDRAWN",
                }
              )}>
                {(() => {
                  switch (status) {
                    case 'OFFER':
                      if (contract?.status === 'WITHDRAWN') {
                        return 'Withdrawn by client'
                      }
                      return `${contract?.status === 'REJECTED' ? 'Declined' : 'Offer'}`
                    case 'WITHDRAWN':
                      return 'Withdrawn by freelancer'
                    default:
                      return null
                  }
                })()}
              </div>)}
            </div>
            {status !== "OFFER" && (<p className="text-sm font-medium text-gray-500">
              Applied on{" "}
              <span className="text-sm font-medium text-gray-500">
                {format(createdAt, "LLLL dd, yyyy")}
              </span>
            </p>)}
            {(status === "OFFER" && contract?.status !== 'ACTIVE') && (<p className="text-sm font-medium text-gray-500">
              Offer sent on{" "}
              {(contract && contract?.createdAt) && <span className="text-sm font-medium text-gray-500">
                {format(contract?.createdAt, "LLLL dd, yyyy")}
              </span>}
            </p>)}
            {(status === "OFFER" && contract?.status === 'ACTIVE') && (<p className="text-sm font-medium text-gray-500">
              Hired on{" "}
              {(contract && contract?.startDate) && <span className="text-sm font-medium text-gray-500">
                {format(contract?.startDate, "LLLL dd, yyyy")}
              </span>}
            </p>)}
          </div>
        </div>
        <div
          className={
            "mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3"
          }
        >
          {buttonMap[status]?.includes("Update") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                // open Update Proposal Slideout
                openUpdateSlideout();
              }}
              className={classNames(
                "inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              )}
            >
              Update
            </button>
          )}
          {buttonMap[status]?.includes("Withdraw Offer") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                withdrawOffer();
              }}
              className={classNames(
                "inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
                isLoading ? "hover:cursor-wait" : ""
              )}
            >
              Withdraw Offer
            </button>
          )}
          {buttonMap[status]?.includes("Shortlist") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                let response = await updateProposal(id, {
                  status: "SHORT_LISTED",
                });
                // const uniqueConversationTitle =
                //   "JOBID" + job.id + "USERID" + user.id;
                // await sendMessage(token, {
                //   chatFriendlyName: `${user.firstName} ${user.lastName}`,
                //   chatUniqueName: uniqueConversationTitle,
                //   participantEmail: user.email,
                //   messageString: `Great news! Your proposal for the job "${job.title}" has been shortlisted.`,
                //   extraAttributes: {
                //     jobTitle: job.title,
                //     jobId: job?.id,
                //   },
                // });
                setIsLoading(false);
                if (response.error) {
                  alert(response.error);
                } else {
                  router.refresh();
                }
              }}
              className={classNames(
                "inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
                isLoading ? "hover:cursor-wait" : ""
              )}
            >
              Shortlist
            </button>
          )}
          {buttonMap[status]?.includes("Message") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                const uniqueConversationTitle =
                  "JOBID" + job.id + "USERID" + user.id;
                await sendMessage(
                  token,
                  {
                    chatFriendlyName: `${user.firstName} ${user.lastName}`,
                    chatUniqueName: uniqueConversationTitle,
                    participantEmail: user.email,
                    extraAttributes: { jobTitle: job.title, jobId: job.id },
                  }
                  // `Offer for ${job.title}`
                );
                router.push("/messages" + `?convoSearch=${uniqueConversationTitle}`);
                setIsLoading(false);
              }}
              className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 "
            >
              <span>Message</span>
            </button>
          )}

          {buttonMap[status]?.includes("Disqualify") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                disqualifyProposal();
              }}
              className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Disqualify
            </button>
          )}
          {buttonMap[status]?.includes("Hire") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                openHireSlideout();
              }}
              className="inline-flex items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:w-auto"
            >
              Send Offer
            </button>
          )}
          {buttonMap[status]?.includes("Rehire") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => {
                e.stopPropagation();
                openUpdateSlideout();
              }}
              className="inline-flex items-center justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:w-14"
            >
              Rehire
            </button>
          )}
          {buttonMap[status]?.includes("Reconsider") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                setIsLoading(true);
                let response = await updateProposal(id, {
                  status: "SUBMITTED",
                });
                setIsLoading(false);
                if (response.error) {
                  alert(response.error);
                } else {
                  router.refresh();
                }
              }}
              className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Reconsider
            </button>
          )}
          {buttonMap[status]?.includes("Reactivate") && (
            <button
              type="button"
              disabled={isLoading}
              onClick={async (e) => {
                e.stopPropagation();
                reactivate();
              }}
              className={classNames(
                "inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
                isLoading ? "hover:cursor-wait" : ""
              )}
            >
              Reactivate
            </button>
          )}
        </div>
      </div>

      {status !== "OFFER" && (<div className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-0 lg:px-0">
        <div className="flex min-w-0 gap-x-4">
          <div className="min-w-0 flex-auto">
            <div className="text-sm font-semibold leading-6 text-gray-900">
              <div>
                <span className="absolute inset-x-0 -top-px bottom-0" />
                {job?.compType === "HOURLY" &&
                  `Proposed hourly rate: $${rate}/hr`}
                {job?.compType === "FIXED" && `Proposed fixed rate: $${rate}`}
              </div>
            </div>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-x-4">
          <div className="hidden sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-gray-900 max-w-sm md:max-w-xl ellipses">
              {coverLeter}
            </p>
          </div>
          <ChevronRightIcon
            className="h-5 w-5 flex-none text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>)}
    </div>
  );
};

export default ProposalRow;
