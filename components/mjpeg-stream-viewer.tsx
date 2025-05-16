"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, RefreshCw, Maximize, Save } from "lucide-react"
import { useLogContext } from "@/context/log-context"

interface MjpegStreamViewerProps {
  streamUrl: string
  title: string
  onSave?: (imageUrl: string) => void
  onMaximize?: () => void
}

export function MjpegStreamViewer({ streamUrl, title, onSave, onMaximize }: MjpegStreamViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const { addLog } = useLogContext()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Reset states when URL changes
    setIsLoading(true)
    setError(null)
    setIsConnected(false)

    // Log the connection attempt
    addLog({
      message: `Connecting to MJPEG stream: ${streamUrl}`,
      type: "info",
      timestamp: new Date(),
    })

    // We'll set a timeout to detect if the stream doesn't load
    const timeoutId = setTimeout(() => {
      if (isLoading && !isConnected) {
        setError("Stream connection timed out. Please check the URL and try again.")
        setIsLoading(false)

        addLog({
          message: `Connection to MJPEG stream timed out: ${streamUrl}`,
          type: "error",
          timestamp: new Date(),
        })
      }
    }, 10000) // 10 second timeout

    return () => {
      clearTimeout(timeoutId)
    }
  }, [streamUrl, addLog])

  const handleImageLoad = () => {
    setIsLoading(false)
    setIsConnected(true)
    setError(null)

    addLog({
      message: `Connected to MJPEG stream successfully: ${streamUrl}`,
      type: "success",
      timestamp: new Date(),
    })
  }

  const handleImageError = () => {
    setIsLoading(false)
    setIsConnected(false)
    setError("Failed to connect to the stream. Please check the URL and ensure the stream server is running.")

    addLog({
      message: `Failed to connect to MJPEG stream: ${streamUrl}`,
      type: "error",
      timestamp: new Date(),
    })
  }

  const refreshStream = () => {
    // Force reload the image by appending a timestamp to the URL
    if (imgRef.current) {
      setIsLoading(true)
      setError(null)

      const timestamp = new Date().getTime()
      imgRef.current.src = `${streamUrl}?t=${timestamp}`

      addLog({
        message: `Refreshing MJPEG stream connection: ${streamUrl}`,
        type: "info",
        timestamp: new Date(),
      })
    }
  }

  const captureFrame = () => {
    if (!imgRef.current || !onSave) return

    try {
      // Create a canvas to capture the current frame
      const canvas = canvasRef.current || document.createElement("canvas")
      canvas.width = imgRef.current.naturalWidth || imgRef.current.width
      canvas.height = imgRef.current.naturalHeight || imgRef.current.height

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Draw the current frame to the canvas
      ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height)

      // Convert to data URL
      const imageUrl = canvas.toDataURL("image/jpeg", 0.95)
      onSave(imageUrl)

      addLog({
        message: `Captured frame from MJPEG stream: ${title}`,
        type: "success",
        timestamp: new Date(),
      })
    } catch (err) {
      console.error("Error capturing frame:", err)

      addLog({
        message: `Error capturing frame from MJPEG stream: ${err}`,
        type: "error",
        timestamp: new Date(),
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={refreshStream} disabled={isLoading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {onSave && (
            <Button variant="outline" size="icon" onClick={captureFrame} disabled={!isConnected}>
              <Save className="h-4 w-4" />
            </Button>
          )}
          {onMaximize && (
            <Button variant="outline" size="icon" onClick={onMaximize} disabled={!isConnected}>
              <Maximize className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
              <AlertCircle className="h-10 w-10 text-destructive mb-2" />
              <div className="text-destructive font-medium mb-4">{error}</div>
              <Button variant="outline" onClick={refreshStream}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          )}

          <img
            ref={imgRef}
            src={streamUrl || "/placeholder.svg"}
            alt={title}
            className="w-full h-full object-contain"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>

        {isConnected && <div className="mt-2 text-sm text-muted-foreground">Live stream from {streamUrl}</div>}

        {/* Hidden canvas for capturing frames */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  )
}
