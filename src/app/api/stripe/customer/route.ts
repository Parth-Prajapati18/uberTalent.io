import { stripeService } from "@/app/services/stripeService";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const request = await req.json();
    const customer = await stripeService.createStripeCustomer(request);
    return NextResponse.json(customer, { status: 200 })
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
}