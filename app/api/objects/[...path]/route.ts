import { NextRequest, NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

const storage = new Storage({
  credentials: {
    audience: "replit",
    subject_token_type: "access_token",
    token_url: `${REPLIT_SIDECAR_ENDPOINT}/token`,
    type: "external_account",
    credential_source: {
      url: `${REPLIT_SIDECAR_ENDPOINT}/credential`,
      format: {
        type: "json",
        subject_token_field_name: "access_token",
      },
    },
    universe_domain: "googleapis.com",
  },
  projectId: "",
});

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const objectPath = params.path.join('/');
    const privateDir = process.env.PRIVATE_OBJECT_DIR || '';
    const fullPath = `${privateDir}/${objectPath}`;

    const pathParts = fullPath.split('/').filter(p => p);
    const bucketName = pathParts[0];
    const objectName = pathParts.slice(1).join('/');

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);

    const [exists] = await file.exists();
    if (!exists) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const [metadata] = await file.getMetadata();
    const [buffer] = await file.download();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving object:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
