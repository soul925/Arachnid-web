"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  CameraIcon,
  ThermometerIcon,
  ScanIcon,
  PlayIcon,
  PauseIcon,
  SaveIcon,
  FolderIcon,
  AlertCircleIcon,
  InfoIcon,
  MaximizeIcon,
  XIcon,
  DownloadIcon,
  TrashIcon,
} from "lucide-react"
import { useLogContext } from "@/context/log-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface CameraFeedsProps {
  compact?: boolean
}

interface SavedFeed {
  id: string
  type: "objectDetection" | "thermal" | "lidar" | "customFeed"
  url: string
  timestamp: Date
  name: string
  isImage: boolean
}

// Define the type for the camera feed data
interface CameraFeedData {
  objectDetection: { url: string; active: boolean }
  thermal: { url: string; active: boolean }
  lidar: { url: string; active: boolean }
  customFeed: { url: string; active: boolean }
}

// Function to update camera feed data
const updateCameraFeedData = (data: CameraFeedData) => {
  // Implementation of the function
  console.log("Camera feed data updated:", data)

  // You might want to dispatch this to a global state or context
  // Or make an API call to update the backend

  // If you need to access window or global objects:
  if (typeof window !== "undefined") {
    // Safe to use window here
    window.dispatchEvent(new CustomEvent("cameraFeedUpdated", { detail: data }))
  }
}

