"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { JobCompType } from "@prisma/client";
import { upload } from "@vercel/blob/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, Transition } from "@headlessui/react";
import { SubmitHandler, useForm } from "react-hook-form";

import { CreateContractData, ContractDetailsType } from "@/app/types";
import {
  PhotoIcon,
  XMarkIcon,
  PaperClipIcon,
  CalendarDaysIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CreateContractSchema,
  CreateContractType,
} from "@/app/schema/CreateContractSchema";
import { classNames, filterNumericInput, formatBytes } from "@/app/utils";
import Loader from "@/app/components/ui/shared/Loader";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import {
  AppState,
  actionCreators,
} from "@/app/(pages)/(authenticated_pages)/messages/store";
import { sendMessage } from "@/app/utils/chatUtils";
import { getContractById, updateContract } from "@/app/lib/api";

export default function UpdateContractSlideout() {
  const token = useSelector((state: AppState) => state.token);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [compType, setCompType] = useState<JobCompType>("HOURLY");
  const [contractData, setContractData] = useState<ContractDetailsType | null>(
    null
  );
  const [isContractDataLoading, setIsContractDataLoading] =
    useState<boolean>(false);
  const { getSearchParams, deleteSearchParam, commit } = useParamsManager();
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    reset,
    watch,
    register,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateContractType>({
    resolver: zodResolver(CreateContractSchema),
  });

  const update = getSearchParams("update");
  const contractId = getSearchParams("contractId");
  const rehire = getSearchParams("rehire");
  const isHourlyCompType = compType === "HOURLY";
  const { attachments } = watch();

  const dispatch = useDispatch();
  const { setNewConvoData } = bindActionCreators(actionCreators, dispatch);

  async function getContractData() {
    if (contractId) {
      setIsContractDataLoading(true);
      const { data, error } = await getContractById(contractId);
      if (!data || error) {
        alert("Error occured while fetching proposal data");
        closeModal();
      } else {
        setContractData(data);
        console.log("contract data: ", data);
      }
      setIsContractDataLoading(false);
    }
  }

  useEffect(() => {
    getContractData();
  }, [contractId]);

  function closeModal() {
    deleteSearchParam("contractId");
    deleteSearchParam("update");
    deleteSearchParam("rehire");
    commit();
    reset();
  }

  const onSubmit: SubmitHandler<CreateContractData> = async (data) => {
    setIsSubmitting(true);
    const formData: CreateContractData = {
      status: contractData?.status === "ACTIVE" ? "ACTIVE" : "PENDING",
      hourlyRate: data.hourlyRate,
      projectCost: data.projectCost,
      endDate: data.endDate,
      weeklyLimit: data.weeklyLimit,
      title: data.title,
      description: data.description,
      type: compType,
      paymentService: contractData?.status === 'PENDING' ? !data.paymentService : contractData?.paymentService
    };

    if (rehire === "true") {
      formData["rehire"] = true;
      formData["proposalId"] = contractData?.proposal?.id || "";
    }

    if (data.attachments) {
      const newBlob = await upload(
        `contracts/${data.attachments?.name}`,
        data.attachments,
        {
          access: "public",
          handleUploadUrl: "/api/contracts/attachment",
        }
      );
      formData.attachments = newBlob.url;
    }

    const resp = await updateContract(contractId || "", formData);
    if (resp.error) {
      console.log(resp.error);
      return;
    } else {
      if (contractData && contractData?.status !== "ACTIVE") {
        const uniqueConversationTitle =
          "JOBID" +
          contractData?.job.id +
          "USERID" +
          contractData?.freelancer.id;
        await sendMessage(token, {
          chatFriendlyName: `${contractData?.freelancer.firstName} ${contractData?.freelancer.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: contractData?.freelancer.email,
          messageString: `The offer received for the "${contractData?.job.title}" has been updated. <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-dashboard?l1Tab=Offers&contractStatus=PENDING&contractId=${contractData?.id}">View Offer</a>`,
          extraAttributes: {
            jobTitle: contractData?.job.title,
            jobId: contractData?.job?.id,
          },
        });

        await fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: contractData?.freelancer.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Offer Updated on UberTalent`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 20px;">
                            <h1 style="color: #333333; text-align: center;">Offer Updated</h1>
                            <p style="color: #333333;">Hi ${contractData?.freelancer.firstName},</p>
                            <p style="color: #333333;">The offer for the job "${contractData?.job.title}" has been updated.</p>
                            <p style="color: #666666;">Offer Details:</p>
                            <p style="color: #333333;"><strong>Client: </strong>${contractData?.job.createdBy?.firstName} ${contractData?.job.createdBy?.lastName}</p>
                            <p style="color: #333333;"><strong>Contract Title: </strong>${contractData?.title}</p>
                            <p style="color: #333333;"><strong>Hourly Rate: </strong>${data.hourlyRate} USD</p>
                            <p style="color: #333333;"><strong>Weekly Limit: </strong>${data.weeklyLimit} Hours</p>
                            <p style="color: #333333; text-align: center; margin: 30px;">
                              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-dashboard?l1Tab=Offers&contractStatus=PENDING&contractId=${resp.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Offer</a>
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
      if (contractData && contractData?.status === "ACTIVE") {
        let companyName = contractData.client.companyName;
        if (!companyName) {
          companyName = `${contractData.client.user[0].firstName} ${contractData.client.user[0].lastName}`;
        }
        const uniqueConversationTitle =
          "JOBID" +
          contractData?.job.id +
          "USERID" +
          contractData?.freelancer.id;
        const messageString = `Your contract details have been updated.\nNew Rate: ${formData?.hourlyRate} USD.\nNew Weekly Limit: ${formData?.weeklyLimit} Hours.\nAny rate changes will apply to timesheets starting the next billing cycle.\nPlease review your contract for the updated terms.\n<a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-dashboard?l1Tab=Contracts&contractStatus=ACTIVE&contractId=${contractData?.id}">View Contract</a>`;
        await sendMessage(token, {
          chatFriendlyName: `${contractData?.freelancer.firstName} ${contractData?.freelancer.lastName}`,
          chatUniqueName: uniqueConversationTitle,
          participantEmail: contractData?.freelancer.email,
          messageString,
          extraAttributes: {
            jobTitle: contractData?.job.title,
            jobId: contractData?.job?.id,
          },
        });
        await fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: contractData?.freelancer.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Your Contract Details Have Been Updated`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 20px;">
                            <h1 style="color: #333333; text-align: center;">Contract Updated</h1>
                            <p style="color: #333333;">Hello ${contractData?.freelancer.firstName},</p>
                            <p style="color: #333333;">We wanted to inform you that your contract details have been updated for the contract "${contractData?.title}" with  ${companyName}.</p>
                            <p style="color: #666666;">The new terms are as follows:</p>
                            <p style="color: #333333;"><strong>New Rate: </strong>${formData?.hourlyRate} USD.</p>
                            <p style="color: #333333;"><strong>New Weekly Limit: </strong>${formData?.weeklyLimit} Hours.</p>
                            <p style="color: #333333;">Any rate changes will apply to timesheets starting the next billing cycle.</p>
                            <p style="color: #333333;">Please review your contract for the updated terms. If you have any questions or concerns, feel free to reach out.</p>
                            <p style="color: #333333; text-align: center; margin: 30px;">
                              <a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/freelancer-dashboard?l1Tab=Contracts&contractStatus=ACTIVE&contractId=${resp.id}" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">View Contract</a>
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
      closeModal();
      router.refresh();
    }
    setIsSubmitting(false);
  };

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!e.dataTransfer?.files) return;

    if (e.dataTransfer?.files.length > 1) {
      setError("attachments", {
        message: "Please upload a single file",
      });
      return;
    } else {
      clearErrors("attachments");
      setValue("attachments", e.dataTransfer?.files[0]);
    }
  }

  useEffect(() => {
    if (attachments) {
      let fileSize = attachments.size;
      if (!fileSize || typeof fileSize !== "number") {
        setValue("attachments", undefined);
        setError("attachments", {
          message: "File format not supported",
        });
      }
      let sizeInMb = fileSize / 1048576;
      if (sizeInMb > 4.5) {
        setValue("attachments", undefined);
        setError("attachments", {
          message: "File size must be less than 4.5 MB",
        });
      }
    }
  }, [attachments]);

  useEffect(() => {
    if (!contractData || !contractData.job) return;
    setCompType(contractData?.job?.compType);
    setValue("type", contractData?.job?.compType);
  }, [contractData?.job]);

  useEffect(() => {
    if (contractData) {
      setValue("hourlyRate", contractData?.rate);
      setValue("projectCost", contractData?.job?.projectCost || 0);
      setValue("weeklyLimit", contractData?.weeklyLimit);
      setValue("description", contractData?.description || "");
      setValue("paymentService", !contractData?.paymentService);
    }
  }, [contractData]);

  return (
    <Transition.Root show={!!update} as={Fragment}>
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
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {isContractDataLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader />
                      </div>
                    ) : (
                      <>
                        <div className="px-4 py-6 sm:px-6">
                          <div className="flex items-start justify-between">
                            <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                              {contractData?.status === "ACTIVE"
                                ? "Update Contract"
                                : rehire === "true"
                                ? "Resend Offer"
                                : "Update Offer"}
                            </Dialog.Title>
                            <div className="ml-3 flex h-7 items-center">
                              <button
                                type="button"
                                className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-gray-500"
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
                        <div className="divide-y divide-gray-200">
                          <div className="pb-6">
                            <div className="h-24 bg-black sm:h-20 lg:h-28" />
                            <div className="-mt-12 flow-root px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 lg:-mt-16">
                              <div className="-m-1 flex">
                                <div className="inline-flex overflow-hidden rounded-lg border-4 border-white h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48">
                                  {contractData?.freelancer?.profileImg ? (
                                    <Image
                                      className="!relative"
                                      src={
                                        contractData?.freelancer?.profileImg ||
                                        ""
                                      }
                                      alt=""
                                      fill
                                    />
                                  ) : (
                                    <div className="bg-white w-full h-full">
                                      <UserCircleIcon />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mt-6 sm:ml-6 sm:flex-1">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                      {contractData?.freelancer?.firstName}{" "}
                                      {contractData?.freelancer?.lastName}
                                    </h3>
                                    <span className="ml-2.5 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-green-400">
                                      <span className="sr-only">Online</span>
                                    </span>
                                  </div>
                                </div>
                                <p>
                                  Contract For:{" "}
                                  <Link
                                    href={`/job/${contractData?.jobId}`}
                                    className="underline font-medium"
                                  >
                                    {contractData?.title}
                                  </Link>
                                </p>
                              </div>
                            </div>
                          </div>
                          <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="sm:flex items-center pl-4 sm:pl-0 py-4 sm:py-0">
                              <p className="!border-0 sm:flex sm:px-6 sm:py-5 text-gray-700 text-lg font-semibold">
                                <div className="sm:w-40 sm:flex-shrink-0 lg:w-48">
                                  Contract Terms
                                </div>
                              </p>
                              {/* <span className="isolate inline-flex rounded-md shadow-sm mt-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompType("HOURLY");
                                    setValue("type", "HOURLY");
                                  }}
                                  className={classNames(
                                    "relative inline-flex items-center rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300  focus:z-10",
                                    compType === "HOURLY"
                                      ? "bg-zinc-300"
                                      : "hover:bg-gray-50"
                                  )}
                                >
                                  Hourly Rate
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCompType("FIXED");
                                    setValue("type", "FIXED");
                                  }}
                                  className={classNames(
                                    "relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-10",
                                    compType === "FIXED"
                                      ? "bg-zinc-300"
                                      : "hover:bg-gray-50"
                                  )}
                                >
                                  Fixed Price
                                </button>
                              </span> */}
                            </div>

                            <div className="px-4 py-5 sm:px-0 sm:py-0">
                              <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200">
                                <div className="flex-col sm:px-6 sm:py-5">
                                  {isHourlyCompType ? (
                                    <div className="flex items-center">
                                      <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                        Hourly Rate
                                      </dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                        <div className="relative mt-2 rounded-md shadow-sm">
                                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-gray-500 sm:text-sm">
                                              $
                                            </span>
                                          </div>
                                          <input
                                            type="text"
                                            {...register("hourlyRate")}
                                            id="hourly-rate"
                                            className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                            placeholder="0.00"
                                            aria-describedby="price-currency"
                                            defaultValue={contractData?.rate}
                                            onInput={filterNumericInput}
                                          />
                                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span
                                              className="text-gray-500 sm:text-sm"
                                              id="price-currency"
                                            >
                                              USD
                                            </span>
                                          </div>
                                        </div>
                                        {contractData?.status === "ACTIVE" && (
                                          <p className="mt-2 text-sm text-gray-500">
                                            Any changes to the rate will take
                                            effect starting from the next
                                            week&apos;s timesheet.
                                          </p>
                                        )}
                                        {errors.hourlyRate && (
                                          <p
                                            className="mt-2 text-sm text-red-600"
                                            id="hourlyRate-error"
                                          >
                                            {errors.hourlyRate.message}
                                          </p>
                                        )}
                                      </dd>
                                    </div>
                                  ) : (
                                    <div>
                                      <div className="flex items-center">
                                        <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                          Project fixed price
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                          <div className="relative mt-2 rounded-md shadow-sm">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                              <span className="text-gray-500 sm:text-sm">
                                                $
                                              </span>
                                            </div>
                                            <input
                                              type="text"
                                              {...register("projectCost")}
                                              id="project-cost"
                                              className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                              placeholder="0.00"
                                              aria-describedby="price-currency"
                                              defaultValue={
                                                contractData?.job.projectCost ||
                                                0
                                              }
                                            />
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                              <span
                                                className="text-gray-500 sm:text-sm"
                                                id="price-currency"
                                              >
                                                USD
                                              </span>
                                            </div>
                                          </div>
                                          {contractData?.status ===
                                            "ACTIVE" && (
                                            <p className="mt-2 text-sm text-gray-500">
                                              Any changes to the rate will take
                                              effect starting from the next
                                              week&apos;s timesheet.
                                            </p>
                                          )}
                                          {errors.projectCost && (
                                            <p
                                              className="mt-2 text-sm text-red-600"
                                              id="projectCost-error"
                                            >
                                              {errors.projectCost.message}
                                            </p>
                                          )}
                                        </dd>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="sm:flex sm:px-6 sm:py-5">
                                  {isHourlyCompType ? (
                                    <div className="flex items-center">
                                      <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                        Weekly Limit
                                      </dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                        <select
                                          id="weeklyLimit"
                                          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-black sm:text-sm sm:leading-6"
                                          defaultValue={
                                            contractData?.weeklyLimit
                                          }
                                          {...register("weeklyLimit")}
                                        >
                                          <option value={160}>No Limit</option>
                                          <option value={5}>5 hrs/week</option>
                                          <option value={15}>
                                            15 hrs/week
                                          </option>
                                          <option value={20}>
                                            20 hrs/week
                                          </option>
                                          <option value={25}>
                                            25 hrs/week
                                          </option>
                                          <option value={30}>
                                            30 hrs/week
                                          </option>
                                          <option value={35}>
                                            35 hrs/week
                                          </option>
                                          <option value={40}>
                                            40 hrs/week
                                          </option>
                                          <option value={160}>
                                            Not ready to set
                                          </option>
                                        </select>

                                        {errors.weeklyLimit && (
                                          <p
                                            className="mt-2 text-sm text-red-600"
                                            id="weeklyLimit-error"
                                          >
                                            {errors.weeklyLimit.message}
                                          </p>
                                        )}
                                      </dd>
                                    </div>
                                  ) : (
                                    <div className="flex items-center">
                                      <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                        Due Date
                                      </dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0">
                                        <div>
                                          <div className="relative mt-2 rounded-md shadow-sm">
                                            <input
                                              type="date"
                                              className="block w-full rounded-md border-0 py-1.5 pr-10  text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 custom-date-picker"
                                              id="endDate"
                                              placeholder="MM/DD/YYYY"
                                              {...register("endDate")}
                                            />

                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                              <CalendarDaysIcon
                                                className="h-5 w-5 text-gray-400"
                                                aria-hidden="true"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                        {errors.endDate && (
                                          <p
                                            className="mt-2 text-sm text-red-600"
                                            id="endDate-error"
                                          >
                                            {errors.endDate.message}
                                          </p>
                                        )}
                                      </dd>
                                    </div>
                                  )}
                                </div>
                              </dl>
                            </div>

                            {/* PRofile Details */}
                            <p className="!border-0 sm:flex sm:px-6 sm:py-5 text-gray-700 text-lg mt-10 font-semibold  pl-4 py-4">
                              Work Details
                            </p>
                            <dl className="space-y-8 sm:space-y-0 sm:divide-y sm:divide-gray-200  px-4 sm:px-0 pb-4">
                              <div className="sm:flex sm:px-6 sm:py-5">
                                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                  Work Description
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0 relative">
                                  <textarea
                                    id="description"
                                    rows={12}
                                    className="block w-full sm:w-96 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                                    {...register("description")}
                                    defaultValue={
                                      contractData?.description || ""
                                    }
                                  />
                                  {errors.description && (
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                      <ExclamationCircleIcon
                                        className="h-5 w-5 text-red-500"
                                        aria-hidden="true"
                                      />
                                    </div>
                                  )}
                                  {errors.description && (
                                    <p
                                      className="mt-2 text-sm text-red-600"
                                      id="description-error"
                                    >
                                      {errors.description.message}
                                    </p>
                                  )}
                                </dd>
                              </div>

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
                                  onDrop={handleDrop}
                                >
                                  <div
                                    className={classNames(
                                      "mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-5",
                                      attachments && attachments.name
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
                                        <div className="mt-4 sm:flex text-sm leading-6 text-gray-600">
                                          <label
                                            htmlFor="attachments"
                                            className="relative cursor-pointer rounded-md bg-white font-semibold text-black focus-within:outline-none focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-2 hover:text-black"
                                          >
                                            <span>Upload a file</span>
                                            <input
                                              id="attachments"
                                              type="file"
                                              className="sr-only"
                                              onChange={(e) => {
                                                if (e?.target?.files) {
                                                  clearErrors("attachments");
                                                  setValue(
                                                    "attachments",
                                                    e.target.files[0]
                                                  );
                                                }
                                              }}
                                              ref={fileInputRef}
                                            />
                                          </label>
                                          <p className="pl-1">
                                            or drag and drop
                                          </p>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-600">
                                          PNG, JPG, DOC, PDF up to 4.5 MB
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
                                                  {formatBytes(
                                                    attachments.size
                                                  )}
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
                                                if (
                                                  fileInputRef?.current?.value
                                                ) {
                                                  fileInputRef.current.value =
                                                    "";
                                                }
                                                fileInputRef?.current?.click();
                                              }}
                                              className="rounded-md bg-white font-medium text-black hover:text-black"
                                            >
                                              Update
                                            </button>
                                            <span
                                              className="text-gray-200"
                                              aria-hidden="true"
                                            >
                                              |
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setValue(
                                                  "attachments",
                                                  undefined
                                                );
                                                // Clearing out current value of file input, in order to allow user to select the same file again.
                                                //File input onChange do not work for the same file as previously selected
                                                if (
                                                  fileInputRef?.current?.value
                                                )
                                                  fileInputRef.current.value =
                                                    "";
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
                                    typeof errors.attachments?.message ===
                                      "string" && (
                                      <p
                                        className="mt-2 text-sm text-red-600"
                                        id="attachments-error"
                                      >
                                        {errors.attachments.message}
                                      </p>
                                    )}
                                </div>
                              </div>
                              {contractData?.status === 'PENDING' &&
                                <div className="sm:flex sm:px-6 sm:py-5">
                                <dt className="text-sm font-medium text-gray-500 sm:w-40 sm:flex-shrink-0 lg:w-48">
                                  Payment Method
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:ml-6 sm:mt-0 relative">
                                  <div className="flex items-start">
                                    <div className="flex h-6 items-center">
                                      <input
                                        type="checkbox"
                                        {...register("paymentService")}
                                        defaultChecked={!(contractData?.paymentService)}
                                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                                      />
                                    </div>
                                    <div className="ml-3 text-sm leading-6">
                                      <p className="text-gray-600">
                                      Opt out of Ubertalent payment processing
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        *By opting out, you and the freelancer agree to process payments independently of our platform.
                                        </p>
                                    </div>
                                  </div>
                                </dd>
                              </div>
                              }
                            </dl>

                            <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                              <div className="flex justify-end space-x-3">
                                <button
                                  type="button"
                                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                  onClick={closeModal}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  className={classNames(
                                    "inline-flex justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black w-20",
                                    isSubmitting ? "opacity-70 cursor-wait" : ""
                                  )}
                                  disabled={isSubmitting}
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </form>
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
