"use client";
import React, { useEffect, useState } from "react";
import { classNames, returnFormattedDate } from "@/app/utils";
import Toggle from "@/app/components/ui/shared/Toggle";
import EmptyState from "@/app/components/ui/shared/EmptyState";
import SectionContainer from "@/app/components/ui/shared/SectionContainer";
import { ContractsWithJobClientFreelancerData } from "@/app/types";
import ContractSlideout from "@/app/components/ui/shared/slideout/ContractSlideout";
import { useFreelancerContractContext } from "@/app/providers/FreelancerContractProvider";
import useParamsManager from "@/app/components/hooks/useParamsManager";
import { useRouter } from "next/navigation";
import Loader from "@/app/components/ui/shared/Loader";
import UpdateContractSlideout from "@/app/components/ui/shared/slideout/UpdateContractSlideout";
import { getAllContract, updateContractStatus } from "@/app/lib/api";
import { useSelector } from "react-redux";
import { AppState } from "../../messages/store";
import { sendMessage } from "@/app/utils/chatUtils";
import CloseContractDialog from "@/app/components/ui/shared/CloseContractDialog";

type Status = "Active" | "Draft" | "Closed";

const Contracts = () => {
  const router = useRouter();
  const { setSearchParams, commit, getSearchParams } = useParamsManager();
  const { currentSection, changeCurrentSection, tabs } =
    useFreelancerContractContext();
  // const [currentTab, setCurrentTab] = useState(tabs[0].value);
  const [showJobPosts, setShowJobPosts] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [contractDetails, setContractDetails] =
    useState<ContractsWithJobClientFreelancerData>();

  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<
    ContractsWithJobClientFreelancerData[]
  >([]);
  const token = useSelector((state: AppState) => state.token);
  const [count, setCount] = useState<any>();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isContractUpdated, setIsContractUpdated] = useState(false);
  const contractUpdate = getSearchParams("update");

  const getContracts = async () => {
    try {
      setIsLoading(true);
      const response = await getAllContract();
      if (response.isError) {
        console.error("Error fetching Contracts:", response);
        alert("Something went wrong");
        return;
      }
      setContracts(response.data.contracts);
      setCount({ACTIVE: response.data.activeCount, COMPLETED: response.data.completedCount});
    } catch (error) {
      console.error("Error fetching Contracts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getContracts();
  }, []);

  useEffect(() => {
    if(contractUpdate==="true") {
      setIsContractUpdated(contractUpdate==="true");
    } else if(isContractUpdated) {
      setIsContractUpdated(false);
      getContracts();
    }
  }, [contractUpdate]);

  const contractToView: any = getSearchParams("contractDetails");
  useEffect(() => {
    if(contractToView && contracts && Array.isArray(contracts)) {
      const arr = contracts.filter(contract => contract.id === contractToView);
      if(arr.length > 0) {
        setContractDetails(arr[0]);
        setShowDetails(true);
      }
    }
  }, [contractToView, contracts])

  function handleSelect(data: ContractsWithJobClientFreelancerData) {
    setContractDetails(data);
    setShowDetails(true);
  }

  // function onChange(val: string) {
  //   setCurrentTab(val);
  // }

  const handleEndContractClick = () => {
    setShowDialog(true);
  };

  const handleContractAction = async (contractId: string, type: string) => {
    if (type === "close") {
      await updateContractStatus(contractId, "COMPLETED");
      setShowDialog(false);
      const messageString = `The contract for the job "${contractDetails?.job?.title}" has ended.`;
      const uniqueConversationTitle =
        "JOBID" +
        contractDetails?.job.id +
        "USERID" +
        contractDetails?.freelancerId;
      await sendMessage(token, {
        chatFriendlyName: `${contractDetails?.freelancer?.firstName} ${contractDetails?.freelancer?.lastName}`,
        chatUniqueName: uniqueConversationTitle,
        participantEmail: contractDetails?.freelancer?.email || "",
        messageString: messageString,
        extraAttributes: {
          jobTitle: contractDetails?.job.title || "",
          jobId: contractDetails?.job.id || "",
        },
      });
      await fetch("/api/mail", {
        method: "POST",
        body: JSON.stringify({
          to: contractDetails?.freelancer?.email,
          from: "UberTalent<support@ubertalent.io>",
          subject: `Contract Ended on UberTalent`,
          html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                  <tr>
                      <td style="padding: 20px;">
                          <h1 style="color: #333333; text-align: center;">Contract Ended</h1>
                          <p style="color: #333333;">Hi ${contractDetails?.freelancer?.firstName} ${contractDetails?.freelancer?.lastName},</p>
                          <p style="color: #333333;">The contract for the job "${contractDetails?.job?.title}" has ended.</p>
                          <p style="color: #666666;">Contract Details:</p>
                          <p style="color: #333333;"><strong>Client: </strong>${contractDetails?.client.companyName ? contractDetails?.client.companyName : `${contractDetails?.client.user[0].firstName} ${contractDetails?.client.user[0].lastName}`}</p>
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
      setContracts((prevContract) => {
        return prevContract.map((contract) => {
          if (contract.id === contractId) {
            return { ...contract, status: "COMPLETED" };
          }
          return contract;
        });
      });

      changeCurrentSection("COMPLETED");
      setShowDetails(false);
      router.refresh();
    } else if (type === "update") {
      setShowDetails(false);
      setSearchParams({
        contractId: contractId,
        hire: "true",
      });
      commit();
    }
    await getContracts();
  };

  const isCompleted = currentSection === "COMPLETED";
  const updateContract = (contract: any) => {
    setContracts((prevState) =>
      prevState.map((obj) => (obj.id === contract.id ? contract : obj))
    );
  };
  return (
    <>
      <div className="relative border-b border-gray-200 pb-5 sm:pb-0 mt-7">
        <div className="md:flex md:items-center md:justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Contracts
          </h3>
          <div className="mt-3 flex md:absolute md:right-0 md:top-3 md:mt-0">
            {/* <div className="pt-2">
              <Toggle enabled={showJobPosts} setEnabled={setShowJobPosts} />
            </div> */}
          </div>
        </div>
        <div className="mt-4">
          <div className="sm:hidden">
            <label htmlFor="current-tab" className="sr-only">
              Select a tab
            </label>
            <select
              id="current-tab"
              name="current-tab"
              onChange={(event) => changeCurrentSection(event.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-black"
              value={currentSection}
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.value}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  onClick={() => changeCurrentSection(tab.value)}
                  className={classNames(
                    tab.value === currentSection
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium cursor-pointer"
                  )}
                  aria-current={
                    tab.name === currentSection ? "page" : undefined
                  }
                >
                  {tab.name}
                  {count ? (
                    <span
                      className={classNames(
                        tab.value === currentSection
                          ? "bg-gray-100 text-black"
                          : "bg-gray-100 text-gray-900",
                        "ml-3 hidden rounded-full px-2.5 py-0.5 text-xs font-medium md:inline-block"
                      )}
                    >
                      {count[tab.value] || 0}
                    </span>
                  ) : null}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
      {contracts.filter((contract) => contract.status === currentSection)
        .length > 0 ? (
        <>
          <div className="-mx-4 mt-10 ring-1 ring-gray-300 sm:mx-0 sm:rounded-lg">
            {isLoading ? (
              <div className="w-full flex justify-center">
                <Loader />
              </div>
            ) : (
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
                      Contractor Name
                    </th>
                    <th
                      scope="col"
                      className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 lg:table-cell"
                    >
                      {isCompleted ? "End Date" : "Start Date"}
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
                  {contracts
                    .filter((contract) => {
                      return contract.status === currentSection;
                    })
                    .map((contract, planIdx) => (
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
                            <span>
                              {contract.freelancer.firstName}{" "}
                              {contract.freelancer.lastName}
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <span>
                              {contract?.type === "HOURLY" &&
                                `$${contract.rate}/hr`}
                              {contract?.type === "FIXED" &&
                                `Fixed rate: $${contract.rate}`}
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
                          {contract.freelancer.firstName}{" "}
                          {contract.freelancer.lastName}
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
                          {contract?.type === "HOURLY" &&
                            `$${contract.rate}/hr`}
                          {contract?.type === "FIXED" &&
                            `Fixed rate: $${contract.rate}`}
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
                          <button
                            type="button"
                            onClick={() => handleSelect(contract)}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white"
                          >
                            View
                            <span className="sr-only">
                              , {contract.job.title}
                            </span>
                          </button>
                          {planIdx !== 0 ? (
                            <div className="absolute -top-px left-0 right-6 h-px bg-gray-200" />
                          ) : null}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : (
        <SectionContainer>
          <EmptyState label={`NO ${currentSection.toUpperCase()} CONTRACTS`} />
        </SectionContainer>
      )}

      {!!contractDetails && (
        <ContractSlideout
          open={showDetails}
          setOpen={setShowDetails}
          contractDetails={contractDetails}
          handleContractAction={handleEndContractClick}
        />
      )}
      <CloseContractDialog
        open={showDialog}
        setOpen={setShowDialog}
        handleContractAction={handleContractAction}
        contractId={contractDetails?.id}
      />
      <UpdateContractSlideout handleUpdateSuccess={updateContract} />
    </>
  );
};

export default Contracts;
