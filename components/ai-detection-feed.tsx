"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { PlayIcon, PauseIcon, SaveIcon, MaximizeIcon, BrainIcon, ServerIcon, SettingsIcon, EyeIcon } from "lucide-react"
import { useLogContext } from "@/context/log-context"

interface AIDetectionFeedProps {
  onSave?: (imageUrl: string, name: string) => void
  onMaximize?: () => void
  compact?: boolean
}

export function AIDetectionFeed({ onSave, onMaximize, compact = false }: AIDetectionFeedProps) {
  const [serverUrl, setServerUrl] = useState("http://localhost:5002")
  const [isActive, setIsActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidenceThreshold, setConfidenceThreshold] = useState(50)
  const [showSettings, setShowSettings] = useState(false)
  const [detectionClasses, setDetectionClasses] = useState<string[]>([
    "person",
    "car",
    "truck",
    "bicycle",
    "motorcycle",
    "dog",
    "cat",
  ])
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["person"])
  const imageRef = useRef<HTMLImageElement>(null)
  const { addLog } = useLogContext()

  const toggleFeed = () => {
    if (isActive) {
      setIsActive(false)
      addLog({
        message: "AI object detection feed deactivated",
        type: "info",
        timestamp: new Date(),
      })
    } else {
      setIsConnecting(true)
      setError(null)

      // Simulate connection attempt
      setTimeout(() => {
        setIsActive(true)
        setIsConnecting(false)
        addLog({
          message: `Connected to AI object detection feed at ${serverUrl}`,
          type: "success",
          timestamp: new Date(),
        })
      }, 1500)
    }
  }

  const handleSave = () => {
    if (!imageRef.current) return

    // Create a canvas to capture the current frame
    const canvas = document.createElement("canvas")
    canvas.width = imageRef.current.naturalWidth || 640
    canvas.height = imageRef.current.naturalHeight || 480

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw the current frame to the canvas
    ctx.drawImage(imageRef.current, 0, 0)

    // Convert to data URL
    const imageUrl = canvas.toDataURL("image/jpeg")

    // Call the onSave callback with the image URL
    if (onSave) {
      onSave(imageUrl, `AI Detection - ${new Date().toLocaleString()}`)
      addLog({
        message: "Saved AI detection feed image",
        type: "success",
        timestamp: new Date(),
      })
    }
  }

  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerUrl(e.target.value)
  }

  const handleConfidenceChange = (value: number[]) => {
    setConfidenceThreshold(value[0])
  }

  const toggleClass = (className: string) => {
    if (selectedClasses.includes(className)) {
      setSelectedClasses(selectedClasses.filter((c) => c !== className))
    } else {
      setSelectedClasses([...selectedClasses, className])
    }
  }

  // Construct the video feed URL
  const videoFeedUrl = isActive
    ? `${serverUrl}/video_feed?confidence=${confidenceThreshold / 100}&classes=${selectedClasses.join(",")}`
    : "/placeholder.svg?height=480&width=640"

  if (compact) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
        <img
          ref={imageRef}
          src={videoFeedUrl || "/placeholder.svg"}
          alt="AI Object Detection Feed"
          className="w-full h-full object-contain"
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <Button onClick={toggleFeed} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
              {isConnecting ? "Connecting..." : "Start AI Detection"}
            </Button>
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge className="bg-blue-600">
              <BrainIcon className="h-3 w-3 mr-1" />
              AI Active
            </Badge>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BrainIcon className="h-4 w-4 text-blue-500" />
            AI Object Detection
          </CardTitle>
          <CardDescription>YOLOv8 powered object detection</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showSettings ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="server-url">Flask Server URL</Label>
              <Input
                id="server-url"
                placeholder="http://localhost:5002"
                value={serverUrl}
                onChange={handleServerUrlChange}
              />
              <p className="text-xs text-muted-foreground">URL of the Flask server running YOLOv8 object detection</p>
            </div>

            <div className="space-y-2">
              <Label>Confidence Threshold ({confidenceThreshold}%)</Label>
              <Slider min={10} max={95} step={5} value={[confidenceThreshold]} onValueChange={handleConfidenceChange} />
              <p className="text-xs text-muted-foreground">Minimum confidence level for object detection</p>
            </div>

            <div className="space-y-2">
              <Label>Detection Classes</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {detectionClasses.map((className) => (
                  <div key={className} className="flex items-center space-x-2">
                    <Switch
                      id={`class-${className}`}
                      checked={selectedClasses.includes(className)}
                      onCheckedChange={() => toggleClass(className)}
                    />
                    <Label htmlFor={`class-${className}`}>{className}</Label>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => setShowSettings(false)} className="w-full">
              Apply Settings
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 mb-2">
              <Input placeholder="Enter server URL" value={serverUrl} onChange={handleServerUrlChange} />
              <Button variant="outline" onClick={toggleFeed} disabled={isConnecting}>
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
              {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <div className="text-destructive font-medium mb-2">{error}</div>
                  <Button variant="outline" size="sm" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                </div>
              ) : (
                <>
                  <img
                    ref={imageRef}
                    src={videoFeedUrl || "/placeholder.svg"}
                    alt="AI Object Detection Feed"
                    className="w-full h-full object-contain"
                    onError={() => {
                      if (isActive) {
                        setError("Failed to connect to AI detection server")
                        setIsActive(false)
                        addLog({
                          message: `Failed to connect to AI detection server at ${serverUrl}`,
                          type: "error",
                          timestamp: new Date(),
                        })
                      }
                    }}
                  />
                  {!isActive && !isConnecting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                      <div className="text-center p-4">
                        <ServerIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">AI Detection Feed</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Connect to a Flask server running YOLOv8 object detection
                        </p>
                        <Button onClick={toggleFeed} className="bg-blue-600 hover:bg-blue-700">
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Start AI Detection
                        </Button>
                      </div>
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className="bg-blue-600">
                        <BrainIcon className="h-3 w-3 mr-1" />
                        AI Active
                      </Badge>
                      <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        {selectedClasses.length} classes
                      </Badge>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between p-4">
        <div className="flex gap-2">
          <Button size="sm" variant={isActive ? "outline" : "default"} onClick={toggleFeed} disabled={isConnecting}>
            {isActive ? (
              <>
                <PauseIcon className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button size="sm" variant="outline" onClick={handleSave} disabled={!isActive}>
            <SaveIcon className="h-4 w-4 mr-2" />
            Save Image
          </Button>
        </div>
        <Button size="sm" variant="outline" onClick={onMaximize} disabled={!isActive}>
          <MaximizeIcon className="h-4 w-4 mr-2" />
          Maximize
        </Button>
      </CardFooter>
    </Card>
  )
}
