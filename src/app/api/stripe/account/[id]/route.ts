import { stripeService } from "@/app/services/stripeService";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
      console.log('params id: ', params.id);
      const acctInfo = await stripeService.getStripeConnectAcct(params.id);
      return NextResponse.json(acctInfo, { status: 200 })
    } catch (err) {
      console.error(err);
      return NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      );
    }
  }