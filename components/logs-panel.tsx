"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, InfoIcon, CheckCircleIcon, AlertTriangleIcon, DownloadIcon, TrashIcon } from "lucide-react"
import { useLogContext } from "@/context/log-context"

interface LogsPanelProps {
  compact?: boolean
}

export function LogsPanel({ compact = false }: LogsPanelProps) {
  const { logs, clearLogs } = useLogContext()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [logs])

  const getLogIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircleIcon className="h-4 w-4 text-destructive" />
      case "warning":
        return <AlertTriangleIcon className="h-4 w-4 text-warning" />
      case "success":
        return <CheckCircleIcon className="h-4 w-4 text-success" />
      case "info":
      default:
        return <InfoIcon className="h-4 w-4 text-info" />
    }
  }

  const getLogBadge = (type: string) => {
    switch (type) {
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="text-warning border-warning">
            Warning
          </Badge>
        )
      case "success":
        return (
          <Badge variant="outline" className="text-success border-success">
            Success
          </Badge>
        )
      case "info":
      default:
        return <Badge variant="outline">Info</Badge>
    }
  }

  const downloadLogs = () => {
    const logText = logs
      .map((log) => `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] ${log.message}`)
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hexa-bot-logs-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (compact) {
    return (
      <div className="h-[200px] flex flex-col">
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4">
            {logs.slice(-5).map((log, index) => (
              <div key={index} className="flex items-start gap-2 text-xs">
                <div className="mt-0.5">{getLogIcon(log.type)}</div>
                <div>
                  <div className="font-medium">{log.message}</div>
                  <div className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">{logs.length} log entries</div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadLogs}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 pr-4">
          {logs.map((log, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 border-b">
              <div className="mt-0.5">{getLogIcon(log.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{log.message}</div>
                  {getLogBadge(log.type)}
                </div>
                <div className="text-sm text-muted-foreground">{log.timestamp.toLocaleString()}</div>
              </div>
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  )
}
