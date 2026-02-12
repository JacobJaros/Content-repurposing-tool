"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProgressSteps } from "@/components/ui/progress-steps";

type Output = {
  id: string;
  platform: string;
  content: string;
  editedContent: string | null;
  metadata: string | null;
};

type Project = {
  id: string;
  title: string;
  status: string;
  inputType: string;
  outputs: Output[];
  createdAt: string;
};

const PLATFORM_LABELS: Record<string, string> = {
  TWITTER: "Twitter Thread",
  LINKEDIN: "LinkedIn Post",
  INSTAGRAM: "Instagram Carousel",
  BLOG: "Blog Post",
  NEWSLETTER: "Newsletter",
  SHORT_VIDEO: "Short Video",
};

// Platforms where markdown syntax should be stripped on copy
const PLAIN_TEXT_PLATFORMS = ["TWITTER", "LINKEDIN", "INSTAGRAM", "SHORT_VIDEO"];

function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")           // headers
    .replace(/\*\*(.+?)\*\*/g, "$1")      // bold
    .replace(/\*(.+?)\*/g, "$1")          // italic
    .replace(/_(.+?)_/g, "$1")            // italic underscores
    .replace(/~~(.+?)~~/g, "$1")          // strikethrough
    .replace(/`(.+?)`/g, "$1")            // inline code
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")   // links
    .replace(/^[-*+]\s+/gm, "- ")         // normalize list markers
    .replace(/^>\s+/gm, "")               // blockquotes
    .replace(/---+/g, "---")              // keep separators simple
    .replace(/\n{3,}/g, "\n\n");          // collapse extra newlines
}

