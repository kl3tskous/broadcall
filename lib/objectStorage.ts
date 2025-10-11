// Simplified object storage utilities for Next.js
// Based on Replit's App Storage blueprint

const REPLIT_SIDECAR_ENDPOINT = "http://127.0.0.1:1106";

export async function getUploadURL(): Promise<string> {
  const privateDir = process.env.PRIVATE_OBJECT_DIR;
  if (!privateDir) {
    throw new Error("PRIVATE_OBJECT_DIR not set");
  }

  const objectId = crypto.randomUUID();
  const objectPath = `${privateDir}/uploads/${objectId}`;

  const { bucketName, objectName } = parseObjectPath(objectPath);

  return signObjectURL({
    bucketName,
    objectName,
    method: "PUT",
    ttlSec: 900,
  });
}

export function normalizeUploadURL(uploadURL: string): string {
  if (!uploadURL.startsWith("https://storage.googleapis.com/")) {
    return uploadURL;
  }

  const url = new URL(uploadURL);
  const rawObjectPath = url.pathname;

  let objectEntityDir = process.env.PRIVATE_OBJECT_DIR || "";
  if (!objectEntityDir.endsWith("/")) {
    objectEntityDir = `${objectEntityDir}/`;
  }

  if (!rawObjectPath.startsWith(objectEntityDir)) {
    return rawObjectPath;
  }

  const entityId = rawObjectPath.slice(objectEntityDir.length);
  return `/api/objects/${entityId}`;
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
