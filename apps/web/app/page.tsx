"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

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
    const newSocket = io("http://localhost:3001");

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
      const response = await fetch("http://localhost:3001/api/v1/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: crypto.randomUUID(), // Generate a valid UUID
          content: content,
        }),
      });

      if (response.ok) {
        setContent("");
      } else {
        console.error("Failed to submit content");
        alert("Failed to submit content");
      }
    } catch (error) {
      console.error("Error submitting content:", error);
      alert("Error submitting content");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              AI Content Moderator
            </h1>
            <p className="text-gray-400 mt-2">Real-time content analysis powered by Gemini AI</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm font-medium text-gray-300">
              {isConnected ? "System Online" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Submission Form */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Test Content</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type something to test moderation (e.g., 'I hate you' or 'Have a nice day')..."
              className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
              >
                {isSubmitting ? "Analyzing..." : "Analyze Content"}
              </button>
            </div>
          </form>
        </div>

        {/* Live Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
            Live Moderation Feed
            <span className="text-sm font-normal text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {submissions.length}
            </span>
          </h2>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-800/50 rounded-xl border border-gray-800 border-dashed">
                No submissions yet. Try analyzing some content above!
              </div>
            ) : (
              submissions.map((sub) => (
                <div
                  key={sub.submissionId}
                  className={`bg-gray-800 rounded-xl p-6 border-l-4 shadow-md transition-all duration-300 hover:translate-x-1 ${sub.status === "APPROVED" ? "border-green-500" : "border-red-500"
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${sub.status === "APPROVED"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-400"
                        }`}
                    >
                      {sub.status}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {new Date(sub.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-gray-300 text-lg mb-4 font-medium leading-relaxed">
                    "{sub.originalContent}"
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-400 border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Confidence:</span>
                      <span className="font-mono text-gray-300">{(sub.confidence * 100).toFixed(1)}%</span>
                    </div>
                    {sub.reason && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Reason:</span>
                        <span className="text-red-300">{sub.reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
