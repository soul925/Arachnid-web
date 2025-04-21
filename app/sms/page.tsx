import { Suspense } from "react"
import { SendSMS } from "@/components/send-sms"
import { BotProvider } from "@/context/bot-context"
import { LogProvider } from "@/context/log-context"
import { EmergencyContactProvider } from "@/context/emergency-contact-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function SMSPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Send SMS Over Wi-Fi</h1>
        <Suspense fallback={<Skeleton className="w-full max-w-md mx-auto h-[500px] rounded-lg" />}>
          <BotProvider>
            <LogProvider>
              <EmergencyContactProvider>
                <SendSMS />
              </EmergencyContactProvider>
            </LogProvider>
          </BotProvider>
        </Suspense>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This service allows you to send SMS messages using your Wi-Fi connection.</p>
          <p>Standard messaging rates may apply to the recipient.</p>
        </div>
      </div>
    </main>
  )
}
