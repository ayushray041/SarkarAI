"use client"
import { useAnalysis } from "@/lib/analysis-context"
import * as pdfjsLib from "pdfjs-dist"

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs"
import { useState, useRef, type DragEvent } from "react"
import { UploadCloud, FileText, CheckCircle2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type UploadState = "idle" | "uploading" | "done"

export function UploadSection() {
  const [state, setState] = useState<UploadState>("idle")
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState("")
  const [dragging, setDragging] = useState(false)
  const { setAnalysis, setDocumentText } = useAnalysis()
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function startUpload(name: string) {
    setFileName(name)
    setState("uploading")
    setProgress(0)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timerRef.current) clearInterval(timerRef.current)
          setState("done")
          return 100
        }
        return p + 8
      })
    }, 120)
  }
  async function extractPdfText(file: File) {
    const arrayBuffer = await file.arrayBuffer()
  
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise
  
    let text = ""
  
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
  
      const content = await page.getTextContent()
  
      const pageText = content.items
        .map((item: any) => item.str || "")
        .join(" ")
  
      text += pageText + "\n"
    }
  
    return text
  }
  async function handleFiles(files: FileList | null) {
    console.log("HANDLE FILES CALLED")
    if (!files || files.length === 0) return
  
    const file = files[0]
  
    startUpload(file.name)
  
    try {
     let text = ""
      if (file.type === "application/pdf") {
        text = await extractPdfText(file)
      } else {
        text = await file.text()
      }
      console.log("EXTRACTED TEXT LENGTH:", text.length)
      setDocumentText(text)
      console.log("DOCUMENT TEXT SAVED")
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      })
  
      const analysis = await response.json()

console.log("ANALYSIS:", analysis)
if (analysis.error) {
  console.error("ANALYZE ERROR:", analysis.error)

  alert(
    "AI service is currently busy. Please try again in a few moments."
  )

  return
}
setAnalysis(analysis)
setDocumentText(text)

  
      setProgress(100)
      setState("done")
    } catch (error) {
      console.error(error)
  
      alert("Failed to analyze PDF")
  
      reset()
    }
  }

  function reset() {
    if (timerRef.current) clearInterval(timerRef.current)
    setState("idle")
    setProgress(0)
    setFileName("")
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <Card className="glass border-0 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold tracking-tight">Upload Government Document</h2>
          <p className="text-sm text-muted-foreground">PDF, JPG or PNG — gazettes, notices, scheme circulars</p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Secure
        </span>
      </div>

      {state === "idle" && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-glass-border px-6 py-12 text-center transition-colors",
            dragging && "border-primary bg-accent/50",
          )}
        >
          <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <UploadCloud className="size-7" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">Drag &amp; drop your document here</p>
            <p className="text-sm text-muted-foreground">or click to browse files</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".txt"
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
            aria-label="Upload government document"
          />
        </div>
      )}

      {state === "uploading" && (
        <div className="rounded-2xl border border-glass-border p-5">
          <div className="flex items-center gap-3">
            <FileText className="size-5 text-primary" aria-hidden="true" />
            <span className="flex-1 truncate text-sm font-medium">{fileName}</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="mt-3 h-2" />
          <p className="mt-2 text-xs text-muted-foreground">Analyzing document with SarkarAI...</p>
        </div>
      )}

      {state === "done" && (
        <div className="flex items-center gap-3 rounded-2xl border border-glass-border p-5">
          <CheckCircle2 className="size-6 text-primary" aria-hidden="true" />
          <div className="flex-1">
            <p className="truncate text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">Analysis complete — results updated below</p>
          </div>
          <Button variant="ghost" size="icon" onClick={reset} aria-label="Remove document">
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </Card>
  )
}