export function CameraFeeds({ compact = false }: CameraFeedsProps) {
  // Local storage keys
  const savedFeedsKey = "hexabot-saved-feeds"
  const urlsKey = "hexabot-camera-urls"
  const activeFeedsKey = "hexabot-active-feeds"
  const embedModeKey = "hexabot-embed-modes"

  // Initialize state from localStorage or use defaults
  const [objectDetectionUrl, setObjectDetectionUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUrls = localStorage.getItem(urlsKey)
      if (savedUrls) {
        try {
          const urls = JSON.parse(savedUrls)
          return urls.objectDetection || "/placeholder.svg?height=720&width=1280"
        } catch (e) {
          console.error("Error parsing saved URLs:", e)
        }
      }
    }
    return "/placeholder.svg?height=720&width=1280"
  })

  const [thermalUrl, setThermalUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUrls = localStorage.getItem(urlsKey)
      if (savedUrls) {
        try {
          const urls = JSON.parse(savedUrls)
          return urls.thermal || "/placeholder.svg?height=720&width=1280"
        } catch (e) {
          console.error("Error parsing saved URLs:", e)
        }
      }
    }
    return "/placeholder.svg?height=720&width=1280"
  })

  const [lidarUrl, setLidarUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUrls = localStorage.getItem(urlsKey)
      if (savedUrls) {
        try {
          const urls = JSON.parse(savedUrls)
          return urls.lidar || "/placeholder.svg?height=720&width=1280"
        } catch (e) {
          console.error("Error parsing saved URLs:", e)
        }
      }
    }
    return "/placeholder.svg?height=720&width=1280"
  })

  const [customFeedUrl, setCustomFeedUrl] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUrls = localStorage.getItem(urlsKey)
      if (savedUrls) {
        try {
          const urls = JSON.parse(savedUrls)
          return urls.customFeed || "/placeholder.svg?height=720&width=1280"
        } catch (e) {
          console.error("Error parsing saved URLs:", e)
        }
      }
    }
    return "/placeholder.svg?height=720&width=1280"
  })

  const [activeFeeds, setActiveFeeds] = useState(() => {
    if (typeof window !== "undefined") {
      const savedActiveFeeds = localStorage.getItem(activeFeedsKey)
      if (savedActiveFeeds) {
        try {
          return JSON.parse(savedActiveFeeds)
        } catch (e) {
          console.error("Error parsing saved active feeds:", e)
        }
      }
    }
    return {
      objectDetection: false,
      thermal: false,
      lidar: false,
      customFeed: false,
    }
  })

  const [embedMode, setEmbedMode] = useState(() => {
    if (typeof window !== "undefined") {
      const savedEmbedModes = localStorage.getItem(embedModeKey)
      if (savedEmbedModes) {
        try {
          return JSON.parse(savedEmbedModes)
        } catch (e) {
          console.error("Error parsing saved embed modes:", e)
        }
      }
    }
    return {
      objectDetection: "direct" as "direct" | "iframe" | "hls",
      thermal: "direct" as "direct" | "iframe" | "hls",
      lidar: "direct" as "direct" | "iframe" | "hls",
      customFeed: "direct" as "direct" | "iframe" | "hls",
    }
  })

  const [savedFeeds, setSavedFeeds] = useState<SavedFeed[]>([])
  const [feedName, setFeedName] = useState("")
  const [loading, setLoading] = useState({
    objectDetection: false,
    thermal: false,
    lidar: false,
    customFeed: false,
  })
  const [error, setError] = useState({
    objectDetection: null as string | null,
    thermal: null as string | null,
    lidar: null as string | null,
    customFeed: null as string | null,
  })
  const [maximizedFeed, setMaximizedFeed] = useState<string | null>(null)
  const { addLog } = useLogContext()
  const initialLoadRef = useRef(false)
  const videoRefs = {
    objectDetection: useRef<HTMLVideoElement>(null),
    thermal: useRef<HTMLVideoElement>(null),
    lidar: useRef<HTMLVideoElement>(null),
    customFeed: useRef<HTMLVideoElement>(null),
  }
  const iframeRefs = {
    objectDetection: useRef<HTMLIFrameElement>(null),
    thermal: useRef<HTMLIFrameElement>(null),
    lidar: useRef<HTMLIFrameElement>(null),
    customFeed: useRef<HTMLIFrameElement>(null),
  }
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Load saved feeds from localStorage on component mount
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true
      // This will only run once after the component mounts
      addLog({
        message: "Camera feeds initialized",
        type: "info",
        timestamp: new Date(),
      })

      // Load saved feeds
      const storedFeeds = localStorage.getItem(savedFeedsKey)
      if (storedFeeds) {
        try {
          const parsedFeeds = JSON.parse(storedFeeds)
          // Convert string timestamps back to Date objects
          const feedsWithDateObjects = parsedFeeds.map((feed: any) => ({
            ...feed,
            timestamp: new Date(feed.timestamp),
            isImage: feed.isImage || false, // Add default for backward compatibility
          }))
          setSavedFeeds(feedsWithDateObjects)

          if (parsedFeeds.length > 0) {
            addLog({
              message: `Loaded ${parsedFeeds.length} saved camera feeds from storage`,
              type: "info",
              timestamp: new Date(),
            })
          }
        } catch (error) {
          console.error("Error parsing saved feeds:", error)
        }
      }
    }
  }, [addLog, savedFeedsKey])

  // Save URLs to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urls = {
        objectDetection: objectDetectionUrl,
        thermal: thermalUrl,
        lidar: lidarUrl,
        customFeed: customFeedUrl,
      }
      localStorage.setItem(urlsKey, JSON.stringify(urls))
    }
  }, [objectDetectionUrl, thermalUrl, lidarUrl, customFeedUrl, urlsKey])

  // Save active feeds to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(activeFeedsKey, JSON.stringify(activeFeeds))
    }
  }, [activeFeeds, activeFeedsKey])

  // Save embed modes to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(embedModeKey, JSON.stringify(embedMode))
    }
  }, [embedMode, embedModeKey])

  // Save feeds to localStorage whenever they change
  useEffect(() => {
    if (savedFeeds.length > 0) {
      localStorage.setItem(savedFeedsKey, JSON.stringify(savedFeeds))
    }
  }, [savedFeeds, savedFeedsKey])

  // Update the global camera feed data whenever feeds change
  useEffect(() => {
    updateCameraFeedData({
      objectDetection: {
        url: objectDetectionUrl,
        active: activeFeeds.objectDetection,
      },
      thermal: {
        url: thermalUrl,
        active: activeFeeds.thermal,
      },
      lidar: {
        url: lidarUrl,
        active: activeFeeds.lidar,
      },
      customFeed: {
        url: customFeedUrl,
        active: activeFeeds.customFeed,
      },
    })
  }, [objectDetectionUrl, thermalUrl, lidarUrl, customFeedUrl, activeFeeds])

  // Handle escape key to exit fullscreen
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && maximizedFeed) {
        setMaximizedFeed(null)
      }
    }

    window.addEventListener("keydown", handleEscapeKey)
    return () => window.removeEventListener("keydown", handleEscapeKey)
  }, [maximizedFeed])

  const toggleFeed = useCallback(
    (feed: keyof typeof activeFeeds) => {
      setActiveFeeds((prev) => {
        const newState = { ...prev, [feed]: !prev[feed] }
        addLog({
          message: `${feed.charAt(0).toUpperCase() + feed.slice(1)} camera ${
            newState[feed] ? "activated" : "deactivated"
          }`,
          type: "info",
          timestamp: new Date(),
        })
        return newState
      })
    },
    [addLog],
  )

  const getFeedUrl = useCallback(
    (feedType: string) => {
      switch (feedType) {
        case "objectDetection":
          return objectDetectionUrl
        case "thermal":
          return thermalUrl
        case "lidar":
          return lidarUrl
        case "customFeed":
          return customFeedUrl
        default:
          return ""
      }
    },
    [objectDetectionUrl, thermalUrl, lidarUrl, customFeedUrl],
  )

  const fetchFeed = useCallback(
    async (feed: keyof typeof activeFeeds, url: string) => {
      if (!url || url.includes("placeholder")) {
        return
      }

      setLoading((prev) => ({ ...prev, [feed]: true }))
      setError((prev) => ({ ...prev, [feed]: null }))

      try {
        // First, check if the URL is valid
        try {
          new URL(url)
        } catch (e) {
          throw new Error("Invalid URL format")
        }

        // Update the URL state
        switch (feed) {
          case "objectDetection":
            setObjectDetectionUrl(url)
            break
          case "thermal":
            setThermalUrl(url)
            break
          case "lidar":
            setLidarUrl(url)
            break
          case "customFeed":
            setCustomFeedUrl(url)
            break
        }

        // Update the global camera feed data
        updateCameraFeedData({
          objectDetection: {
            url: feed === "objectDetection" ? url : objectDetectionUrl,
            active: activeFeeds.objectDetection,
          },
          thermal: {
            url: feed === "thermal" ? url : thermalUrl,
            active: activeFeeds.thermal,
          },
          lidar: {
            url: feed === "lidar" ? url : lidarUrl,
            active: activeFeeds.lidar,
          },
          customFeed: {
            url: feed === "customFeed" ? url : customFeedUrl,
            active: activeFeeds.customFeed,
          },
        })

        addLog({
          message: `Updated ${feed} camera URL to ${url}`,
          type: "success",
          timestamp: new Date(),
        })

        // Activate the feed
        setActiveFeeds((prev) => ({
          ...prev,
          [feed]: true,
        }))
      } catch (err: any) {
        console.error(`Error setting ${feed} feed:`, err)
        let errorMessage = "Failed to set feed URL"
        if (err instanceof Error) {
          errorMessage = err.message
        }
        setError((prev) => ({ ...prev, [feed]: errorMessage }))
        addLog({
          message: `Error setting ${feed} feed URL: ${errorMessage}`,
          type: "error",
          timestamp: new Date(),
        })
      } finally {
        setLoading((prev) => ({ ...prev, [feed]: false }))
      }
    },
    [addLog, objectDetectionUrl, thermalUrl, lidarUrl, customFeedUrl, activeFeeds],
  )

  const handleUrlChange = (feed: keyof typeof activeFeeds, url: string) => {
    switch (feed) {
      case "objectDetection":
        setObjectDetectionUrl(url)
        break
      case "thermal":
        setThermalUrl(url)
        break
      case "lidar":
        setLidarUrl(url)
        break
      case "customFeed":
        setCustomFeedUrl(url)
        break
    }
  }

  const handleUpdateUrl = useCallback(
    (feed: keyof typeof activeFeeds) => {
      const url = getFeedUrl(feed)
      fetchFeed(feed, url)
    },
    [fetchFeed, getFeedUrl],
  )

  // Function to capture a frame from video as an image
  const captureVideoFrame = (videoElement: HTMLVideoElement | null): string => {
    if (!videoElement || videoElement.videoWidth === 0) {
      console.warn("Video element not ready for capture")
      return ""
    }

    try {
      const canvas = canvasRef.current || document.createElement("canvas")
      canvas.width = videoElement.videoWidth || 640
      canvas.height = videoElement.videoHeight || 480
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        console.error("Could not get canvas context")
        return ""
      }

      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height)

      // For debugging
      console.log(`Captured frame: ${canvas.width}x${canvas.height}`)

      // Explicitly use JPEG format with high quality
      return canvas.toDataURL("image/jpeg", 0.95)
    } catch (err) {
      console.error("Error capturing video frame:", err)
      return ""
    }
  }

  const saveFeed = useCallback(
    (type: "objectDetection" | "thermal" | "lidar" | "customFeed", saveAsImage = true) => {
      const url = getFeedUrl(type)
      const name = feedName || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleString()}`

      let savedUrl = url
      let isImage = false

      // Always try to capture as image if we have a video element
      if (videoRefs[type]?.current) {
        const imageUrl = captureVideoFrame(videoRefs[type].current)
        if (imageUrl) {
          console.log(`Captured image URL length: ${imageUrl.length}`)
          savedUrl = imageUrl
          isImage = true
        } else {
          console.warn(`Failed to capture image for ${type}`)
        }
      }

      const newSavedFeed: SavedFeed = {
        id: Date.now().toString(),
        type,
        url: savedUrl,
        timestamp: new Date(),
        name,
        isImage,
      }

      setSavedFeeds((prev) => [...prev, newSavedFeed])
      setFeedName("")

      addLog({
        message: `Saved ${type} camera feed as ${isImage ? "image" : "video"}: ${name}`,
        type: "success",
        timestamp: new Date(),
      })
    },
    [addLog, feedName, getFeedUrl],
  )

  const deleteSavedFeed = useCallback(
    (id: string) => {
      setSavedFeeds((prev) => prev.filter((feed) => feed.id !== id))
      addLog({
        message: "Deleted saved camera feed",
        type: "info",
        timestamp: new Date(),
      })
    },
    [addLog],
  )

  const handleEmbedModeChange = useCallback(
    (feed: keyof typeof embedMode, mode: "direct" | "iframe" | "hls") => {
      setEmbedMode((prev) => ({
        ...prev,
        [feed]: mode,
      }))

      addLog({
        message: `Changed ${feed} display mode to ${mode}`,
        type: "info",
        timestamp: new Date(),
      })
    },
    [addLog],
  )

  const toggleMaximize = useCallback(
    (feedType: string | null) => {
      setMaximizedFeed(feedType)
      if (feedType) {
        addLog({
          message: `Maximized ${feedType} feed`,
          type: "info",
          timestamp: new Date(),
        })
      }
    },
    [addLog],
  )

  // Helper functions
  const getFeedDescription = (feedType: string) => {
    switch (feedType) {
      case "objectDetection":
        return "Visual camera with object recognition"
      case "thermal":
        return "Heat signature detection"
      case "lidar":
        return "3D mapping and obstacle detection"
      case "customFeed":
        return "Custom video feed"
      default:
        return ""
    }
  }

  const getFeedIcon = (feedType: string) => {
    switch (feedType) {
      case "objectDetection":
        return <CameraIcon className="h-4 w-4 text-muted-foreground" />
      case "thermal":
        return <ThermometerIcon className="h-4 w-4 text-muted-foreground" />
      case "lidar":
        return <ScanIcon className="h-4 w-4 text-muted-foreground" />
      case "customFeed":
        return <CameraIcon className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const isRtspUrl = (url: string): boolean => {
    return url.toLowerCase().startsWith("rtsp://")
  }

  const handleVideoError = (feedType: string) => {
    setError((prev) => ({
      ...prev,
      [feedType]: "Failed to load video stream. Try using iframe or HLS mode.",
    }))
  }

  const renderFeedContent = (feedType: string, isMaximized = false) => {
    const url = getFeedUrl(feedType)
    const mode = embedMode[feedType]

    if (loading[feedType]) {
      return (
        <div
          className={`w-full ${
            isMaximized ? "h-full" : "aspect-video"
          } flex items-center justify-center bg-muted rounded-md border`}
        >
          <Skeleton className={`${isMaximized ? "h-32 w-32" : "h-16 w-16"}`} />
        </div>
      )
    }

    if (error[feedType]) {
      return (
        <div
          className={`w-full ${
            isMaximized ? "h-full" : "aspect-video"
          } flex flex-col items-center justify-center bg-muted/30 rounded-md border border-destructive p-4 text-center`}
        >
          <AlertCircleIcon className="h-8 w-8 text-destructive mb-2" />
          <div className="text-destructive font-medium">{error[feedType]}</div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setError((prev) => ({ ...prev, [feedType]: null }))}
          >
            Dismiss
          </Button>
        </div>
      )
    }

    if (!activeFeeds[feedType]) {
      return (
        <div
          className={`w-full ${
            isMaximized ? "h-full" : "aspect-video"
          } flex flex-col items-center justify-center bg-muted/30 rounded-md border p-4 text-center`}
        >
          <div className="text-muted-foreground mb-2">Feed inactive</div>
          <Button size="sm" onClick={() => toggleFeed(feedType as keyof typeof activeFeeds)}>
            <PlayIcon className="h-4 w-4 mr-2" />
            Activate Feed
          </Button>
        </div>
      )
    }

    if (mode === "direct") {
      // Check if it's an RTSP URL
      if (isRtspUrl(url)) {
        return (
          <div
            className={`relative w-full ${isMaximized ? "h-full" : "aspect-video"} bg-black rounded-md overflow-hidden`}
          >
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertCircleIcon className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="text-lg font-medium mb-1">RTSP Stream Detected</h3>
              <p className="text-sm text-muted-foreground mb-4">
                RTSP streams cannot be displayed directly in browsers. Please use one of these options:
              </p>
              <div className="flex flex-col gap-2 w-full max-w-md">
                <Button
                  variant="outline"
                  onClick={() => handleEmbedModeChange(feedType as keyof typeof embedMode, "iframe")}
                >
                  Switch to Iframe Mode
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleEmbedModeChange(feedType as keyof typeof embedMode, "hls")}
                >
                  Switch to HLS Mode
                </Button>
                <div className="text-xs text-muted-foreground mt-2">
                  Note: You'll need a streaming server that converts RTSP to HTTP/HLS
                </div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div
          className={`relative w-full ${isMaximized ? "h-full" : "aspect-video"} bg-black rounded-md overflow-hidden`}
        >
          <video
            ref={videoRefs[feedType as keyof typeof videoRefs]}
            src={url}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
            muted
            loop
            onError={() => handleVideoError(feedType)}
          />
          {!isMaximized && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                onClick={() => toggleMaximize(feedType)}
              >
                <MaximizeIcon className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                onClick={() => saveFeed(feedType as "objectDetection" | "thermal" | "lidar" | "customFeed", true)}
              >
                <SaveIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )
    }

    if (mode === "iframe") {
      return (
        <div
          className={`relative w-full ${isMaximized ? "h-full" : "aspect-video"} bg-black rounded-md overflow-hidden`}
        >
          {isRtspUrl(url) ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertCircleIcon className="h-8 w-8 text-amber-500 mb-2" />
              <h3 className="text-lg font-medium mb-1">RTSP Stream Configuration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To view this RTSP stream, you need a web server that can proxy the stream.
              </p>
              <div className="text-xs text-muted-foreground mt-2 max-w-md">
                <p className="mb-2">
                  Your current RTSP URL: <code className="bg-muted p-1 rounded">{url}</code>
                </p>
                <p>Consider using:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>A Flask server with OpenCV</li>
                  <li>RTSP to WebRTC gateway</li>
                  <li>RTSP to HLS converter</li>
                </ul>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRefs[feedType as keyof typeof iframeRefs]}
              src={url}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
          {!isMaximized && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                size="icon"
                variant="outline"
                className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                onClick={() => toggleMaximize(feedType)}
              >
                <MaximizeIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )
    }

    // HLS mode
    return (
      <div className={`relative w-full ${isMaximized ? "h-full" : "aspect-video"} bg-black rounded-md overflow-hidden`}>
        {isRtspUrl(url) ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <AlertCircleIcon className="h-8 w-8 text-amber-500 mb-2" />
            <h3 className="text-lg font-medium mb-1">RTSP to HLS Conversion Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              To view this RTSP stream as HLS, you need to convert it using a streaming server.
            </p>
            <div className="text-xs text-muted-foreground mt-2 max-w-md">
              <p className="mb-2">
                Your current RTSP URL: <code className="bg-muted p-1 rounded">{url}</code>
              </p>
              <p>Recommended solutions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>FFmpeg with HLS output</li>
                <li>Media servers like Wowza or Ant Media</li>
                <li>Node-Media-Server</li>
              </ul>
              <p className="mt-2">Once converted, update the URL to the HLS stream (usually ending in .m3u8)</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-sm">HLS player would be implemented here</div>
          </div>
        )}
        {!isMaximized && (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7 bg-background/80 backdrop-blur-sm"
              onClick={() => toggleMaximize(feedType)}
            >
              <MaximizeIcon className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Render the camera feeds grid
  const renderCameraFeeds = () => {
    if (maximizedFeed) {
      return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">
              {maximizedFeed.charAt(0).toUpperCase() + maximizedFeed.slice(1) + " Camera"}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => toggleMaximize(null)}>
              <XIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 p-4">{renderFeedContent(maximizedFeed, true)}</div>
        </div>
      )
    }

    return (
      <div className="flex flex-col space-y-6">
        {/* Object Detection Camera */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Object Detection</CardTitle>
              <CardDescription>Visual camera with object recognition</CardDescription>
            </div>
            {getFeedIcon("objectDetection")}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter camera URL"
                value={objectDetectionUrl}
                onChange={(e) => handleUrlChange("objectDetection", e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => handleUpdateUrl("objectDetection")}
                disabled={loading.objectDetection}
              >
                {loading.objectDetection ? "Loading..." : "Update"}
              </Button>
            </div>
            {renderFeedContent("objectDetection")}
          </CardContent>
          <CardFooter className="flex justify-between p-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeFeeds.objectDetection ? "outline" : "default"}
                onClick={() => toggleFeed("objectDetection")}
              >
                {activeFeeds.objectDetection ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveFeed("objectDetection", true)}
                disabled={!activeFeeds.objectDetection}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Image
              </Button>
            </div>
            <Select
              value={embedMode.objectDetection}
              onValueChange={(value) => handleEmbedModeChange("objectDetection", value as any)}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="iframe">Iframe</SelectItem>
                <SelectItem value="hls">HLS</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>

        {/* Thermal Camera */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Thermal Imaging</CardTitle>
              <CardDescription>Heat signature detection</CardDescription>
            </div>
            {getFeedIcon("thermal")}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter camera URL"
                value={thermalUrl}
                onChange={(e) => handleUrlChange("thermal", e.target.value)}
              />
              <Button variant="outline" onClick={() => handleUpdateUrl("thermal")} disabled={loading.thermal}>
                {loading.thermal ? "Loading..." : "Update"}
              </Button>
            </div>
            {renderFeedContent("thermal")}
          </CardContent>
          <CardFooter className="flex justify-between p-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeFeeds.thermal ? "outline" : "default"}
                onClick={() => toggleFeed("thermal")}
              >
                {activeFeeds.thermal ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveFeed("thermal", true)}
                disabled={!activeFeeds.thermal}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Image
              </Button>
            </div>
            <Select value={embedMode.thermal} onValueChange={(value) => handleEmbedModeChange("thermal", value as any)}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="iframe">Iframe</SelectItem>
                <SelectItem value="hls">HLS</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>

        {/* LIDAR Camera */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">LIDAR</CardTitle>
              <CardDescription>3D mapping and obstacle detection</CardDescription>
            </div>
            {getFeedIcon("lidar")}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter camera URL"
                value={lidarUrl}
                onChange={(e) => handleUrlChange("lidar", e.target.value)}
              />
              <Button variant="outline" onClick={() => handleUpdateUrl("lidar")} disabled={loading.lidar}>
                {loading.lidar ? "Loading..." : "Update"}
              </Button>
            </div>
            {renderFeedContent("lidar")}
          </CardContent>
          <CardFooter className="flex justify-between p-4">
            <div className="flex gap-2">
              <Button size="sm" variant={activeFeeds.lidar ? "outline" : "default"} onClick={() => toggleFeed("lidar")}>
                {activeFeeds.lidar ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => saveFeed("lidar", true)} disabled={!activeFeeds.lidar}>
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Image
              </Button>
            </div>
            <Select value={embedMode.lidar} onValueChange={(value) => handleEmbedModeChange("lidar", value as any)}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="iframe">Iframe</SelectItem>
                <SelectItem value="hls">HLS</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>

        {/* Custom Feed */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium">Custom Feed</CardTitle>
              <CardDescription>Additional video feed</CardDescription>
            </div>
            {getFeedIcon("customFeed")}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter camera URL"
                value={customFeedUrl}
                onChange={(e) => handleUrlChange("customFeed", e.target.value)}
              />
              <Button variant="outline" onClick={() => handleUpdateUrl("customFeed")} disabled={loading.customFeed}>
                {loading.customFeed ? "Loading..." : "Update"}
              </Button>
            </div>
            {renderFeedContent("customFeed")}
          </CardContent>
          <CardFooter className="flex justify-between p-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={activeFeeds.customFeed ? "outline" : "default"}
                onClick={() => toggleFeed("customFeed")}
              >
                {activeFeeds.customFeed ? (
                  <>
                    <PauseIcon className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => saveFeed("customFeed", true)}
                disabled={!activeFeeds.customFeed}
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                Save Image
              </Button>
            </div>
            <Select
              value={embedMode.customFeed}
              onValueChange={(value) => handleEmbedModeChange("customFeed", value as any)}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct</SelectItem>
                <SelectItem value="iframe">Iframe</SelectItem>
                <SelectItem value="hls">HLS</SelectItem>
              </SelectContent>
            </Select>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Render saved feeds
  const renderSavedFeeds = () => {
    if (savedFeeds.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <FolderIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No saved feeds</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Save camera feeds to view them here. Saved feeds are stored in your browser.
          </p>
        </div>
      )
    }

    return (
      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {savedFeeds.map((feed) => (
            <Card key={feed.id} className="overflow-hidden">
              <div className="aspect-video relative">
                {feed.isImage ? (
                  <img
                    src={feed.url || "/placeholder.svg"}
                    alt={feed.name}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      // Open image in new tab for viewing
                      const win = window.open("", "_blank")
                      if (win) {
                        win.document.write(`
                          <html>
                            <head><title>${feed.name}</title></head>
                            <body style="margin:0;display:flex;justify-content:center;align-items:center;background:#000;">
                              <img src="${feed.url}" style="max-width:100%;max-height:100vh;" />
                            </body>
                          </html>
                        `)
                      }
                    }}
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=720&width=1280"
                      console.error("Failed to load image:", feed.url)
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <InfoIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                    onClick={() => deleteSavedFeed(feed.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                  {feed.isImage && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                      onClick={() => {
                        const a = document.createElement("a")
                        a.href = feed.url
                        a.download = `${feed.name.replace(/\s+/g, "-")}.jpg`
                        document.body.appendChild(a)
                        a.click()
                        document.body.removeChild(a)
                      }}
                    >
                      <DownloadIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium truncate">{feed.name}</div>
                  <Badge variant="outline">{feed.isImage ? "Image" : "Video URL"}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{feed.timestamp.toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    )
  }

  // Hidden canvas for capturing video frames
  const hiddenCanvas = <canvas ref={canvasRef} className="hidden" />

  if (compact) {
    return (
      <div className="h-[200px]">
        <Tabs defaultValue="objectDetection">
          <div className="flex items-center justify-between mb-1">
            <TabsList className="w-auto">
              <TabsTrigger value="objectDetection" className="flex-1">
                <CameraIcon className="h-4 w-4 mr-2" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="thermal" className="flex-1">
                <ThermometerIcon className="h-4 w-4 mr-2" />
                Thermal
              </TabsTrigger>
              <TabsTrigger value="lidar" className="flex-1">
                <ScanIcon className="h-4 w-4 mr-2" />
                LIDAR
              </TabsTrigger>
              <TabsTrigger value="customFeed" className="flex-1">
                <CameraIcon className="h-4 w-4 mr-2" />
                Custom
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="objectDetection" className="mt-0">
            {renderFeedContent("objectDetection")}
          </TabsContent>
          <TabsContent value="thermal" className="mt-0">
            {renderFeedContent("thermal")}
            <div className="absolute top-9 right-4 z-10">
              <Select
                value={embedMode.thermal}
                onValueChange={(value) => handleEmbedModeChange("thermal", value as any)}
              >
                <SelectTrigger className="w-[90px] h-7 text-xs bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="iframe">Iframe</SelectItem>
                  <SelectItem value="hls">HLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="lidar" className="mt-0">
            {renderFeedContent("lidar")}
            <div className="absolute top-9 right-4 z-10">
              <Select value={embedMode.lidar} onValueChange={(value) => handleEmbedModeChange("lidar", value as any)}>
                <SelectTrigger className="w-[90px] h-7 text-xs bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="iframe">Iframe</SelectItem>
                  <SelectItem value="hls">HLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          <TabsContent value="customFeed" className="mt-0">
            {renderFeedContent("customFeed")}
            <div className="absolute top-9 right-4 z-10">
              <Select
                value={embedMode.customFeed}
                onValueChange={(value) => handleEmbedModeChange("customFeed", value as any)}
              >
                <SelectTrigger className="w-[90px] h-7 text-xs bg-background/80 backdrop-blur-sm">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="iframe">Iframe</SelectItem>
                  <SelectItem value="hls">HLS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        {hiddenCanvas}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Camera Feeds</h2>
          <p className="text-muted-foreground">Monitor real-time video feeds from the robot's cameras.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="feed-name">Feed Name</Label>
            <Input
              id="feed-name"
              placeholder="Enter name to save"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              className="w-[200px]"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderIcon className="h-4 w-4 mr-2" />
                Saved Feeds
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Saved Camera Feeds</DialogTitle>
              </DialogHeader>
              {renderSavedFeeds()}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {renderCameraFeeds()}
      {hiddenCanvas}
    </div>
  )
}
