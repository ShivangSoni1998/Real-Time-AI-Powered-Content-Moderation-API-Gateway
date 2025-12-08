"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { submitContent } from "../services/api";
import { SOCKET_URL, UI_TEXT } from "../lib/constants";

interface ModerationResult {
  submissionId: string;
  status: "APPROVED" | "FLAGGED";
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
      setSubmissions((prev) => [update, ...prev]);
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
      await submitContent(content);
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
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={UI_TEXT.PLACEHOLDER}
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              disabled={isSubmitting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${isSubmitting || !content.trim()
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                  }`}
              >
                {isSubmitting ? UI_TEXT.SUBMITTING : UI_TEXT.SUBMIT_BUTTON}
              </button>
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
                <div
                  key={sub.submissionId}
                  className={`p-6 rounded-xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${sub.status === "APPROVED"
                    ? "bg-gray-800/50 border-green-500/20 hover:border-green-500/40"
                    : "bg-gray-800/50 border-red-500/20 hover:border-red-500/40"
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${sub.status === "APPROVED"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(sub.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-gray-200 text-lg mb-3 leading-relaxed">{sub.originalContent}</p>

                  {sub.status === "FLAGGED" && (
                    <div className="bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                      <p className="text-sm text-red-300 flex items-center gap-2">
                        <span className="font-semibold">Reason:</span> {sub.reason}
                      </p>
                      <p className="text-sm text-red-300/70 mt-1">
                        Confidence: {(sub.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
