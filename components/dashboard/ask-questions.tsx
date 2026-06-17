"use client"
import { useAnalysis } from "@/lib/analysis-context"
import { useLanguage } from "@/lib/language-context"
import { translations } from "@/lib/translations"
import { useState } from "react"
import {
  MessageSquareText,
  SendHorizonal,
  Sparkles,
  Mic,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
  
type Message = { role: "user" | "ai"; text: string }

const suggestions = [
  "Am I eligible for this scheme?",
  "What is the last date to apply?",
  "Which documents are mandatory?",
]

const initialMessages: Message[] = [
  {
    role: "ai",
    text: "Hi! I've analyzed your document. Ask me anything about eligibility, deadlines, or the application process.",
  },
]

export function AskQuestions() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const { documentText, analysis } = useAnalysis()
  const { language } = useLanguage()
  const t = translations[language]
  async function send(text: string) {
    const trimmed = text.trim()
    
    if (!trimmed) return
  
    setMessages((prev) => [
      ...prev,
      { role: "user", text: trimmed },
    ])
    setLoading(true)
    console.log("LOADING TRUE")
    
    try {
      console.log("DOCUMENT TEXT LENGTH:", documentText.length)
      const response = await fetch("/api/analyze/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        question: trimmed,
        documentText,
        analysis,
        }),
      })
      console.log("CHAT STATUS:", response.status)
      const data = await response.json()
      console.log("CHAT RESPONSE:", data)
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || data.error,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Failed to answer question.",
        },
      ])
    } finally {
      console.log("LOADING FALSE")
      setLoading(false)
    }
  
    setInput("")
  }
  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
  
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.")
      return
    }
  
    const recognition = new SpeechRecognition()
  
    recognition.lang =
  language === "hi"
    ? "hi-IN"
    : "en-US"
    recognition.interimResults = false
  
    recognition.onstart = () => {
      setListening(true)
    }
  
    recognition.onend = () => {
      setListening(false)
    }
    recognition.onerror = (event: any) => {
      console.error("VOICE ERROR:", event.error)
    }
  
    recognition.onresult = (event: any) => {
      const transcript =
        event.results[0][0].transcript
    
      console.log("VOICE:", transcript)
    
      setInput(transcript)
    }
  
    recognition.start()
  }
  console.log("CURRENT LOADING STATE:", loading)
  return (
    <Card className="glass flex h-full flex-col border-0 p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-primary">
          <MessageSquareText className="size-4.5" aria-hidden="true" />
        </div>
        <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
        {t.ask}
        </h2>
          <p className="text-xs text-muted-foreground">Chat with your document</p>
        </div>
      </div>

      <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn("flex gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "ai" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" />
              </div>
            )}
            <p
              className={cn(
                "max-w-[80%] text-pretty rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "border border-glass-border bg-secondary text-secondary-foreground",
              )}
            >
              {msg.text}
            </p>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <Sparkles className="size-3.5" />
            </div>
            <p className="rounded-2xl border border-glass-border bg-secondary px-3.5 py-2.5 text-sm">
              AI is thinking...
            </p>
          </div>
        )}
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-glass-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          placeholder="Ask about this document..."
          aria-label="Ask a question about your document"
          className="glass min-h-11 resize-none border-0 placeholder:text-muted-foreground"
          rows={1}
        />
        <div className="flex gap-2">
  <Button
    type="button"
    size="icon"
    onClick={startListening}
    className="size-11 shrink-0"
    aria-label="Voice input"
  >
    <Mic
      className={
        listening
          ? "size-4.5 animate-pulse"
          : "size-4.5"
      }
    />
  </Button>

  <Button
    type="submit"
    size="icon"
    disabled={loading}
    className="size-11 shrink-0"
    aria-label="Send question"
  >
    <SendHorizonal className="size-4.5" />
  </Button>
</div>
      </form>
    </Card>
  )
}
