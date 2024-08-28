export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/lib/session";

export async function GET() {
  try {
    const twilopassword =
      "8pTfIDEy0bwAweYRC6gsumxqD7q2wHT93xFd40hKDjvAbdKyfocWyIUkxr4jMMiuGUmXGAc3R";
    const currentUser = await getCurrentUser();
    console.log("getToken for twillo Service");
    const requestAddress = "https://utc-4539.twil.io/token-service";

    const response = await fetch(`${requestAddress}?identity=${currentUser.email}&password=${twilopassword}`);
    const responseBody = await response.text();
  
    console.log("twilo response:", responseBody); // Handle the response data as needed
   
    return NextResponse.json(responseBody, { status: 200 });
  } catch(err) {
    console.error('Error:',err)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
  
  
}
