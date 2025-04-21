"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface LogEntry {
  message: string
  type: "info" | "warning" | "error" | "success"
  timestamp: Date
}

interface LogContextType {
  logs: LogEntry[]
  addLog: (log: LogEntry) => void
  clearLogs: () => void
}

const LogContext = createContext<LogContextType | undefined>(undefined)

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      message: "System initialized",
      type: "info",
      timestamp: new Date(),
    },
    {
      message: "Hexa Bot connected",
      type: "success",
      timestamp: new Date(),
    },
  ])

  // ✅ Use useCallback to prevent function recreation
  const addLog = useCallback((log: LogEntry) => {
    setLogs((prev) => [...prev, log])
  }, [])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return <LogContext.Provider value={{ logs, addLog, clearLogs }}>{children}</LogContext.Provider>
}

export function useLogContext() {
  const context = useContext(LogContext)
  if (context === undefined) {
    throw new Error("useLogContext must be used within a LogProvider")
  }
  return context
}
