import { stripeService } from "@/app/services/stripeService";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
      const hasDefaultPayment = await stripeService.getCustomerHasDefaultPayment(params.id);
      return NextResponse.json(hasDefaultPayment, { status: 200 });
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      );
    }
    
  }