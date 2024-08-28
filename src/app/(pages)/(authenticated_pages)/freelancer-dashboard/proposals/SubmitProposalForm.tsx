"use client";
import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "@headlessui/react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  XMarkIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PaperClipIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { PhotoIcon } from "@heroicons/react/20/solid";
import { useFreelancerProposalContext } from "@/app/providers/FreelancerProposalProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  SubmitProposalSchema,
  SubmitProposalType,
} from "@/app/schema/SubmitProposalSchema";
import { Job } from "@prisma/client";
import { upload } from "@vercel/blob/client";
import { classNames, filterNumericInput, formatBytes } from "@/app/utils";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, AppState } from "../../messages/store";
import { JobType, ProposalDetailsType } from "@/app/types";
import { submitProposal, updateProposal } from "@/app/lib/api";
import { sendMessage } from "@/app/utils/chatUtils";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import Loader from "@/app/components/ui/shared/Loader";
import { useUserContext } from "@/app/providers/UserProvider";

const SubmitProposalForm = ({
  setOpen,
  jobDetails,
  proposal,
  handleJobTitleClick,
  fetchData,
}: {
  setOpen: (val: boolean) => void;
  jobDetails?: JobType;
  proposal?: ProposalDetailsType;
  handleJobTitleClick: () => void;
  fetchData?: () => void;
}) => {
  const router = useRouter();
  const { changeCurrentSection } = useFreelancerProposalContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useSelector((state: AppState) => state.token);
  const {
    register,
    setValue,
    watch,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<SubmitProposalType>({
    resolver: zodResolver(SubmitProposalSchema),
  });
  const { user } = useUserContext();

  const dispatch = useDispatch();
  const { setSearchParams, commit, getSearchParams } = useParamsManager();
  const { setNewConvoData } = bindActionCreators(actionCreators, dispatch);

  const link = getSearchParams("link");

  const onDrop = (acceptedFiles: any) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setValue("attachments", acceptedFiles[0], { shouldValidate: true });
      resetFileInputRefVal();
    }
  };

  const onSubmit: SubmitHandler<SubmitProposalType> = async (data) => {
    setIsSubmitting(true);
    const formData: Record<string, any> = {
      coverLeter: data.coverletter,
      rate: data.rate,
      jobId: jobDetails?.id,
    };

    if (data.attachments) {
      const newBlob = await upload(`proposals/${data.attachments?.name}`, data.attachments, {
        access: "public",
        handleUploadUrl: "/api/freelancer/jobs/proposals/attachment",
      });

      formData["attachments"] = newBlob.url;
    }
    // Explanation
    {
      /* In case we need to remove the current submitted proposal's attachment (while udpating proposal), we are setting the form value of attachments into an empty string. We are checking for an empty string in the update function, and setting the attachments to null in case we get the empty string. */
    }
    if (data.attachments === "") {
      formData["attachments"] = null;
    }

    let resp;
    if (proposal) {
      resp = await updateProposal(proposal.id, formData);
    } else {
      resp = await submitProposal(formData);
    }
    if (resp.error) {
      console.log(resp.error);
      return;
    } else {
      setSearchParams({ submitted: "true" });
      commit();
      // // TODO: Ensure the data is refreshed. We removed router.refresh, so need to test
      //// TODO:  Change data to real client name and email
      // setNewConvoData(proposalDetails.title, proposalDetails.createdBy?.email);
      // router.push("/messages");
      if (resp && !proposal) {
        try {
          const uniqueConversationTitle =
            "JOBID" + resp.job.id + "USERID" + resp.userId; // resp is the response of updateProposal / submitPorposal function call. The userId is the user id of the freelancer
          await sendMessage(token, {
            chatFriendlyName: `${resp.job.createdBy.firstName} ${resp.job.createdBy.lastName}`,
            chatUniqueName: uniqueConversationTitle,
            participantEmail: resp.job.createdBy.email,
            messageString: `A proposal has been submitted for your job posting "${resp.job.title}".\nCover Letter: ` + data.coverletter + `<a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/${resp.job.id}/proposals?status=SUBMITTED&proposalDetails=${resp.id}">View Proposal</a>`,
            extraAttributes: { jobTitle: resp.job.title, jobId: resp.job?.id },
          });

          await fetch("/api/mail", {
            method: "POST",
            body: JSON.stringify({
              to: resp.job.createdBy.email,
              from: "UberTalent<support@ubertalent.io>",
              subject: `Proposal received on UberTalent`,
              html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 20px;">
                            <h1 style="color: #333333; text-align: center;">Proposal Received</h1>
                            <p style="color: #333333;">Hi ${resp.job.createdBy.firstName},</p>
                            <p style="color: #333333;">${user.firstName} ${user.lastName} has sent a proposal for "${resp.job.title}".</p>
                            <p style="color: #333333;"><strong>Proposed Rate: </strong>${data.rate} USD</p>
                            <p style="color: #333333;"><strong>Cover Letter: </strong>${data.coverletter}</p>
                            <p style="color: #333333; text-align: center; margin: 30px;">
                              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/${resp.job.id}/proposals?status=SUBMITTED&proposalDetails=${resp.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Proposal</a>
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
      if (resp && proposal) {
        try {
          const uniqueConversationTitle =
            "JOBID" + resp.data.job.id + "USERID" + proposal.userId;
          await sendMessage(token, {
            chatFriendlyName: `${resp.data.job.createdBy.firstName} ${resp.data.job.createdBy.lastName}`,
            chatUniqueName: uniqueConversationTitle,
            participantEmail: resp.data.job.createdBy.email,
            messageString: `The proposal for your job posting "${resp.data.job.title}" has been updated.` + `<a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/${resp.data.job.id}/proposals?status=SUBMITTED&proposalDetails=${resp.data.id}">View Proposal</a>`,
            extraAttributes: { jobTitle: resp.data.job.title, jobId: resp.data?.job?.id },
          });
        } catch (err) {
          console.log("Err: ", err);
        }
      }
      setOpen(false);
      router.refresh();

      if (fetchData) {
        await fetchData();
      }
      // router.refresh();
      // setTimeout(() => {
      //   changeCurrentSection("Proposals");
      //   router.push("/freelancer-dashboard");
      // }, 1200);
    }
    setIsSubmitting(false);
  };

  const resetFileInputRefVal = () => {
    if (fileInputRef?.current?.value) {
      fileInputRef.current.value = "";
    }
  };

  const { attachments } = watch();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl"
    >
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between space-x-3">
            {jobDetails && <div className="space-y-1">
              <Dialog.Title className="text-xl font-semibold leading-6 text-gray-900">

                {(!proposal ? 'Submit' : 'Update')} a proposal for {" "}
                <span className="cursor-pointer" onClick={handleJobTitleClick}>
                  {jobDetails?.title}
                </span>
              </Dialog.Title>
              {!proposal && <p className="text-sm text-gray-500">
                Please provide your rate and the skillset you bring to this
                project.
              </p>}
              {link === 'jobdetails' && (
                <button type="button" onClick={() => setOpen(false)}
                  className="flex gap-x-1 items-center text-xs hover:text-gray-500">
                  <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Back to Job Details
                </button>
              )}
            </div>}
            <div className="flex h-7 items-center">
              <button
                type="button"
                className="relative text-gray-400 hover:text-gray-500"
                onClick={() => setOpen(false)}
              >
                <span className="absolute -inset-2.5" />
                <span className="sr-only">Close panel</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        {/* Divider container */}
        <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
          {/* Project name */}
          <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
            <div>
              <label
                htmlFor="rate"
                className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
              >
                Proposed hourly rate
                {/* {proposalDetails?.compType === "HOURLY" ? "rate" : "budget"} */}
              </label>
            </div>
            <div className="sm:col-span-1">
              <div className="relative  flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-black sm:max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  id="rate" disabled={isSubmitting}
                  className="remove-arrow block pl-7 flex-1 border-0 bg-transparent py-1.5 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6 focus:outline-0 px-3"
                  {...register("rate")}
                  defaultValue={
                    proposal?.rate
                  }
                  onInput={filterNumericInput}
                />
                {errors.rate && (
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ExclamationCircleIcon
                      className="h-5 w-5 text-red-500"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </div>
              {errors.rate && (
                <p className="mt-2 text-sm text-red-600" id="rate-error">
                  {errors.rate.message}
                </p>
              )}
            </div>
          </div>

          {/* Project coverletter */}
          <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
            <div>
              <label
                htmlFor="coverletter"
                className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
              >
                Cover letter
              </label>
            </div>
            <div className="sm:col-span-2">
              <textarea
                id="coverletter"
                rows={14} 
                disabled={isSubmitting}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                defaultValue={proposal?.coverLeter}
                {...register("coverletter")}
              />
              {errors.coverletter && (
                <p
                  className="mt-2 text-sm text-red-600"
                  id="cover-letter-error"
                >
                  {errors.coverletter.message}
                </p>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
            <div>
              <h3 className="text-sm font-medium leading-6 text-gray-900 flex flex-col ">
                <div>Attachments</div>
                <div>(optional)</div>
              </h3>
            </div>
            <div
              className="sm:col-span-2"
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(Array.from(e.dataTransfer.files));
              }}
            >
              <div
                className={classNames(
                  "mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10",
                  // Explanation
                  // We want to hide the upload UI if user has just uploaded an attachment using the input, or if the user is updating an already submitted proposal and there is an attachment already attached to the uploaded proposal.
                  // We are checking that the form value `attachments` is not empty while hiding the input. If it is empty, we will be showing the input as the empty value indicates that we want to remove the already uploaded attachment. (More explanation on this provided in the multiple explanation sections below) 
                  (attachments && attachments.name) || (proposal?.attachments && attachments != "")
                    ? "hidden"
                    : "flex"
                )}
              >
                <div className="text-center">
                  <PhotoIcon
                    className="mx-auto h-12 w-12 text-gray-300"
                    aria-hidden="true"
                  />
                  <>
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="attachments"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:text-black"
                      >
                        <span>Upload a file</span>
                        <input
                          id="attachments"
                          type="file"
                          className="sr-only"
                          disabled={isSubmitting}
                          onChange={(e) => {
                            if (e?.target?.files) {
                              clearErrors("attachments");
                              setValue("attachments", e.target.files[0], {
                                shouldValidate: true,
                              });
                              resetFileInputRefVal();
                            }
                          }}
                          ref={fileInputRef}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">
                      PNG, JPG, DOC, PDF, DOC, DOX up to 4.5 MB
                    </p>
                  </>
                </div>
              </div>
              {attachments && attachments.name && (
                <div className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                      <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon
                          className="h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                          <span className="truncate font-medium">
                            {attachments.name}
                          </span>
                          {attachments.size && (
                            <span className="flex-shrink-0 text-gray-400">
                              {formatBytes(attachments.size)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-shrink-0 space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            // Clearing out current value of file input, in case user changes file contents and then selects the same file.
                            // File input onChange do not work for the same file as previously selected
                            resetFileInputRefVal();
                            fileInputRef?.current?.click();
                          }}
                          className="rounded-md bg-white font-medium text-black hover:text-black"
                        >
                          Update
                        </button>
                        <span className="text-gray-200" aria-hidden="true">
                          |
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            clearErrors("attachments");
                            setValue("attachments", undefined);
                            // Clearing out current value of file input, in order to allow user to select the same file again.
                            //File input onChange do not work for the same file as previously selected
                            resetFileInputRefVal();
                          }}
                          className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  </div>
                </div>
              )}
              {errors.attachments &&
                typeof errors.attachments?.message === "string" && (
                  <p
                    className="mt-2 text-sm text-red-600"
                    id="attachments-error"
                  >
                    {errors.attachments.message}
                  </p>
                )}
              {/* Explanation */}
              {/* We want to show this attachment UI in the update proposal UI, in case there was an uploaded attachment. We want to hide the UI in case the form value of attachmetns is null i.e. user did not just upload a file using the file input.
              The second check (attachments != "") is being done because we are setting the form value 'attachments' to an empty string if we want to remove the already uploaded attachment (more explanation provided in the update function body), so we are checking if the form value attachments is an emoty string, and hiding the attachments UI in that case. */}
              {proposal?.attachments && !attachments && attachments != "" && (
                <div className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
                    <li className="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6">
                      <div className="flex w-0 flex-1 items-center">
                        <PaperClipIcon
                          className="h-5 w-5 flex-shrink-0 text-gray-400"
                          aria-hidden="true"
                        />
                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                          {/* {proposal.attachments} */}
                          Attachments
                        </div>
                      </div>
                      <div className="ml-4 flex flex-shrink-0 space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            // Clearing out current value of file input, in order to allow user to select the same file again.
                            //File input onChange do not work for the same file as previously selected
                            resetFileInputRefVal();
                            fileInputRef?.current?.click();
                          }}
                          className="rounded-md bg-white font-medium text-black hover:text-black"
                        >
                          Update
                        </button>
                        <span className="text-gray-200" aria-hidden="true">
                          |
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            clearErrors("attachments");
                            // Explanation
                            // Reason for setting the "attachments" form value to an empty string is explained in the update function                            setValue("attachments", "");
                            setValue("attachments", "");
                            resetFileInputRefVal();
                          }}
                          className="rounded-md bg-white font-medium text-gray-900 hover:text-gray-800"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
        <div className="flex justify-end space-x-3">
          <button
            type="button" 
            disabled={isSubmitting}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={classNames(
              "inline-flex items-center justify-center min-w-32 rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
              isSubmitting ? "opacity-70 cursor-wait" : "",
              !!errors?.attachments ? "opacity-50 cursor-not-allowed" : ""
            )}
            disabled={isSubmitting || !!errors?.attachments}
          >
            {isSubmitting ? (<Loader className="w-4 h-4 text-white animate-spin dark:white fill-rose-400"/>) : (proposal ? "Update Proposal" : "Submit Proposal")}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SubmitProposalForm;
