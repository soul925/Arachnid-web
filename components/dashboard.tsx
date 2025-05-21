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
import { RtspHelper } from "@/components/rtsp-helper"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SaveIcon, ServerIcon } from "lucide-react"

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [thermalUrl, setThermalUrl] = useState("http://192.168.183.250:5000/thermal_feed")
  const [objectDetectionUrl, setObjectDetectionUrl] = useState("http://192.168.183.250:5000/object_detection_feed")
  const [lidarUrl, setLidarUrl] = useState("http://192.168.183.250:5000/lidar_feed")

  useEffect(() => {
    setMounted(true)

    // Load camera config from localStorage
    const savedConfig = localStorage.getItem("hexabot-camera-config")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setThermalUrl(config.thermalUrl || "http://192.168.183.250:5000/thermal_feed")
        setObjectDetectionUrl(config.objectDetectionUrl || "http://192.168.183.250:5000/object_detection_feed")
        setLidarUrl(config.lidarUrl || "http://192.168.183.250:5000/lidar_feed")
      } catch (error) {
        console.error("Error parsing saved camera config:", error)
      }
    }
  }, [])

  const saveConfig = () => {
    const config = {
      thermalUrl,
      objectDetectionUrl,
      lidarUrl,
    }
    localStorage.setItem("hexabot-camera-config", JSON.stringify(config))
    alert("Camera configuration saved successfully!")
  }

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
              {/* Camera URL Configuration Card - Independent URLs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ServerIcon className="h-5 w-5" />
                    Camera URL Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <Label htmlFor="thermal-url">Thermal Camera URL</Label>
                      <Input
                        id="thermal-url"
                        value={thermalUrl}
                        onChange={(e) => setThermalUrl(e.target.value)}
                        placeholder="http://192.168.183.250:5000/thermal_feed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="object-detection-url">Object Detection URL</Label>
                      <Input
                        id="object-detection-url"
                        value={objectDetectionUrl}
                        onChange={(e) => setObjectDetectionUrl(e.target.value)}
                        placeholder="http://192.168.183.250:5000/object_detection_feed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lidar-url">LIDAR Camera URL</Label>
                      <Input
                        id="lidar-url"
                        value={lidarUrl}
                        onChange={(e) => setLidarUrl(e.target.value)}
                        placeholder="http://192.168.183.250:5000/lidar_feed"
                      />
                    </div>
                  </div>
                  <Button onClick={saveConfig} className="mt-4">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Camera Configuration
                  </Button>
                </CardContent>
              </Card>

              <Tabs defaultValue="camera-feeds" className="space-y-4">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="camera-feeds">Camera Feeds</TabsTrigger>
                  <TabsTrigger value="weather">Weather</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                  <TabsTrigger value="rtsp-help">RTSP Help</TabsTrigger>
                </TabsList>
                <TabsContent value="camera-feeds" className="space-y-4">
                  <CameraFeeds thermalUrl={thermalUrl} objectDetectionUrl={objectDetectionUrl} lidarUrl={lidarUrl} />
                </TabsContent>
                <TabsContent value="weather" className="space-y-4">
                  <LocationWeather />
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
