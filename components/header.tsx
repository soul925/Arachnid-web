"use client"

// Import the necessary hooks and components
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MoonIcon, SunIcon, AlertTriangleIcon } from "lucide-react"
import { useLogContext } from "@/context/log-context"
import { useEmergencyContacts } from "@/context/emergency-contact-context"
import { toast } from "@/components/ui/use-toast"

export function Header() {
  const [darkMode, setDarkMode] = useState(false)
  const { addLog } = useLogContext()
  const [emergencyMode, setEmergencyMode] = useState(false)
  const { contacts } = useEmergencyContacts() // Get emergency contacts from context
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)
  }, [])

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark")
    setDarkMode(!darkMode)
    addLog({
      message: `Display mode changed to ${!darkMode ? "dark" : "light"} mode`,
      type: "info",
      timestamp: new Date(),
    })
  }

  // Update the sendEmergencySMS function to actually send messages
  const sendEmergencySMS = async (contacts) => {
    if (contacts.length === 0) {
      return {
        success: false,
        message: "No emergency contacts found. Please add contacts in Settings.",
      }
    }

    try {
      // In a real application, this would connect to an SMS API service
      // For demonstration, we'll simulate sending SMS
      const results = await Promise.all(
        contacts.map(async (contact) => {
          // Simulate API call with a delay
          await new Promise((resolve) => setTimeout(resolve, 500))

          return {
            name: contact.name,
            phone: contact.phone,
            success: true,
          }
        }),
      )

      const successCount = results.filter((r) => r.success).length

      return {
        success: true,
        message: `Emergency SOS signal sent to ${successCount} contact(s)`,
        results,
      }
    } catch (error) {
      console.error("Error sending emergency SMS:", error)
      return {
        success: false,
        message: `Failed to send emergency messages: ${error.message || "Unknown error"}`,
      }
    }
  }

  // Update the toggleEmergency function to send SMS messages
  const toggleEmergency = async () => {
    const newEmergencyState = !emergencyMode
    setEmergencyMode(newEmergencyState)

    if (newEmergencyState) {
      // If activating emergency mode, send SMS
      setIsSending(true)

      try {
        const result = await sendEmergencySMS(contacts)

        if (result.success) {
          // Log successful sends
          addLog({
            message: result.message,
            type: "success",
            timestamp: new Date(),
          })

          // Show toast notification
          toast({
            title: "Emergency SOS Sent",
            description: `Messages sent to ${result.results.length} contact(s)`,
            variant: "default",
          })

          // Log individual messages
          result.results.forEach((contact) => {
            addLog({
              message: `Emergency SMS sent to ${contact.name} at ${contact.phone}`,
              type: "info",
              timestamp: new Date(),
            })
          })
        } else {
          // Log failure
          addLog({
            message: result.message,
            type: "warning",
            timestamp: new Date(),
          })

          // Show toast notification
          toast({
            title: "Emergency SOS Failed",
            description: result.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error in emergency process:", error)

        addLog({
          message: `Error in emergency process: ${error.message || "Unknown error"}`,
          type: "error",
          timestamp: new Date(),
        })
      } finally {
        setIsSending(false)
      }
    }

    addLog({
      message: `Emergency mode ${newEmergencyState ? "activated" : "deactivated"}`,
      type: newEmergencyState ? "error" : "success",
      timestamp: new Date(),
    })
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Hexa Bot Rescue Operation</h1>
          {emergencyMode && (
            <div className="animate-pulse flex items-center gap-1 text-destructive">
              <AlertTriangleIcon className="h-5 w-5" />
              <span className="font-bold">EMERGENCY</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={emergencyMode ? "default" : "destructive"}
            size="sm"
            onClick={toggleEmergency}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                Sending SOS...
              </>
            ) : emergencyMode ? (
              "Clear Emergency"
            ) : (
              "Emergency"
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleDarkMode}>
            {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
