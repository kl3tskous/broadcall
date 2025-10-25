import { NextRequest, NextResponse } from 'next/server';
import { signObjectURL } from '@/lib/objectStorage';

const PRIVATE_OBJECT_DIR = process.env.PRIVATE_OBJECT_DIR;
const PUBLIC_SEARCH_PATHS = process.env.PUBLIC_OBJECT_SEARCH_PATHS;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const walletAddress = formData.get('wallet_address') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // NOTE: Authentication should be added here in production
    // For now, trusting wallet_address from formData
    // TODO: Verify wallet signature to ensure user owns this wallet

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const objectId = `trades-images/${walletAddress}-${timestamp}.${extension}`;
    
    // Use public directory for trades images (they need to be publicly accessible)
    const publicDir = PUBLIC_SEARCH_PATHS?.split(',')[0] || PRIVATE_OBJECT_DIR;
    if (!publicDir) {
      throw new Error('Object storage not configured');
    }

    const objectPath = `${publicDir}/${objectId}`;
    const { bucketName, objectName } = parseObjectPath(objectPath);

    // Get signed upload URL
    const uploadURL = await signObjectURL({
      bucketName,
      objectName,
      method: 'PUT',
      ttlSec: 900,
    });

    // Upload file to Replit Object Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResponse = await fetch(uploadURL, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload to object storage');
    }

    // Return public URL path
    const publicUrl = `/api/objects/${objectId}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading trades image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

function parseObjectPath(path: string): {
  bucketName: string;
  objectName: string;
} {
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const pathParts = path.split("/");
  if (pathParts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }

  const bucketName = pathParts[1];
  const objectName = pathParts.slice(2).join("/");

  return {
    bucketName,
    objectName,
  };
}

async function signObjectURL({
  bucketName,
  objectName,
  method,
  ttlSec,
}: {
  bucketName: string;
  objectName: string;
  method: "GET" | "PUT" | "DELETE" | "HEAD";
  ttlSec: number;
}): Promise<string> {
  const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";
  
  const request = {
    bucket_name: bucketName,
    object_name: objectName,
    method,
    expires_at: new Date(Date.now() + ttlSec * 1000).toISOString(),
  };
  
  const response = await fetch(
    `${REPLIT_SIDECAR_ENDPOINT}/object-storage/signed-object-url`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );
  
  if (!response.ok) {
    throw new Error(
      `Failed to sign object URL, errorcode: ${response.status}`
    );
  }

  const { signed_url: signedURL } = await response.json();
  return signedURL;
}
