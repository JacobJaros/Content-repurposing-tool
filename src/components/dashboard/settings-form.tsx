"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";

type SettingsFormProps = {
  initialName: string;
  initialBrandVoice: string;
  email: string;
  plan: string;
  usageCount: number;
};

export function SettingsForm({
  initialName,
  initialBrandVoice,
  email,
  plan,
  usageCount,
}: SettingsFormProps) {
  const { addToast } = useToast();
  const [name, setName] = useState(initialName);
  const [brandVoice, setBrandVoice] = useState(initialBrandVoice);
  const [saving, setSaving] = useState(false);

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
