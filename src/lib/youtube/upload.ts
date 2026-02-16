export type UploadMetadata = {
  title: string;
  description: string;
  tags: string[];
  privacyStatus: "public" | "unlisted" | "private";
};

export type UploadResult = {
  videoId: string;
  videoUrl: string;
};

const UPLOAD_URL =
  "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status";

/**
 * Upload a video file to YouTube as a Short using resumable upload.
 */
export async function uploadShort(
  accessToken: string,
  videoBuffer: Uint8Array,
  metadata: UploadMetadata
): Promise<UploadResult> {
  // Ensure #shorts is in the description for proper classification
  const description = metadata.description.includes("#shorts")
    ? metadata.description
    : `${metadata.description}\n\n#shorts`;

  // Step 1: Initialize resumable upload
  const initRes = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": "video/*",
      "X-Upload-Content-Length": videoBuffer.byteLength.toString(),
    },
    body: JSON.stringify({
      snippet: {
        title: metadata.title,
        description,
        tags: metadata.tags,
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: metadata.privacyStatus,
        selfDeclaredMadeForKids: false,
        embeddable: true,
      },
    }),
  });

  if (!initRes.ok) {
    const error = await initRes.text();
    if (initRes.status === 403 && error.includes("quotaExceeded")) {
      throw new Error(
        "YouTube API quota exceeded. Please try again tomorrow or request a quota increase in Google Cloud Console."
      );
    }
    throw new Error(`Upload initialization failed: ${error}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) {
    throw new Error("No upload URL returned from YouTube API");
  }

  // Step 2: Upload the video data
  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/*",
      "Content-Length": videoBuffer.byteLength.toString(),
    },
    body: videoBuffer as unknown as BodyInit,
  });

  if (!uploadRes.ok) {
    const error = await uploadRes.text();
    throw new Error(`Video upload failed: ${error}`);
  }

  const result = await uploadRes.json();

  return {
    videoId: result.id,
    videoUrl: `https://youtube.com/shorts/${result.id}`,
  };
}
