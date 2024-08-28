import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  LinkIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { ProposalDetailsType, ProposalsWithJobData } from "@/app/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Loader from "@/app/components/ui/shared/Loader";
import { getProposalById, updateProposal } from "@/app/lib/api";
import { useSelector } from "react-redux";
import { AppState } from "../../messages/store";
import { sendMessage } from "@/app/utils/chatUtils";

export default function ProposalSlideout({
  handleChangeTerms,
  reactivateProposal
}: {
  handleChangeTerms: (props: ProposalDetailsType | null) => void;
  reactivateProposal: (props: ProposalsWithJobData | null) => Promise<any>;
}) {
  const [proposal, setProposal] = useState<ProposalDetailsType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [isReactivate, setIsReactivate] = useState<boolean>(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const token = useSelector((state: AppState) => state.token);
  const proposalId = searchParams.get("proposalDetails");

  function closeModal() {
    const params = new URLSearchParams(searchParams);
    params.delete("proposalDetails");
    router.replace(`${pathname}?${params.toString()}`);
  }

  async function withdrawProposal() {
    setIsWithdrawing(true);
    let response = await updateProposal(proposalId || "", {
      status: "WITHDRAWN",
    });
    if (response.error) {
      alert(response.error);
    } else {
      try {
        const uniqueConversationTitle = "JOBID" + proposal?.job.id + "USERID" + proposal?.userId;
        await sendMessage(token, {
          chatFriendlyName: `${proposal?.job?.createdBy?.firstName} ${proposal?.job?.createdBy?.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: proposal?.job?.createdBy?.email || "",
          messageString: `The proposal for your job posting "${proposal?.job.title}" has been withdrawn.`,
          extraAttributes: { jobTitle: proposal?.job.title || "", jobId: proposal?.job.id || "" },
        });

        await fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: proposal?.job?.createdBy?.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Proposal Withdrawn on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Proposal Withdrawn</h1>
                          <p style="color: #333333;">Hi ${proposal?.job?.createdBy?.firstName},</p>
                          <p style="color: #333333;">The proposal for your job posting "${proposal?.job?.title}" has been withdrawn by ${proposal?.user.firstName} ${proposal?.user.lastName}.</p>
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
      setIsWithdrawing(false);
      closeModal();
      router.refresh();
    }
  }

  async function getProposalData() {
    if (proposalId) {
      setIsLoading(true);
      const { data, error } = await getProposalById(proposalId);
      if (!data || error) {
        alert("Error occured while fetching proposal data");
        closeModal();
      } else {
        setProposal(data);
      }
      setIsLoading(false);
    }
  }
  useEffect(() => {
    getProposalData();
  }, [proposalId]);

  return (
    <Transition.Root show={!!proposalId} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    {isLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader />
                      </div>
                    ) : (
                      <>
                        <div className="h-0 flex-1 overflow-y-auto">
                          <div className="bg-black px-4 py-6 sm:px-6">
                            <div className="flex items-center justify-between">
                              <Dialog.Title className="text-base font-semibold leading-6 text-white">
                                Proposal Details
                              </Dialog.Title>
                              <div className="ml-3 flex h-7 items-center">
                                <button
                                  type="button"
                                  className="relative rounded-md bg-black text-gray-200 hover:text-white hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-white"
                                  onClick={closeModal}
                                >
                                  <span className="absolute -inset-2.5" />
                                  <span className="sr-only">Close panel</span>
                                  <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                            <div className="mt-1">
                              <p className="text-sm text-gray-300">
                                View proposal details below
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <div className="divide-y divide-gray-200 px-4 sm:px-6">
                              <div className="space-y-6 pb-5 pt-6">
                                <div>
                                  <div className="block text-sm font-medium leading-6 text-gray-900">
                                    Job Title
                                  </div>
                                  <div className="mt-2">
                                    <div className="block w-full text-gray-900  sm:text-sm sm:leading-6">
                                      {proposal?.job?.title}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <div className="block text-sm font-medium leading-6 text-gray-900">
                                    Job Description
                                  </div>
                                  <div className="mt-2">
                                    <div className="block w-full text-gray-900  sm:text-sm sm:leading-6 whitespace-pre-wrap">
                                      {proposal?.job.description || "N/A"}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium leading-6 text-gray-900">
                                    Date Applied
                                  </h3>
                                  <div className="mt-2">
                                    <div className="block w-full text-gray-900  sm:text-sm sm:leading-6">
                                      {proposal?.createdAt &&
                                        format(
                                          proposal.createdAt,
                                          "LLLL dd, yyyy"
                                        )}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium leading-6 text-gray-900">
                                    Rate
                                  </h3>
                                  <div className="mt-2">
                                    <div className="block w-full text-gray-900  sm:text-sm sm:leading-6">
                                      {proposal?.job.compType === "HOURLY"
                                        ? `$${proposal?.rate}/hr`
                                        : `Fixed price: $${proposal?.rate}`}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="pb-6 pt-4">
                                <div className="flex text-sm">
                                  <h3 className="text-sm font-medium leading-6 text-gray-900 ml-2">
                                    Cover Letter{" "}
                                  </h3>
                                </div>
                                <div className="mt-4 flex text-sm">
                                  <p className="ml-2 whitespace-pre-wrap">
                                    {proposal?.coverLeter || "N/A"}
                                  </p>
                                </div>
                              </div>
                              {proposal?.attachments && (
                                <div className="pb-6 pt-4">
                                  <div className="flex text-sm">
                                    <h3 className="text-sm font-medium leading-6 text-gray-900 ml-2">
                                      Attachments
                                    </h3>
                                  </div>
                                  <div className="flex gap-x-2 items-center mt-4">
                                    <LinkIcon className="w-4 text-blue-600" />
                                    <a
                                      href={proposal?.attachments!}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600"
                                    >
                                      View Attachment
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 justify-end px-4 py-4">
                            {proposal?.status !== "DISQUALIFIED" && proposal?.status !== "WITHDRAWN" &&
                              (<div>
                                <button
                                  disabled={isWithdrawing}
                                  type="button"
                                  className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 border border-red-600 shadow-sm min-w-28 hover:bg-red-100 hover:border-red-100"
                                  onClick={withdrawProposal}>
                                    {isWithdrawing ? (<Loader className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />) : "Withdraw"}
                                </button>
                                <button
                                  disabled={isWithdrawing}
                                  type="submit"
                                  className="mx-4 inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                  onClick={() => handleChangeTerms(proposal)}
                                >
                                  Change Terms
                                </button>
                              </div>)
                              }

                            {proposal?.status === "WITHDRAWN" &&
                              (<button
                                disabled={isReactivate}
                                type="button"
                                className="mx-4 inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                                onClick={async ()=> {
                                  setIsReactivate(true);
                                  await reactivateProposal(proposal);
                                  setIsReactivate(false);
                                  closeModal();
                                }}
                              >
                                {isReactivate ? (<Loader className="w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" />) : "Reactivate"}
                              </button>)
                            }
                          
                          <button
                            disabled={isWithdrawing}
                            type="button"
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={closeModal}
                          >
                            Close
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
