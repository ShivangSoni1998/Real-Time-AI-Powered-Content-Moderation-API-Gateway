"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { submitContent } from "../services/api";
import { SOCKET_URL, UI_TEXT } from "../lib/constants";
import { Button } from "../components/ui/Button";
import { TextArea } from "../components/ui/TextArea";
import { ResultCard } from "../components/ui/ResultCard";

interface ModerationResult {
  submissionId: string;
  status: "APPROVED" | "FLAGGED" | "PENDING";
  reason?: string;
  confidence: number;
  originalContent: string;
  timestamp: string;
}

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [content, setContent] = useState("");
  const [submissions, setSubmissions] = useState<ModerationResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Connect to API Gateway
    const newSocket = io(SOCKET_URL);

    newSocket.on("connect", () => {
      console.log("Connected to Socket.io server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
      setIsConnected(false);
    });

    newSocket.on("moderation-update", (update: ModerationResult) => {
      console.log("Received update:", update);
      setSubmissions((prev) => {
        // Check if we have a pending submission with this ID
        const exists = prev.find(s => s.submissionId === update.submissionId);
        if (exists) {
          // Replace pending with actual result
          return prev.map(s => s.submissionId === update.submissionId ? update : s);
        }
        // Otherwise add new (e.g. from another user)
        return [update, ...prev];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Call API
      const response = await submitContent(content);

      // 2. Optimistic UI: Add "Pending" card immediately
      const pendingSubmission: ModerationResult = {
        submissionId: response.submissionId,
        status: "PENDING",
        confidence: 0,
        originalContent: content,
        timestamp: new Date().toISOString(),
      };

      setSubmissions((prev) => [pendingSubmission, ...prev]);
      setContent("");

    } catch (error) {
      console.error("Error submitting content:", error);
      alert(UI_TEXT.FAILED_SUBMIT);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon-v2.png" alt="Logo" className="object-contain w-full h-full rounded-lg" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {UI_TEXT.TITLE}
              </h1>
              <p className="text-gray-400 mt-1 text-sm">{UI_TEXT.SUBTITLE}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium text-gray-300">
              {isConnected ? UI_TEXT.SYSTEM_ONLINE : UI_TEXT.DISCONNECTED}
            </span>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">{UI_TEXT.TEST_CONTENT_HEADER}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextArea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={UI_TEXT.PLACEHOLDER}
              disabled={isSubmitting}
              rows={4}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                isLoading={isSubmitting}
              >
                {UI_TEXT.SUBMIT_BUTTON}
              </Button>
            </div>
          </form>
        </div>

        {/* Live Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {UI_TEXT.LIVE_FEED_HEADER}
          </h2>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-gray-800 border-dashed">
                {UI_TEXT.NO_SUBMISSIONS}
              </div>
            ) : (
              submissions.map((sub) => (
                <ResultCard
                  key={sub.submissionId}
                  {...sub}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
