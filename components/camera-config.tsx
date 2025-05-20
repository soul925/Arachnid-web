"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useLogContext } from "@/context/log-context"
import { SaveIcon, ServerIcon } from "lucide-react"

interface CameraConfig {
  baseUrl: string
  thermalEndpoint: string
  objectDetectionEndpoint: string
  lidarEndpoint: string
  customEndpoint: string
}

export function CameraConfig() {
  const [config, setConfig] = useState<CameraConfig>({
    baseUrl: "http://192.168.183.250:5000",
    thermalEndpoint: "/thermal_feed",
    objectDetectionEndpoint: "/object_detection_feed",
    lidarEndpoint: "/lidar_feed",
    customEndpoint: "/custom_feed",
  })
  const { addLog } = useLogContext()

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("hexabot-camera-config")
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (error) {
        console.error("Error parsing saved camera config:", error)
      }
    }
  }, [])

  const handleSaveConfig = () => {
    // Save to localStorage
    localStorage.setItem("hexabot-camera-config", JSON.stringify(config))

    // Log the action
    addLog({
      message: "Camera feed configuration updated",
      type: "success",
      timestamp: new Date(),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ServerIcon className="h-5 w-5" />
          Camera Feed Configuration
        </CardTitle>
        <CardDescription>Configure the URLs for all camera feeds</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="base-url">Base URL</Label>
          <Input
            id="base-url"
            value={config.baseUrl}
            onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
            placeholder="http://192.168.183.250:5000"
          />
          <p className="text-xs text-muted-foreground">The base URL for the camera server</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="thermal-endpoint">Thermal Camera Endpoint</Label>
            <Input
              id="thermal-endpoint"
              value={config.thermalEndpoint}
              onChange={(e) => setConfig({ ...config, thermalEndpoint: e.target.value })}
              placeholder="/thermal_feed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="object-endpoint">Object Detection Endpoint</Label>
            <Input
              id="object-endpoint"
              value={config.objectDetectionEndpoint}
              onChange={(e) => setConfig({ ...config, objectDetectionEndpoint: e.target.value })}
              placeholder="/object_detection_feed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lidar-endpoint">LIDAR Endpoint</Label>
            <Input
              id="lidar-endpoint"
              value={config.lidarEndpoint}
              onChange={(e) => setConfig({ ...config, lidarEndpoint: e.target.value })}
              placeholder="/lidar_feed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-endpoint">Custom Feed Endpoint</Label>
            <Input
              id="custom-endpoint"
              value={config.customEndpoint}
              onChange={(e) => setConfig({ ...config, customEndpoint: e.target.value })}
              placeholder="/custom_feed"
            />
          </div>
        </div>

        <div className="pt-2">
          <p className="text-sm text-muted-foreground mb-2">Full URLs:</p>
          <div className="space-y-1 text-xs bg-muted p-2 rounded-md">
            <div>
              <strong>Thermal:</strong> {config.baseUrl}
              {config.thermalEndpoint}
            </div>
            <div>
              <strong>Object Detection:</strong> {config.baseUrl}
              {config.objectDetectionEndpoint}
            </div>
            <div>
              <strong>LIDAR:</strong> {config.baseUrl}
              {config.lidarEndpoint}
            </div>
            <div>
              <strong>Custom:</strong> {config.baseUrl}
              {config.customEndpoint}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveConfig} className="w-full">
          <SaveIcon className="h-4 w-4 mr-2" />
          Save Configuration
        </Button>
      </CardFooter>
    </Card>
  )
}
