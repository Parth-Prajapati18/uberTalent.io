import { CreateContractData } from "@/app/types";
import { CreateJobType } from "@/app/schema/CreateJobSchema";
import { MailType } from "@/app/schema/MailSchema";

export async function submitProposal(body: any) {
  const res = await fetch(`/api/freelancer/jobs/proposals`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  let resp = await res.json();
  return resp;
}

export async function getProposalById(id: string) {
  const res = await fetch(`/api/proposals/${id}`);
  let resp = await res.json();

  return resp;
}
export async function updateProposal(id: string, data: any) {
  const res = await fetch(`/api/proposals/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  let resp = await res.json();

  return resp;
}

export async function getFreelancerRate() {
  let url = `/api/freelancer/rate`;
  const response = await fetch(url);
  const resp = await response.json();
  const isError = !response.ok;

  return { ...resp, isError };
}

export async function getJobRate() {
  let url = `/api/job/rate`;
  const response = await fetch(url);
  const resp = await response.json();
  const isError = !response.ok;

  return { ...resp, isError };
}

//==//

export async function unsaveJob(jobId: string) {
  const res = await fetch(`/api/freelancer/jobs/unsave/${jobId}`, {
    method: "PATCH",
  });

  let resp = await res.json();
  return resp;
}

export async function getJobById(jobId: string) {
  const res = await fetch(`/api/client/job/${jobId}`);

  let resp = await res.json();
  return resp;
}

export async function createJob(data: CreateJobType) {
  const response = await fetch("/api/client/job", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const resp = await response.json();
  const isError = !response.ok;

  return { ...resp, isError };
}

export async function updateJob(jobId: string, data: CreateJobType) {
  try {
    const response = await fetch(`/api/client/job/${jobId}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const resp = await response.json();
    const isError = !response.ok;

    return { ...resp, isError };
  } catch (err) {
    console.error(err);
  }
}

export async function patchJobStatus(
  jobId: string,
  data: { status?: string; isPublished?: boolean,  title?: string, description?: string }
) {
  const response = await fetch(`/api/client/job/${jobId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const resp = await response.json();
  const isError = !response.ok;

  return { ...resp, isError };
}

export async function updateSaveJobStatus(jobId: string, type: string) {
  const response = await fetch(`/api/job/${jobId}/save`, {
    method: "POST",
    body: JSON.stringify({
      type,
      jobId,
    }),
  });
  const resp = await response.json();
  const isError = !response.ok;
  return { ...resp, isError };
}

export async function createJobInvite(userId: string, jobId: string, message: string) {
  const response = await fetch(`/api/job/${jobId}/invite`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      jobId,
      message,
    }),
  });
  const resp = await response.json();
  const isError = !response.ok;
  return { ...resp, isError };
}

export async function removeJob(jobId: string) {
  const response = await fetch(`/api/job/${jobId}`, {
    method: "DELETE",
  });
  const resp = await response.json();
  const isError = !response.ok;
  return { ...resp, isError };
}

//==//

export async function getAllContract() {
  try {
    const response = await fetch(`/api/client/contracts`);

    if (!response.ok) {
      throw new Error("Failed to fetch contracts");
    }

    const data = await response.json();
    return { data, isError: false };
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return { contracts: [], isError: true };
  }
}

export async function getContractById(id: string) {
  const res = await fetch(`/api/contracts/${id}`);
  let resp = await res.json();

  return resp;
}

export async function createContract(data: CreateContractData) {
  const response = await fetch("/api/contracts", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

export async function updateContract(
  contractId: string | undefined,
  data: CreateContractData
) {
  if (!contractId) return null;
  const response = await fetch(`/api/contracts/${contractId}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

export async function updateContractStatus(
  contractId: string,
  status: string,
  proposalId?: string
) {
  const response = await fetch(`/api/contracts/${contractId}/status`, {
    method: "PUT",
    body: JSON.stringify({ id: contractId, status, proposalId }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

//==//

export async function getUserData() {
  const res = await fetch(`/api/user`);
  const response = await res.json();
  return response;
}

export async function updateProfileImage(profileImageUrl: string) {
  const res = await fetch(`/api/user/avatar`, {
    method: "PUT",
    body: JSON.stringify({ profileImageUrl }),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const response = await res.json();
  return response;
}

export async function getOrCreateTimesheet(contractId: string, weekStart: string) {
  const res = await fetch(`/api/timesheets?contractId=${contractId}&weekStart=${weekStart}`);
  let resp = await res.json();

  return resp;
}

export async function updateDayEntry(timesheetId: string, hours: number, day: string) {
  const res = await fetch(`/api/timesheets/dayEntry/${timesheetId}`, {
      method: "PUT",
      body: JSON.stringify({hours, day}),
  })
  const resp = await res.json();
  return resp;
}

export async function getAllTimesheetsByClientId(contractId: string,weekStart: string) {
  const res = await fetch(`/api/timesheets/client?contractId=${contractId}&weekStart=${weekStart}`);
  let resp = await res.json();

  return resp;
}

export async function getEarningSummary(contractId: any) {
  const res = await fetch(`/api/freelancer/summary/earning?contractId=${contractId}`);
  let resp = await res.json();

  return resp;
}

export async function getHistoricalTimesheet(contractId: any, weekStart: any) {
  const res = await fetch(`/api/timesheets/history?contractId=${contractId}&weekStart=${weekStart}`);
  let resp = await res.json();

  return resp;
}

export async function getUnpaidTimesheet(contractId: any) {
  const res = await fetch(`/api/timesheets/unpaid?contractId=${contractId}`);
  let resp = await res.json();

  return resp;
}

export async function getInvoicesTimesheet(contractId: any) {
  const res = await fetch(`/api/timesheets/invoices?contractId=${contractId}`);
  let resp = await res.json();

  return resp;
}

export async function patchTimesheet(
  timesheetId: string,
  data: { isPaid?: boolean }
) {
  const response = await fetch(`/api/timesheets/${timesheetId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const resp = await response.json();
  const isError = !response.ok;

  return { ...resp, isError };
}

export async function getJobSaveStatus(jobId: string) {
  const res = await fetch(`/api/client/job/${jobId}/saveStatus`);

  let resp = await res.json();
  return resp;
}

export async function getStripeCustomerExists(id: string) {
  const res = await fetch(`/api/stripe/customer/${id}`);

  let resp = await res.json();
  return resp;
}

export async function getStripeCustomerHasDefPayment(id: string) {
  const res = await fetch(`/api/stripe/customer/${id}/paymentmethod`);

  let resp = await res.json();
  return resp;
}

export async function createStripeCustomer(data: { name: string, email: string }) {
  const response = await fetch("/api/stripe/customer", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

export async function getStripeBillingPortalURL(data: {customer_id: string, return_url: string}) {
  const response = await fetch("/api/stripe/billingportal", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

export async function getStripeConnectAccount(id: string) {
  const res = await fetch(`/api/stripe/account/${id}`);

  let resp = await res.json();
  return resp;
}

export async function createStripeConnectAcct() {
  const response = await fetch("/api/stripe/account", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

export async function createStripeConnectAcctLink(data: { account: string, return_url: string, refresh_url: string }) {
  const response = await fetch("/api/stripe/accountlink", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  });

  let resp = await response.json();
  return resp;
}

export async function sendMail(data: MailType) {
  const response = await fetch("/api/mail", {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
}

export async function getAllPortfolio(userId?: string) {
  try {
    let URL = `/api/freelancer/portfolio`;
    if (userId) {
      URL += `?userId=${userId}`;
    }
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error("Failed to fetch portfolio");
    }

    const data = await response.json();
    return { data, isError: false };
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return { isError: true };
  }
}

export async function createPortfolio(project: any) {
  try {
    const response = await fetch("/api/freelancer/portfolio", {
      method: "POST",
      body: JSON.stringify(project),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to create portfolio");
    }

    const data = await response.json();
    return { data, isError: false };
  } catch (error) {
    console.error("Error create portfolio:", error);
    return { isError: true };
  }
}

export async function removePortfolio(portfolioId: string) {
  const response = await fetch(`/api/freelancer/portfolio/${portfolioId}`, {
    method: "DELETE",
  });
  const resp = await response.json();
  const isError = !response.ok;
  return { ...resp, isError };
}

export async function getPortfolioById(portfolioId: string) {
  const res = await fetch(`/api/freelancer/portfolio/${portfolioId}`);

  let resp = await res.json();
  return resp;
}

export async function updatePortfolio(portfolioId: any, portfolio: any) {
  try {
    const response = await fetch(`/api/freelancer/portfolio/${portfolioId}`, {
      method: "PUT",
      body: JSON.stringify(portfolio),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to update portfolio");
    }

    const data = await response.json();
    return { data, isError: false };
  } catch (error) {
    console.error("Error update portfolio:", error);
    return { isError: true };
  }
}