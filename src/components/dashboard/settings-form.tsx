"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

type SettingsFormProps = {
  initialName: string;
  initialBrandVoice: string;
  email: string;
  plan: string;
  usageCount: number;
  youtubeConnected?: boolean;
  youtubeChannelTitle?: string | null;
  youtubeConfigured?: boolean;
};

export function SettingsForm({
  initialName,
  initialBrandVoice,
  email,
  plan,
  usageCount,
  youtubeConnected = false,
  youtubeChannelTitle = null,
  youtubeConfigured = false,
}: SettingsFormProps) {
  const { addToast } = useToast();
  const [name, setName] = useState(initialName);
  const [brandVoice, setBrandVoice] = useState(initialBrandVoice);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const hasChanges =
    name !== initialName || brandVoice !== initialBrandVoice;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, brandVoice }),
      });
      if (res.ok) {
        addToast("Settings saved", "success");
      } else {
        addToast("Failed to save settings", "error");
      }
    } catch {
      addToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectYouTube = async () => {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/youtube/disconnect", { method: "POST" });
      if (res.ok) {
        addToast("YouTube disconnected", "success");
        window.location.reload();
      } else {
        addToast("Failed to disconnect YouTube", "error");
      }
    } catch {
      addToast("Failed to disconnect YouTube", "error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {/* Profile */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <p className="text-sm font-medium text-gray-900">{email}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">
              Brand Voice
            </label>
            <textarea
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="Describe your brand voice and tone (e.g., professional but approachable, witty, data-driven). This will guide AI-generated content."
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
            />
            <p className="text-xs text-gray-400 mt-1">
              Used to personalize AI-generated content across all platforms.
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Connected Accounts
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* YouTube icon */}
            <svg className="h-8 w-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">YouTube</p>
              {youtubeConnected && youtubeChannelTitle ? (
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{youtubeChannelTitle}</span>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Connected
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mt-0.5">
                  Connect to upload Shorts directly
                </p>
              )}
            </div>
          </div>

          {!youtubeConfigured ? (
            <span className="text-xs text-gray-400">
              YouTube API credentials not configured
            </span>
          ) : youtubeConnected ? (
            <button
              onClick={handleDisconnectYouTube}
              disabled={disconnecting}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {disconnecting ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <a
              href="/api/youtube/connect"
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
            >
              Connect YouTube
            </a>
          )}
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Subscription
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Current Plan:{" "}
              <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                {plan}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Usage: {usageCount} repurposes this month
            </p>
          </div>
          <button
            disabled
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
            title="Billing integration coming soon"
          >
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
}
