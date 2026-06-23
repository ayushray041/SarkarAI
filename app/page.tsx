import { Sidebar } from "@/components/dashboard/sidebar"
import { TopBar } from "@/components/dashboard/top-bar"
import { UploadSection } from "@/components/dashboard/upload-section"
import { SummaryCard } from "@/components/dashboard/summary-card"
import { ImportantDates } from "@/components/dashboard/important-dates"
import { RequiredDocuments } from "@/components/dashboard/required-documents"
import { Eligibility } from "@/components/dashboard/eligibility"
import { AskQuestions } from "@/components/dashboard/ask-questions"
import { SchemeRecommendations } from "@/components/dashboard/scheme-recommendations"

export default function Page() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1500px] gap-4 p-4">
      <Sidebar />

      <main className="flex-1">
        <TopBar />

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <UploadSection />
          </div>
          <div className="lg:col-span-5">
            <SummaryCard />
          </div>

          <div className="lg:col-span-4">
            <ImportantDates />
          </div>
          <div className="lg:col-span-4">
            <RequiredDocuments />
          </div>
          <div className="lg:col-span-4">
            <Eligibility />
          </div>

          <div className="lg:col-span-12">
            <AskQuestions />
            <div className="lg:col-span-12">
            <SchemeRecommendations />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
