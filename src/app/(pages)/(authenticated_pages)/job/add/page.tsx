"use client";
import { CreateJobType } from "@/app/schema/CreateJobSchema";
import { useRouter } from "next/navigation";
import JobForm from "@/app/components/forms/JobForm";
import { useState } from "react";
import { createJob } from "@/app/lib/api";
import { useUserContext } from "@/app/providers/UserProvider";
import { useNotification } from "@/app/providers/NotificationProvider";

export default function AddJob() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const { user } = useUserContext();
  const showNotification = useNotification();

  const createJobPayload = (data: CreateJobType) => {
    if (data.compensation === "HOURLY") {
      delete data.projectCost;
    } else if (data.compensation === "FIXED") {
      delete data.hourlyMinRate;
      delete data.hourlyMaxRate;
    }
    return data;
  };
  async function handleSaveAsDraft(data: CreateJobType) {
    setIsLoading(true);
    const finalPayload = {
      ...createJobPayload(data),
      status: "DRAFT",
      isPublished: false,
    };
    try {
      const response = await createJob(finalPayload);
      if (response.isError) {
        if (response.error.status === "invalid") {
          showNotification("error", response.error.message);
        } else {
          showNotification("error", "Something went wrong");
        }
        return;
      }
      router.push("/client-dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddJob(data: CreateJobType) {
    setIsLoading(true);
    const finalPayload = {
      ...createJobPayload(data),
      status: "ACTIVE",
      isPublished: true,
    };
    try {
      const response = await createJob(finalPayload);
      if (response.isError) {
        if (response.error.status === "invalid") {
          showNotification("error", response.error.message);
        } else {
          showNotification("error", "Something went wrong");
        }
        return;
      }
      router.push("/client-dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      try {
        await fetch("/api/mail", {
          method: "POST",
          body: JSON.stringify({
            to: user.email,
            from: "UberTalent<support@ubertalent.io>",
            subject: `Your Job Listing on UberTalent: ${data.title}`,
            html: `<body style="font-family: Inter, Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 20px;">
                            <h1 style="color: #333333; text-align: center;">Job Posted!</h1>
                            <p style="color: #333333;">Hi ${user.firstName},</p>
                            <p style="color: #333333;">We're excited to inform you that your job listing titled \"${data.title}\" has been successfully posted on UberTalent. This means that talented freelancers from our community can now view and apply to work on your project!</p>
                            <p style="color: #666666;">Job Details:</p>
                            <p style="color: #333333;"><strong>Job Title: </strong> ${data.title}</p>
                            <p style="color: #333333;white-space: pre-wrap;"><strong>Job Description: </strong> ${data.description}</p>
                            <p style="color: #333333;"><strong>Compensation: </strong> $${data.hourlyMinRate}-${data.hourlyMaxRate}</p>
                            <p style="color: #333333; text-align: center; margin: 30px;"><a href="${process.env.NEXT_PUBLIC_API_ENDPOINT}/client-dashboard/freelancer/search" style="color: white; text-decoration: none; padding: 10px 20px; background-color: rgba(0, 0, 0); border-radius: 5px; border: 2px solid #000;">Find Talent</a></p>
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
      } catch(err) {
        console.log("ERROR", err);
      }
      setIsLoading(false);
    }
  }

  return (
    <JobForm
      handleAddJob={handleAddJob}
      handleSaveAsDraft={handleSaveAsDraft}
      type="add"
    />
  );
}
