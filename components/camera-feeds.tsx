"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { MjpegStreamViewer } from "@/components/mjpeg-stream-viewer"
import { useLogContext } from "@/context/log-context"
import { Button } from "@/components/ui/button"
import { Download, Trash, ImageIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface CameraFeedsProps {
  compact?: boolean
  thermalUrl: string
  objectDetectionUrl: string
}

export function CameraFeeds({
  compact = false,
  thermalUrl = "http://192.168.183.250:5000/thermal_feed",
  objectDetectionUrl = "http://192.168.183.251:5000/object_detection_feed",
}: CameraFeedsProps) {
  const { addLog } = useLogContext()
  const [savedFeeds, setSavedFeeds] = useState<Array<{ id: string; name: string; url: string; timestamp: Date }>>([])

  const handleSaveFrame = (imageUrl: string, feedName: string) => {
    // Save the captured frame to the saved feeds collection
    const timestamp = new Date()
    const newFeed = {
      id: Date.now().toString(),
      name: `${feedName} - ${timestamp.toLocaleString()}`,
      url: imageUrl,
      timestamp,
    }

    setSavedFeeds((prev) => [...prev, newFeed])

    addLog({
      message: `Image from ${feedName} saved to gallery`,
      type: "success",
      timestamp: new Date(),
    })
  }

  const downloadImage = (imageUrl: string, imageName: string) => {
    try {
      // Create a timestamp for the filename
      const timestamp = new Date().toISOString().replace(/:/g, "-").replace(/\..+/, "")
      const filename = `${imageName.toLowerCase().replace(/\s+/g, "-")}.jpg`

      // Create a download link
      const downloadLink = document.createElement("a")
      downloadLink.href = imageUrl
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      toast({
        title: "Image Downloaded",
        description: `Saved as ${filename}`,
        duration: 3000,
      })

      addLog({
        message: `Downloaded image: ${filename}`,
        type: "success",
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      })
    }
  }

  const deleteImage = (id: string) => {
    setSavedFeeds((prev) => prev.filter((feed) => feed.id !== id))

    toast({
      title: "Image Deleted",
      description: "Image removed from saved gallery",
      duration: 3000,
    })

    addLog({
      message: "Removed image from saved gallery",
      type: "info",
      timestamp: new Date(),
    })
  }

  if (compact) {
    return (
      <div className="h-[300px]">
        <Tabs defaultValue="thermal">
          <TabsList className="w-full">
            <TabsTrigger value="thermal">Thermal</TabsTrigger>
            <TabsTrigger value="object-detection">Object Detection</TabsTrigger>
          </TabsList>
          <TabsContent value="thermal">
            <MjpegStreamViewer
              streamUrl={thermalUrl}
              title="Thermal"
              onSave={(imageUrl) => handleSaveFrame(imageUrl, "Thermal")}
            />
          </TabsContent>
          <TabsContent value="object-detection">
            <MjpegStreamViewer
              streamUrl={objectDetectionUrl}
              title="Object Detection"
              onSave={(imageUrl) => handleSaveFrame(imageUrl, "Object Detection")}
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

      {/* Camera feeds grid - 2 columns for 2 feeds */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Thermal Camera */}
        <MjpegStreamViewer
          streamUrl={thermalUrl}
          title="Thermal Camera"
          onSave={(imageUrl) => handleSaveFrame(imageUrl, "Thermal")}
        />

        {/* Object Detection Camera */}
        <MjpegStreamViewer
          streamUrl={objectDetectionUrl}
          title="Object Detection Camera"
          onSave={(imageUrl) => handleSaveFrame(imageUrl, "Object Detection")}
        />
      </div>

      {/* Saved Feeds Section */}
      <Card className="mt-6 border-t-4 border-t-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              <CardTitle>Saved Images Gallery</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground">{savedFeeds.length} images saved</div>
          </div>
          <CardDescription>
            View and download your saved camera snapshots here. Click the download button to save any image to your
            device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {savedFeeds.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No saved images yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Click the save button on any camera feed to capture and save images
              </p>
            </div>
          ) : (
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
                  <CardFooter className="p-3 pt-0 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mr-2"
                      onClick={() => downloadImage(feed.url, feed.name)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm" className="w-auto" onClick={() => deleteImage(feed.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Import Tabs components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
