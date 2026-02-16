"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import type { ShortVideoOutput } from "@/types/short-video";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
    >
      {copied ? (
        <>
          <svg className="h-3 w-3 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function buildScriptOnly(data: ShortVideoOutput): string {
  const lines: string[] = [];
  lines.push(data.hook);
  lines.push("");
  for (const seg of data.script) {
    lines.push(seg.text);
  }
  lines.push("");
  lines.push(data.cta);
  return lines.join("\n");
}

function buildFullScript(data: ShortVideoOutput): string {
  const lines: string[] = [];
  lines.push(`HOOK: ${data.hook}`);
  lines.push("");
  let cumulative = 0;
  for (const seg of data.script) {
    lines.push(`[${formatTime(cumulative)}] ${seg.text}`);
    if (seg.visualNote) lines.push(`  Visual: ${seg.visualNote}`);
    cumulative += seg.duration;
    lines.push("");
  }
  lines.push(`CTA: ${data.cta}`);
  lines.push("");
  lines.push(`Total duration: ~${data.totalDuration}s`);
  return lines.join("\n");
}

function buildMetadataText(data: ShortVideoOutput): string {
  const lines: string[] = [];
  lines.push(data.title);
  lines.push("");
  lines.push(data.description);
  lines.push("");
  lines.push(`Tags: ${data.tags.join(", ")}`);
  lines.push("");
  lines.push(data.hashtags.join(" "));
  return lines.join("\n");
}

type UploadDialogProps = {
  open: boolean;
  onClose: () => void;
  data: ShortVideoOutput;
};

function UploadDialog({ open, onClose, data }: UploadDialogProps) {
  const { addToast } = useToast();
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [privacy, setPrivacy] = useState<"public" | "unlisted">("public");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && isValidVideo(file)) {
      setVideoFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidVideo(file)) {
      setVideoFile(file);
    }
  };

  const isValidVideo = (file: File): boolean => {
    const validTypes = ["video/mp4", "video/quicktime", "video/webm"];
    if (!validTypes.includes(file.type)) {
      addToast("Invalid format. Use MP4, MOV, or WEBM.", "error");
      return false;
    }
    if (file.size > 100 * 1024 * 1024) {
      addToast("File too large. Maximum 100MB.", "error");
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!videoFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", JSON.stringify(data.tags));
      formData.append("privacyStatus", privacy);

      const res = await fetch("/api/youtube/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const result = await res.json();
      addToast("Video uploaded to YouTube!", "success");
      if (result.videoUrl) {
        window.open(result.videoUrl, "_blank");
      }
      onClose();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Upload failed",
        "error"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Upload Short to YouTube
        </h2>

        {/* Video drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("yt-video-input")?.click()}
          className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 transition-colors cursor-pointer mb-4"
        >
          {videoFile ? (
            <div>
              <p className="text-sm font-medium text-gray-900">{videoFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(videoFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoFile(null);
                }}
                className="text-xs text-red-600 hover:text-red-700 mt-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-sm text-gray-600">Drop your recorded video here</p>
              <p className="text-xs text-gray-400 mt-1">MP4, MOV, or WEBM — max 100MB</p>
            </div>
          )}
        </div>
        <input
          id="yt-video-input"
          type="file"
          className="hidden"
          accept=".mp4,.mov,.webm"
          onChange={handleFileSelect}
        />

        {/* Editable title */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Editable description */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
          />
        </div>

        {/* Tags (read-only) */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Hashtags (read-only) */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Hashtags</label>
          <div className="flex flex-wrap gap-1.5">
            {data.hashtags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Privacy toggle */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-gray-500 mb-1">Privacy</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPrivacy("public")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                privacy === "public"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setPrivacy("unlisted")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                privacy === "unlisted"
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-600 border-gray-200"
              }`}
            >
              Unlisted
            </button>
          </div>
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!videoFile || uploading}
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Upload"
          )}
        </button>
      </div>
    </Dialog>
  );
}

type YouTubeStatus = {
  connected: boolean;
  channelTitle?: string | null;
  uploadedUrl?: string | null;
  uploadedAt?: string | null;
};

export function ShortVideoDisplay({
  content,
  youtubeStatus,
}: {
  content: string;
  youtubeStatus?: YouTubeStatus;
}) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  let data: ShortVideoOutput;
  try {
    data = JSON.parse(content);
  } catch {
    return (
      <div className="p-4 text-sm text-gray-500">
        Unable to parse short video output. Showing raw content:
        <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-50 p-3 rounded-lg">{content}</pre>
      </div>
    );
  }

  // Calculate cumulative timestamps
  const cumulativeTimes: number[] = [];
  let cumulative = 0;
  for (const seg of data.script) {
    cumulativeTimes.push(cumulative);
    cumulative += seg.duration;
  }

  const isConnected = youtubeStatus?.connected ?? false;
  const hasUploaded = !!youtubeStatus?.uploadedUrl;

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Script Section — takes 2 cols on desktop */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Script</h3>
            <div className="flex items-center gap-2">
              <CopyButton text={buildScriptOnly(data)} label="Copy script only" />
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                ~{data.totalDuration}s
              </span>
            </div>
          </div>

          {/* Hook */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                HOOK
              </span>
              <span className="text-xs text-amber-600">0:00</span>
            </div>
            <p className="text-sm font-medium text-amber-900">{data.hook}</p>
          </div>

          {/* Script segments */}
          <div className="space-y-2">
            {data.script.map((segment, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        {formatTime(cumulativeTimes[i])}
                      </span>
                      <span className="text-xs text-gray-400">{segment.duration}s</span>
                    </div>
                    <p className="text-sm text-gray-800">{segment.text}</p>
                  </div>
                  {segment.visualNote && (
                    <div className="shrink-0 max-w-[200px]">
                      <p className="text-xs text-gray-400 italic">
                        <svg className="inline h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                        {segment.visualNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 mt-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center rounded-full bg-green-200 px-2 py-0.5 text-xs font-semibold text-green-800">
                CTA
              </span>
              <span className="text-xs text-green-600">{formatTime(cumulative)}</span>
            </div>
            <p className="text-sm font-medium text-green-900">{data.cta}</p>
          </div>
        </div>

        {/* Metadata Section — right sidebar on desktop */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">YouTube Metadata</h3>

          {/* Title */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Title</label>
              <CopyButton text={data.title} label="Copy" />
            </div>
            <p className="text-sm text-gray-900 font-medium">{data.title}</p>
          </div>

          {/* Description */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-500">Description</label>
              <CopyButton text={data.description} label="Copy" />
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{data.description}</p>
          </div>

          {/* Tags */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-500">Tags</label>
              <CopyButton text={data.tags.join(", ")} label="Copy all" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-500">Hashtags</label>
              <CopyButton text={data.hashtags.join(" ")} label="Copy all" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Visual Direction */}
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="h-4 w-4 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM4 11a1 1 0 100-2H3a1 1 0 000 2h1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1z" />
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
              </svg>
              <label className="text-xs font-semibold text-purple-700">Visual Direction</label>
            </div>
            <p className="text-sm text-purple-800">{data.visualDirection}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 border-t border-gray-200 pt-4 mt-6">
        <CopyButton text={buildFullScript(data)} label="Copy full script" />
        <CopyButton text={buildMetadataText(data)} label="Copy metadata" />

        {hasUploaded ? (
          <a
            href={youtubeStatus!.uploadedUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 transition-colors"
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            View on YouTube
          </a>
        ) : isConnected ? (
          <button
            onClick={() => setShowUploadDialog(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition-colors"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Upload to YouTube
          </button>
        ) : (
          <a
            href="/dashboard/settings#connected-accounts"
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Connect YouTube to Upload
          </a>
        )}
      </div>

      {hasUploaded && youtubeStatus?.uploadedAt && (
        <p className="text-xs text-gray-400 mt-2">
          Uploaded on {new Date(youtubeStatus.uploadedAt).toLocaleDateString()}
          {youtubeStatus.channelTitle ? ` to ${youtubeStatus.channelTitle}` : ""}
        </p>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <UploadDialog
          open={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          data={data}
        />
      )}
    </div>
  );
}
