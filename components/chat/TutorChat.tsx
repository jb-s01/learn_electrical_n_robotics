"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OllamaStatus } from "./OllamaStatus";
import { Send } from "lucide-react";
import type { ChatContext } from "@/lib/ai/context";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type TutorChatProps = {
  context?: ChatContext;
  compact?: boolean;
};

export function TutorChat({ context, compact = false }: TutorChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(err.error ?? `Error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;

          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              fullContent += text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: fullContent } : m
                )
              );
            } catch {
              // skip
            }
          } else {
            try {
              const json = JSON.parse(line);
              const text = json.message?.content ?? "";
              if (text) {
                fullContent += text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullContent } : m
                  )
                );
              }
            } catch {
              // raw ollama ndjson fallback
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col ${compact ? "h-full min-h-[500px]" : "h-[600px]"}`}>
      {!compact && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">AI Tutor</h2>
          <p className="text-sm text-zinc-500">
            Ask questions — explained by a senior engineer for beginners
          </p>
        </div>
      )}

      <OllamaStatus compact />

      <div
        ref={scrollRef}
        className="mt-3 flex-1 space-y-3 overflow-y-auto rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
      >
        {messages.length === 0 && (
          <p className="text-sm text-zinc-500">
            Try: &quot;Why do I need a resistor with an LED?&quot; or &quot;Explain voltage like I&apos;m five.&quot;
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`rounded-lg px-3 py-2 text-sm ${
              m.role === "user"
                ? "ml-8 bg-blue-600 text-white"
                : "mr-8 bg-zinc-100 dark:bg-zinc-800"
            }`}
          >
            <p className="whitespace-pre-wrap">{m.content}</p>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <p className="text-sm text-zinc-400">Thinking...</p>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about electronics..."
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
