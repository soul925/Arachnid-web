"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, Send, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useLogContext } from "@/context/log-context"
import { useEmergencyContacts } from "@/context/emergency-contact-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Add this function after the imports
export async function sendEmergencyMessage(
  phoneNumber: string,
  customMessage?: string,
): Promise<{
  success: boolean
  message: string
}> {
  try {
    // In a real application, this would connect to an SMS API service
    // For demonstration, we'll simulate sending SMS
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const message = customMessage || "EMERGENCY SOS: I need immediate assistance. This is an automated emergency alert."

    console.log(`Emergency SMS sent to ${phoneNumber}: ${message}`)

    return {
      success: true,
      message: `Emergency message sent to ${phoneNumber}`,
    }
  } catch (error) {
    console.error("Error sending emergency SMS:", error)
    return {
      success: false,
      message: `Failed to send emergency message: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export function SendSMS() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [useContact, setUseContact] = useState(false)
  const { addLog } = useLogContext()
  const { contacts } = useEmergencyContacts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!phoneNumber && !useContact) {
      setStatus({
        type: "error",
        message: "Please enter a phone number or select a contact",
      })
      return
    }

    if (!message) {
      setStatus({
        type: "error",
        message: "Please enter a message",
      })
      return
    }

    setIsLoading(true)
    setStatus({ type: null, message: "" })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Log the action
      addLog({
        message: `SMS sent to ${phoneNumber}`,
        type: "success",
        timestamp: new Date(),
      })

      // Show success message
      setStatus({
        type: "success",
        message: "Message sent successfully!",
      })

      // Clear form
      if (!useContact) {
        setPhoneNumber("")
      }
      setMessage("")
    } catch (error) {
      console.error("Error sending SMS:", error)

      // Log the error
      addLog({
        message: `Failed to send SMS: ${error instanceof Error ? error.message : "Unknown error"}`,
        type: "error",
        timestamp: new Date(),
      })

      // Show error message
      setStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleContactSelect = (contactId: string) => {
    const selectedContact = contacts.find((contact) => contact.id === contactId)
    if (selectedContact) {
      setPhoneNumber(selectedContact.phone)
      setUseContact(true)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-t-4 border-t-blue-400">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-2xl">Send SMS</CardTitle>
        </div>
        <CardDescription>Send SMS messages over Wi-Fi to any phone number</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {contacts.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="contact">Emergency Contact</Label>
              <Select onValueChange={handleContactSelect}>
                <SelectTrigger id="contact">
                  <SelectValue placeholder="Select a contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} ({contact.phone})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Or enter a phone number manually below</div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="e.g., +1234567890"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value)
                setUseContact(false)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>

          {status.type && (
            <Alert variant={status.type === "error" ? "destructive" : "default"} className="mt-4">
              {status.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{status.type === "success" ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