export function ProjectDetail({ project: initialProject }: { project: Project }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState(
    initialProject.outputs[0]?.platform || ""
  );
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [outputs, setOutputs] = useState(initialProject.outputs);
  const [previewMode, setPreviewMode] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pendingTabSwitch, setPendingTabSwitch] = useState<string | null>(null);
  const [confirmTabSwitch, setConfirmTabSwitch] = useState(false);

  const activeOutput = outputs.find((o) => o.platform === activeTab);
  const hasError = activeOutput?.metadata
    ? (() => { try { return JSON.parse(activeOutput.metadata).error; } catch { return null; } })()
    : null;
  const hasUnsavedChanges = Object.keys(editingContent).length > 0;

  // Poll for status updates when project is still processing
  useEffect(() => {
    if (
      project.status === "READY" ||
      project.status === "FAILED"
    ) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${project.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setProject({
          ...data.project,
          createdAt:
            typeof data.project.createdAt === "string"
              ? data.project.createdAt
              : new Date(data.project.createdAt).toISOString(),
        });
        if (data.project.outputs?.length > 0) {
          setOutputs(data.project.outputs);
          if (!activeTab && data.project.outputs[0]) {
            setActiveTab(data.project.outputs[0].platform);
          }
        }
      } catch {
        // silently retry on next interval
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [project.id, project.status, activeTab]);

  // Warn on unsaved changes before browser unload
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeOutput && editingContent[activeOutput.id] !== undefined) {
          handleSave(activeOutput);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const getDisplayContent = (output: Output) => {
    if (editingContent[output.id] !== undefined)
      return editingContent[output.id];
    return output.editedContent || output.content;
  };

  const handleTabSwitch = (platform: string) => {
    // Check if current tab has unsaved edits
    if (activeOutput && editingContent[activeOutput.id] !== undefined) {
      setPendingTabSwitch(platform);
      setConfirmTabSwitch(true);
      return;
    }
    setActiveTab(platform);
    setPreviewMode(false);
  };

  const handleCopy = async () => {
    if (!activeOutput) return;
    let text = getDisplayContent(activeOutput);

    if (PLAIN_TEXT_PLATFORMS.includes(activeOutput.platform)) {
      text = stripMarkdown(text);
    }

    await navigator.clipboard.writeText(text);
    setCopied(true);
    addToast("Copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = useCallback(async (output: Output) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/outputs/${output.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editedContent: editingContent[output.id],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOutputs((prev) =>
          prev.map((o) => (o.id === output.id ? data.output : o))
        );
        setEditingContent((prev) => {
          const next = { ...prev };
          delete next[output.id];
          return next;
        });
        addToast("Changes saved", "success");
      } else {
        addToast("Failed to save changes", "error");
      }
    } catch {
      addToast("Failed to save changes", "error");
    } finally {
      setSaving(false);
    }
  }, [editingContent, addToast]);

  const handleRegenerate = async (platform: string) => {
    setRegenerating(platform);
    setConfirmRegenerate(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          platform,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutputs((prev) =>
          prev.map((o) =>
            o.platform === platform ? { ...data.output } : o
          )
        );
        // Clear any pending edits for this output
        const outputId = outputs.find((o) => o.platform === platform)?.id;
        if (outputId) {
          setEditingContent((prev) => {
            const next = { ...prev };
            delete next[outputId];
            return next;
          });
        }
        addToast("Content regenerated", "success");
      } else {
        const err = await res.json();
        addToast(err.error || "Regeneration failed", "error");
      }
    } catch {
      addToast("Regeneration failed. Please try again.", "error");
    } finally {
      setRegenerating(null);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        addToast("Project deleted", "success");
        router.push("/dashboard/projects");
      } else {
        addToast("Failed to delete project", "error");
      }
    } catch {
      addToast("Failed to delete project", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const currentContent = activeOutput
    ? getDisplayContent(activeOutput)
    : "";
  const wordCount = currentContent.split(/\s+/).filter(Boolean).length;
  const charCount = currentContent.length;

  const isProcessing = !["READY", "FAILED"].includes(project.status);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => {
              if (hasUnsavedChanges) {
                if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
              }
              router.push("/dashboard/projects");
            }}
            className="text-sm text-gray-500 hover:text-gray-700 mb-1"
          >
            &larr; Back to Projects
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500">
            {project.inputType} &middot;{" "}
            {new Date(project.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => setConfirmDelete(true)}
          disabled={deleting}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {/* Progress indicator for processing projects */}
      {isProcessing && <ProgressSteps status={project.status} />}

      {/* Failed state */}
      {project.status === "FAILED" && outputs.length === 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium mb-2">Processing failed</p>
          <p className="text-sm text-red-600 mb-4">
            Something went wrong while generating your content. Please try creating a new project.
          </p>
          <button
            onClick={() => router.push("/dashboard/projects/new")}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Create New Project
          </button>
        </div>
      )}

      {/* Platform tabs */}
      {outputs.length > 0 && (
        <div className="flex gap-1 overflow-x-auto mb-4 border-b border-gray-200 pb-px">
          {outputs.map((output) => {
            const outputError = output.metadata
              ? (() => { try { return JSON.parse(output.metadata).error; } catch { return null; } })()
              : null;
            const hasEdit = editingContent[output.id] !== undefined;
            return (
              <button
                key={output.platform}
                onClick={() => handleTabSwitch(output.platform)}
                className={`shrink-0 rounded-t-lg px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === output.platform
                    ? "border-blue-600 text-blue-700"
                    : outputError
                    ? "border-transparent text-red-500 hover:text-red-600"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {PLATFORM_LABELS[output.platform] || output.platform}
                {outputError && " !"}
                {hasEdit && " *"}
              </button>
            );
          })}
        </div>
      )}

      {/* Content area */}
      {activeOutput && (
        <div className="rounded-lg border border-gray-200 bg-white">
          {hasError && !activeOutput.content ? (
            <div className="p-6 text-center">
              <p className="text-red-600 mb-3">{hasError}</p>
              <button
                onClick={() => handleRegenerate(activeTab)}
                disabled={regenerating === activeTab}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {regenerating === activeTab ? "Retrying..." : "Retry"}
              </button>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {wordCount} words &middot; {charCount} chars
                  </span>
                  {hasUnsavedChanges && editingContent[activeOutput.id] !== undefined && (
                    <span className="text-xs text-amber-600 font-medium">Unsaved</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {/* Edit/Preview toggle */}
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                      previewMode
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {previewMode ? "Edit" : "Preview"}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => setConfirmRegenerate(true)}
                    disabled={regenerating === activeTab}
                    className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {regenerating === activeTab
                      ? "Regenerating..."
                      : "Regenerate"}
                  </button>
                  {editingContent[activeOutput.id] !== undefined && (
                    <button
                      onClick={() => handleSave(activeOutput)}
                      disabled={saving}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Editable content or preview */}
              {previewMode ? (
                <div className="prose prose-sm max-w-none p-4 min-h-[200px] md:min-h-[400px]">
                  <ReactMarkdown>{currentContent}</ReactMarkdown>
                </div>
              ) : (
                <textarea
                  value={getDisplayContent(activeOutput)}
                  onChange={(e) =>
                    setEditingContent((prev) => ({
                      ...prev,
                      [activeOutput.id]: e.target.value,
                    }))
                  }
                  className="w-full min-h-[200px] md:min-h-[400px] p-4 text-sm text-gray-800 focus:outline-none resize-y whitespace-pre-wrap"
                />
              )}
            </>
          )}
        </div>
      )}

      {!isProcessing && outputs.length === 0 && project.status !== "FAILED" && (
        <div className="text-center py-16 text-gray-500">
          No outputs generated yet.
        </div>
      )}

      {/* Regenerate confirmation */}
      <ConfirmDialog
        open={confirmRegenerate}
        title="Regenerate content?"
        message="This will replace the current AI-generated content for this platform. Any unsaved edits will be lost."
        confirmLabel="Regenerate"
        onConfirm={() => handleRegenerate(activeTab)}
        onCancel={() => setConfirmRegenerate(false)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete project?"
        message="This will permanently delete this project and all its generated content. This action cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Tab switch with unsaved changes confirmation */}
      <ConfirmDialog
        open={confirmTabSwitch}
        title="Unsaved changes"
        message="You have unsaved edits on this tab. Switch anyway? Your changes will be preserved until you leave the page."
        confirmLabel="Switch"
        onConfirm={() => {
          setConfirmTabSwitch(false);
          if (pendingTabSwitch) {
            setActiveTab(pendingTabSwitch);
            setPreviewMode(false);
            setPendingTabSwitch(null);
          }
        }}
        onCancel={() => {
          setConfirmTabSwitch(false);
          setPendingTabSwitch(null);
        }}
      />
    </div>
  );
}
