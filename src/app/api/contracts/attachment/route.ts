import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/session';
import { userService } from '@/app/services/userService';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fetch from 'node-fetch';
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        /* clientPayload?: string, */
      ) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.
 
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            // you could pass a user id from auth, or a value from clientPayload
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        try {
         
         
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });
 
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}

export async function GET(request:NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("fileUrl") as string;
  try {
    // Fetch the file from the URL
    const response = await fetch(fileUrl);
    const buffer = await response.buffer();
    // Get the filename from the URL
    const blobname = path.basename(new URL(fileUrl).pathname);
    const filename = blobname.split("-")[0]
    // Get the filesize from the buffer
    const filesizeBytes = Buffer.byteLength(buffer);
    const filesize = filesizeBytes / (1024);
    return NextResponse.json({
      filename,
      filesize,
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching file details:', error);
    return NextResponse.json({ error: 'Error fetching file details' }, { status: 500 });
  }
}
