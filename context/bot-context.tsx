"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface BotStatus {
  battery: number
  signal: number
  temperature: number
  orientation: number
  status: string
  errors: string[]
}

interface BotContextType {
  botStatus: BotStatus
  updateBotStatus: (newStatus: Partial<BotStatus>) => void
}

const BotContext = createContext<BotContextType | undefined>(undefined)

export function BotProvider({ children }: { children: ReactNode }) {
  const [botStatus, setBotStatus] = useState<BotStatus>({
    battery: 85,
    signal: 92,
    temperature: 42,
    orientation: 45,
    status: "Operational",
    errors: [],
  })

  const updateBotStatus = (newStatus: Partial<BotStatus>) => {
    setBotStatus((prev) => ({ ...prev, ...newStatus }))
  }

  return <BotContext.Provider value={{ botStatus, updateBotStatus }}>{children}</BotContext.Provider>
}

export function useBotContext() {
  const context = useContext(BotContext)
  if (context === undefined) {
    throw new Error("useBotContext must be used within a BotProvider")
  }
  return context
}
