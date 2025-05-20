"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MjpegStreamViewer } from "@/components/mjpeg-stream-viewer"
import { useLogContext } from "@/context/log-context"

interface CameraFeedsProps {
  compact?: boolean
  baseUrl: string
  thermalEndpoint: string
  objectEndpoint: string
  lidarEndpoint: string
}

export function CameraFeeds({
  compact = false,
  baseUrl = "http://192.168.183.250:5000",
  thermalEndpoint = "/thermal_feed",
  objectEndpoint = "/object_detection_feed",
  lidarEndpoint = "/lidar_feed",
}: CameraFeedsProps) {
  const { addLog } = useLogContext()
  const [savedFeeds, setSavedFeeds] = useState<Array<{ id: string; name: string; url: string; timestamp: Date }>>([])

  const handleSaveFrame = (feedName: string, imageUrl: string) => {
    // Save the captured frame
    const timestamp = new Date()
    const newFeed = {
      id: Date.now().toString(),
      name: `${feedName} - ${timestamp.toLocaleString()}`,
      url: imageUrl,
      timestamp,
    }

    setSavedFeeds((prev) => [...prev, newFeed])

    // Also download the image
    const a = document.createElement("a")
    a.href = imageUrl
    a.download = `${feedName.toLowerCase().replace(/\s+/g, "-")}-${timestamp.toISOString().replace(/:/g, "-")}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    addLog({
      message: `Saved ${feedName} camera frame`,
      type: "success",
      timestamp: new Date(),
    })
  }

  if (compact) {
    return (
      <div className="h-[300px]">
        {" "}
        {/* Increased height for compact view */}
        <Tabs defaultValue="object-detection">
          <TabsList className="w-full">
            <TabsTrigger value="object-detection">Object Detection</TabsTrigger>
            <TabsTrigger value="thermal">Thermal</TabsTrigger>
            <TabsTrigger value="lidar">LIDAR</TabsTrigger>
          </TabsList>
          <TabsContent value="object-detection">
            <MjpegStreamViewer
              streamUrl={`${baseUrl}${objectEndpoint}`}
              title="Object Detection"
              onSave={(imageUrl) => handleSaveFrame("Object Detection", imageUrl)}
            />
          </TabsContent>
          <TabsContent value="thermal">
            <MjpegStreamViewer
              streamUrl={`${baseUrl}${thermalEndpoint}`}
              title="Thermal"
              onSave={(imageUrl) => handleSaveFrame("Thermal", imageUrl)}
            />
          </TabsContent>
          <TabsContent value="lidar">
            <MjpegStreamViewer
              streamUrl={`${baseUrl}${lidarEndpoint}`}
              title="LIDAR"
              onSave={(imageUrl) => handleSaveFrame("LIDAR", imageUrl)}
            />
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Camera Feeds</h2>
          <p className="text-muted-foreground">Monitor real-time video feeds from the robot's cameras.</p>
        </div>
      </div>

      {/* Changed to 2 columns instead of 3 for larger feeds */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Object Detection Camera */}
        <MjpegStreamViewer
          streamUrl={`${baseUrl}${objectEndpoint}`}
          title="Object Detection Camera"
          onSave={(imageUrl) => handleSaveFrame("Object Detection", imageUrl)}
        />

        {/* Thermal Camera */}
        <MjpegStreamViewer
          streamUrl={`${baseUrl}${thermalEndpoint}`}
          title="Thermal Camera"
          onSave={(imageUrl) => handleSaveFrame("Thermal", imageUrl)}
        />

        {/* LIDAR Camera - Full width in its own row */}
        <div className="md:col-span-2">
          <MjpegStreamViewer
            streamUrl={`${baseUrl}${lidarEndpoint}`}
            title="LIDAR Camera"
            onSave={(imageUrl) => handleSaveFrame("LIDAR", imageUrl)}
          />
        </div>
      </div>

      {/* Saved Feeds Section */}
      {savedFeeds.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Saved Frames</CardTitle>
            <CardDescription>Captured frames from camera feeds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedFeeds.map((feed) => (
                <Card key={feed.id} className="overflow-hidden">
                  <div className="aspect-video relative">
                    <img src={feed.url || "/placeholder.svg"} alt={feed.name} className="w-full h-full object-cover" />
                  </div>
                  <CardContent className="p-3">
                    <div className="font-medium truncate">{feed.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{feed.timestamp.toLocaleString()}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
