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
  const [baseUrl, setBaseUrl] = useState("http://192.168.183.250:5000")
  const [thermalEndpoint, setThermalEndpoint] = useState("/thermal_feed")
  const [objectEndpoint, setObjectEndpoint] = useState("/object_detection_feed")
  const [lidarEndpoint, setLidarEndpoint] = useState("/lidar_feed")

  useEffect(() => {
    setMounted(true)

    // Load camera config from localStorage
    const savedConfig = localStorage.getItem("hexabot-camera-config")
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        setBaseUrl(config.baseUrl || "http://192.168.183.250:5000")
        setThermalEndpoint(config.thermalEndpoint || "/thermal_feed")
        setObjectEndpoint(config.objectDetectionEndpoint || "/object_detection_feed")
        setLidarEndpoint(config.lidarEndpoint || "/lidar_feed")
      } catch (error) {
        console.error("Error parsing saved camera config:", error)
      }
    }
  }, [])

  const saveConfig = () => {
    const config = {
      baseUrl,
      thermalEndpoint,
      objectDetectionEndpoint: objectEndpoint,
      lidarEndpoint,
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
              {/* Camera URL Configuration Card - Made more compact */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ServerIcon className="h-5 w-5" />
                    Camera URL Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <Label htmlFor="base-url">Base URL</Label>
                      <Input
                        id="base-url"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                        placeholder="http://192.168.183.250:5000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="thermal-endpoint">Thermal</Label>
                      <Input
                        id="thermal-endpoint"
                        value={thermalEndpoint}
                        onChange={(e) => setThermalEndpoint(e.target.value)}
                        placeholder="/thermal_feed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="object-endpoint">Object Detection</Label>
                      <Input
                        id="object-endpoint"
                        value={objectEndpoint}
                        onChange={(e) => setObjectEndpoint(e.target.value)}
                        placeholder="/object_detection_feed"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lidar-endpoint">LIDAR</Label>
                      <Input
                        id="lidar-endpoint"
                        value={lidarEndpoint}
                        onChange={(e) => setLidarEndpoint(e.target.value)}
                        placeholder="/lidar_feed"
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
                  <CameraFeeds
                    baseUrl={baseUrl}
                    thermalEndpoint={thermalEndpoint}
                    objectEndpoint={objectEndpoint}
                    lidarEndpoint={lidarEndpoint}
                  />
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
