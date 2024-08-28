import { jobService } from "@/app/services/jobService";
import { freelancerService } from "@/app/services/freelancerService";
import { ErrorResponse } from "@/app/types";
import { Job } from "@prisma/client";
import { NextResponse } from "next/server";
import { clientService } from "@/app/services/clientService";
import { openaiService } from "@/app/services/openaiService";

export async function GET(request: Request, { params }: { params: { id: string } }): Promise<NextResponse<Job | ErrorResponse>> {
  try {
    const job: Job = await jobService.getJobById(params.id);
    return NextResponse.json(job, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}

export async function PUT(request: Request, { params }: { params: { id: string } }): Promise<NextResponse<Job | ErrorResponse>> {
  try {
    const data = await request.json();
    if (
      (data?.status === "ACTIVE" || data?.status === "DRAFT") &&
      (data.title || data.description)
    ) {
      const res = await openaiService.aiAssistantForJob({
        title: data.title,
        description: data.description,
      });
      if (res.status === "invalid") {
        return NextResponse.json({ error: res }, { status: 500 });
      }
    }
    // Fetch the current job data
    const currentJob: Job = await jobService.getJobById(params.id);
    // Update the job
    const job: Job = await jobService.updateJob(params.id, data);
    if (currentJob.status !== 'ACTIVE' && job.status === "ACTIVE") {
      freelancerService.sendNewJobNotification(job);
      // clientService.sendNewJobNotification(job);
    }
    return NextResponse.json(job, { status: 200 })
  } catch (err) {
    console.error(err); 
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}

export async function PATCH(request: Request, { params }: { params: { id: string } }): Promise<NextResponse<Job | ErrorResponse>> {
  try {
    const data = await request.json();
    // Fetch the current job data
    const currentJob: Job = await jobService.getJobById(params.id);
    if(data?.status === "ACTIVE" || data?.status === "DRAFT") {
      const res = await openaiService.aiAssistantForJob({title: data.title, description: data.description});
      if(res.status === "invalid") {
        return NextResponse.json(
          { error: res },
          { status: 500 }
        );
      }
    }
    // Update the job
    const job: Job = await jobService.updateJob(params.id, data);
    if (currentJob.status !== 'ACTIVE' && job.status === "ACTIVE") {
      freelancerService.sendNewJobNotification(job);
      // clientService.sendNewJobNotification(job);
    }
    return NextResponse.json(job, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}