"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";

const PLATFORMS = [
  { id: "TWITTER", label: "Twitter Thread" },
  { id: "LINKEDIN", label: "LinkedIn Post" },
  { id: "INSTAGRAM", label: "Instagram Carousel" },
  { id: "BLOG", label: "Blog Post" },
];

type InputMode = "text" | "file";

export default function NewProjectPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [title, setTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    PLATFORMS.map((p) => p.id)
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      let inputFileUrl = "";
      let inputType = "TEXT";

      if (inputMode === "file" && file) {
        setStatus("Uploading file...");
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Upload failed");
        }

        const uploadData = await uploadRes.json();
        inputFileUrl = uploadData.url;

        if (file.type.startsWith("audio/")) inputType = "AUDIO";
        else if (file.type.startsWith("video/")) inputType = "VIDEO";
        else inputType = "TEXT";
      }

      setStatus("Creating project...");
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Untitled Project",
          inputType,
          inputText: inputMode === "text" ? inputText : undefined,
          inputFileUrl: inputMode === "file" ? inputFileUrl : undefined,
          platforms: selectedPlatforms,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        // If we got a project ID back (partial failure), redirect to it
        if (err.projectId) {
          addToast("Processing encountered an error. Check your project for details.", "error");
          router.push(`/dashboard/projects/${err.projectId}`);
          return;
        }
        throw new Error(err.error || "Failed to create project");
      }

      const data = await res.json();
      addToast("Project created successfully", "success");
      router.push(`/dashboard/projects/${data.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
      setStatus("");
    }
  };

  const maxFileSize = 500 * 1024 * 1024;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">New Project</h1>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Project Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My awesome content..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Input mode toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Content Source
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setInputMode("text")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              inputMode === "text"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            Paste Text
          </button>
          <button
            onClick={() => setInputMode("file")}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              inputMode === "file"
                ? "bg-blue-100 text-blue-700 border border-blue-300"
                : "bg-gray-100 text-gray-600 border border-gray-200"
            }`}
          >
            Upload File
          </button>
        </div>
      </div>

      {/* Text input */}
      {inputMode === "text" && (
        <div className="mb-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your content here — a transcript, blog post, notes, or any text you want to repurpose..."
            rows={10}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
          />
          <p className="text-xs text-gray-500 mt-1">
            {inputText.split(/\s+/).filter(Boolean).length} words
          </p>
        </div>
      )}

      {/* File upload */}
      {inputMode === "file" && (
        <div className="mb-4">
          <div
            className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile) {
                if (droppedFile.size > maxFileSize) {
                  setError(`File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
                  return;
                }
                setFile(droppedFile);
                setError("");
              }
            }}
          >
            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-xs text-red-600 hover:text-red-700 mt-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Audio (MP3, WAV), Video (MP4), or Text (TXT, MD) — max 500MB
                </p>
              </div>
            )}
          </div>
          <input
            id="file-input"
            type="file"
            className="hidden"
            accept=".mp3,.wav,.m4a,.ogg,.mp4,.mov,.webm,.txt,.md,.pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                if (selectedFile.size > maxFileSize) {
                  setError(`File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
                  return;
                }
                setFile(selectedFile);
                setError("");
              }
            }}
          />
        </div>
      )}

      {/* Platform selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Output Platforms
        </label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium border transition-colors ${
                selectedPlatforms.includes(platform.id)
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              {platform.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={
          loading ||
          selectedPlatforms.length === 0 ||
          (inputMode === "text" && !inputText.trim()) ||
          (inputMode === "file" && !file)
        }
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {status || "Processing..."}
          </span>
        ) : (
          "Generate Content"
        )}
      </button>

      {loading && (
        <p className="text-xs text-gray-500 text-center mt-2">
          This may take a moment. You&apos;ll be redirected when ready.
        </p>
      )}
    </div>
  );
}
