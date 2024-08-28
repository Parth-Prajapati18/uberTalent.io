"use client";
import { Fragment, useEffect, useState } from "react";
import { Dialog, Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Job } from "@prisma/client";
import { sendMessage } from "@/app/utils/chatUtils";
import { useSelector } from "react-redux";
import { JobInviteType } from "@/app/schema/FreelancerOnboardingSchema";
import { AppState } from "@/app/(pages)/(authenticated_pages)/messages/store";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import Image from "next/image";
import { classNames } from "@/app/utils";
import { getUserData, createJobInvite } from "@/app/lib/api";
import { useUserContext } from "@/app/providers/UserProvider";
import { SendJobInviteSchema, SendJobInviteType } from "@/app/schema/SendJobInviteSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formatMessage = (freelancerName: string = "", clientName: string = "") =>
  `Hello ${freelancerName},\n
I'd like to invite you to take a look at the job I've posted. Please submit a proposal if you're available and if this is of interest to you.\n
${clientName}`;

export default function InviteSlideout() {

  const { user } = useUserContext();
  
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);

  const [selectedJob, setSelectedJob] = useState<any>(undefined);

  const [freelancerData, setFreelancerData] = useState<any>({});

  const [defaultMessage, setDefaultMesssag] = useState("");

  const [isLoadingInvite, setIsLoadingInvite] = useState(false);

  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const [freelancerLastName, setFreelancerLastName] = useState("");

  const token = useSelector((state: AppState) => state.token);

  const { getSearchParams, deleteSearchParam, commit } = useParamsManager();

  const invite = getSearchParams("invite");
  const freelancerId = getSearchParams("freelancerId");

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<SendJobInviteType>({
    resolver: zodResolver(SendJobInviteSchema),
  });

  const getActiveJobs = async () => {
    try {
      const res = await fetch("/api/client/job/filter?status=ACTIVE");
      let data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data && Array.isArray(data)) {
        setActiveJobs(data);
        if (data.length === 1) {
          handleSelectedJob(data[0]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFreelancerData = async () => {
    if (!freelancerId) return;
    try {
      const res = await fetch(`/api/user/${freelancerId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if(data && Array.isArray(data.contract)) {
        const activeContract = data.contract.filter((c: any) => {
          return c.clientId === user.clientId && c.status === 'ACTIVE';
        });
        if(activeContract.length) {
          setFreelancerLastName(data.lastName);
        } else {
          setFreelancerLastName("");
        }
      }
      setFreelancerData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const disableJob = () => {
    const data: any = activeJobs.map((d: any) => {
      let isProposalReceived = false;
      if (Array.isArray(d.proposal)) {
        const findUser = d.proposal.find((p: any) => p.userId === freelancerId);
        isProposalReceived = findUser !== undefined;
      }
      d.isProposalReceived = isProposalReceived;
      d.isInvited = freelancerData.jobInvites.some((ji: JobInviteType) => ji.jobId === d.id);
      d.isDisabled = d.isProposalReceived || d.isInvited;
      return d;
    })
    setActiveJobs(data);
  }

  useEffect(() => {
    setValue("selectedJob", "");
    setValue("message", "");
    getActiveJobs();
  }, [freelancerId]);

  useEffect(() => {
    getFreelancerData();
  }, [freelancerId, user]);

  useEffect(() => {
    async function setMessageFreelancerData() {
      const currentUser = await getUserData();
      if (freelancerData.firstName) {
        let temp = formatMessage(
          freelancerData.firstName,
          `${currentUser.firstName} ${currentUser.lastName}`
        );
        handleMessage(temp);
      }
    }
    setMessageFreelancerData();
    disableJob();
  }, [freelancerData]);

  const handleSelectedJob = (job: any) => {
    setValue("selectedJob", job?.id);
    setSelectedJob(job);
    clearErrors("selectedJob");
  }

  const handleMessage = (message: any) => {
    setValue("message", message);
    setDefaultMesssag(message);
  }

  const onSubmit = async (data: SendJobInviteType) => {
    setIsLoadingInvite(true);
    let messageString = `${data.message}`;
    messageString += `<a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/messages?jobId=${selectedJob.id}">View Invite</a>`;
    const uniqueConversationTitle = "JOBID" + selectedJob.id + "USERID" + freelancerData.id;

    const resp = await createJobInvite(
      freelancerData.id,
      data.selectedJob,
      messageString
    );
    if (!resp.error) {
      try {
        await sendMessage(token, {
          chatFriendlyName: `${freelancerData.firstName} ${freelancerData.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: freelancerData.email,
          messageString: messageString,
          extraAttributes: {
            jobTitle:
              activeJobs.find((job) => job.id == selectedJob.id)?.title || "",
            jobId: selectedJob.id,
          },
        });
        await fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: freelancerData.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Invitation to Submit Proposal on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Congrats! You have been invited to submit a proposal!</h1>
                          <p style="color: #333333;">Hi ${freelancerData.firstName},</p>
                          <p style="color: #333333;">Read more about the job below and submit a proposal if you are interested.</p>
                          <p style="color: #666666;">Job Details:</p>
                          <p style="color: #333333;"><strong>${selectedJob.title} - ($${selectedJob.hourlyMinRate} - ${selectedJob.hourlyMaxRate})</strong></p>
                          <p style="color: #333333; text-align: center; margin: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/job/search?jobId=${selectedJob.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Invite</a>
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
        setSuccessModalOpen(true);
      } catch (err) {
        console.log(err);
        closeModal();
      } finally {
        setIsLoadingInvite(false);
        handleSelectedJob(undefined);
      }
    }
  };

  const closeModal = () => {
    deleteSearchParam("invite");
    deleteSearchParam("freelancerId");
    handleMessage("");
    handleSelectedJob(undefined);
    commit();
  };

  return (
    <>
      <Transition.Root show={!!invite && !!freelancerId} as={Fragment}>
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
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl"
                    >
                      <div className="h-0 flex-1 overflow-y-auto">
                        <div className="bg-black px-4 py-6 sm:px-6">
                          <div className="flex items-center justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-white">
                              Invite To Job
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
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div className="divide-y divide-gray-200 px-4 sm:px-6">
                            <div className="space-y-6 pb-5 pt-6">
                              {/* New Block */}
                              <div className="sm:col-span-3">
                                <div className="mt-2">
                                  <Listbox value={selectedJob} onChange={handleSelectedJob} by="id">
                                    {({ open }) => (
                                      <>
                                        <Listbox.Label className="block text-sm font-medium leading-6 text-gray-900">
                                          Select a job
                                        </Listbox.Label>

                                        <div className="realative mt-2">
                                          <Listbox.Button className={classNames("relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 sm:text-sm sm:leading-6")}>
                                            <span className="flex items-center">
                                              <span className="ml-3 block truncate">
                                                {selectedJob?.title ? selectedJob?.title : 'Select a job'}
                                              </span>
                                            </span>
                                            <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                              <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </span>
                                          </Listbox.Button>
                                          <Transition
                                            show={open}
                                            as={Fragment}
                                            leave="transition ease-in duration-100"
                                            leaveFrom="opacity-100"
                                            leaveTo="opacity-0"
                                          >
                                            <Listbox.Options className="sticky z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                              {activeJobs.map((job: any) => (
                                                <Listbox.Option
                                                  key={job.id}
                                                  className={({ active }) =>
                                                    classNames(
                                                      active ? 'bg-black text-white' : 'text-gray-900', 
                                                      'relative cursor-default select-none py-2 pl-3 pr-9'
                                                    )
                                                  }
                                                  value={job}
                                                  disabled={job.isDisabled}
                                                >
                                                  {({ selected, active }) => (
                                                    <>
                                                      <div className="flex items-center">
                                                        <span
                                                          className={classNames(
                                                            selected ? 'font-semibold' : 'font-normal',
                                                            job.isDisabled ? 'text-gray-400' : '',
                                                            'ml-3 block truncate'
                                                          )}
                                                        >
                                                          {job.title}
                                                        </span>
                                                      </div>
                                                      {selected && (
                                                        <span
                                                          className={classNames(
                                                            active ? 'text-white' : 'text-black',
                                                            'absolute inset-y-0 right-0 flex items-center pr-4'
                                                          )}
                                                        >
                                                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                        </span>
                                                      )}
                                                      {job.isDisabled && (
                                                        <span
                                                          className={'text-black absolute inset-y-0 right-0 flex items-center pr-4'}
                                                        >
                                                          {job?.isProposalReceived ? 'Proposal Received' : 'Invited'}
                                                        </span>
                                                      )}
                                                    </>
                                                  )}
                                                </Listbox.Option>
                                              ))}
                                            </Listbox.Options>
                                          </Transition>
                                        </div>
                                      </>
                                    )}
                                  </Listbox>
                                  {errors.selectedJob && (
                                    <p
                                      className="mt-2 text-sm text-red-600"
                                      id="email-error"
                                    >
                                      {errors.selectedJob.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <label
                                  htmlFor="Message"
                                  className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                  Message
                                </label>
                                <div className="mt-2">
                                  <textarea
                                    id="message"
                                    rows={16}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                    defaultValue={defaultMessage}
                                    {...register("message")}
                                  />
                                  {errors.message && (
                                    <p
                                      className="mt-2 text-sm text-red-600"
                                      id="email-error"
                                    >
                                      {errors.message.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-medium leading-6 text-gray-900">
                                  Freelancer
                                </h3>
                                <div className="mt-2 flex gap-x-3 items-center">
                                  {freelancerData?.profileImg ? (<Image
                                    src={freelancerData?.profileImg || ""}
                                    className="rounded-full"
                                    alt=""
                                    width={36}
                                    height={36}
                                  />) : (<div className="h-12 w-12"><UserCircleIcon /></div>)}
                                  <div className="flex flex-col gap-y-1 leading-none">
                                    <div>
                                      {`${freelancerData?.firstName}${freelancerLastName ? ' ' + freelancerLastName : ''}`}
                                    </div>
                                    <small>
                                      {freelancerData?.freelancerProfile?.title}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 justify-end px-4 py-4">
                        <button
                          type="button"
                          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          onClick={closeModal}>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoadingInvite}
                          className={classNames(
                            "ml-4 inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black",
                            isLoadingInvite
                              ? "opacity-50 cursor-wait"
                              : "opacity-100 cursor-pointer"
                          )}
                        >
                          Invite
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      {/* Successful Invitation Modal */}
      <Transition.Root show={successModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setSuccessModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        Freelancer Invited
                      </Dialog.Title>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      onClick={() => {
                        setSuccessModalOpen(false);
                        closeModal();
                      }}
                    >
                      Back to Freelancers
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
