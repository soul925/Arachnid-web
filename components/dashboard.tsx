"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LocationWeather } from "@/components/location-weather"
import { CameraFeeds } from "@/components/camera-feeds"
import { LogsPanel } from "@/components/logs-panel"
import { Settings } from "@/components/settings"
import { BotProvider } from "@/context/bot-context"
import { LogProvider } from "@/context/log-context"
import { Header } from "@/components/header"
import { EmergencyContactProvider } from "@/context/emergency-contact-context"
import { SendSMS } from "@/components/send-sms"
import { RtspHelper } from "@/components/rtsp-helper"
import { MjpegStreamViewer } from "@/components/mjpeg-stream-viewer"

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <BotProvider>
      <LogProvider>
        <EmergencyContactProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <LocationWeather />
                <MjpegStreamViewer
                  streamUrl="http://192.168.183.250:5000/thermal_feed"
                  title="Thermal Camera Feed"
                  onSave={(imageUrl) => {
                    // Save the captured frame
                    const timestamp = new Date().toISOString().replace(/:/g, "-")
                    const a = document.createElement("a")
                    a.href = imageUrl
                    a.download = `thermal-capture-${timestamp}.jpg`
                    document.body.appendChild(a)
                    a.click()
                    document.body.removeChild(a)
                  }}
                />
              </div>
              <Tabs defaultValue="camera-feeds" className="space-y-4">
                <TabsList className="grid grid-cols-6">
                  <TabsTrigger value="camera-feeds">Camera Feeds</TabsTrigger>
                  <TabsTrigger value="thermal-feed">Thermal Feed</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="rtsp-help">RTSP Help</TabsTrigger>
                </TabsList>
                <TabsContent value="camera-feeds" className="space-y-4">
                  <CameraFeeds />
                </TabsContent>
                <TabsContent value="thermal-feed" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thermal Camera Feed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MjpegStreamViewer
                        streamUrl="http://192.168.183.250:5000/thermal_feed"
                        title="Thermal Camera Feed"
                        onSave={(imageUrl) => {
                          // Save the captured frame
                          const timestamp = new Date().toISOString().replace(/:/g, "-")
                          const a = document.createElement("a")
                          a.href = imageUrl
                          a.download = `thermal-capture-${timestamp}.jpg`
                          document.body.appendChild(a)
                          a.click()
                          document.body.removeChild(a)
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="logs" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>System Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LogsPanel />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="settings" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Settings />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="sms" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Send SMS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SendSMS />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="rtsp-help" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>RTSP Stream Setup</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RtspHelper />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </EmergencyContactProvider>
      </LogProvider>
    </BotProvider>
  )
}
