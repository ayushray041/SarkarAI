"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function SchemeRecommendations() {
  const [profile, setProfile] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  async function recommend() {
    setLoading(true)

    try {
      const response = await fetch(
        "/api/recommend-schemes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile,
          }),
        }
      )

      const data = await response.json()

      setResult(data.answer)
    } catch {
      setResult("Failed to get recommendations.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass border-0 p-6">
      <h2 className="mb-4 text-lg font-semibold">
        AI Scheme Recommender
      </h2>

      <Textarea
        value={profile}
        onChange={(e) =>
          setProfile(e.target.value)
        }
        placeholder={`Female student from Uttar Pradesh
Family income: ₹3 lakh`}
      />

      <Button
        className="mt-3"
        onClick={recommend}
        disabled={loading}
      >
        {loading
          ? "Finding Schemes..."
          : "Recommend Schemes"}
      </Button>

      {result && (
        <div className="mt-4 rounded-xl border p-4">
          <pre className="whitespace-pre-wrap text-sm">
            {result}
          </pre>
        </div>
      )}
    </Card>
  )
}