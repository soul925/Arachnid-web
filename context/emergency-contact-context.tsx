"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship?: string
}

interface EmergencyContactContextType {
  contacts: EmergencyContact[]
  addContact: (contact: Omit<EmergencyContact, "id">) => void
  updateContact: (id: string, contact: Partial<EmergencyContact>) => void
  deleteContact: (id: string) => void
}

const EmergencyContactContext = createContext<EmergencyContactContextType | undefined>(undefined)

export function EmergencyContactProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])

  // Load contacts from localStorage on mount
  useEffect(() => {
    const storedContacts = localStorage.getItem("hexabot-emergency-contacts")
    if (storedContacts) {
      try {
        setContacts(JSON.parse(storedContacts))
      } catch (error) {
        console.error("Error parsing emergency contacts:", error)
      }
    }
  }, [])

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("hexabot-emergency-contacts", JSON.stringify(contacts))
  }, [contacts])

  const addContact = (contact: Omit<EmergencyContact, "id">) => {
    setContacts((prev) => [...prev, { ...contact, id: Date.now().toString() }])
  }

  const updateContact = (id: string, updatedContact: Partial<EmergencyContact>) => {
    setContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, ...updatedContact } : contact)))
  }

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id))
  }

  return (
    <EmergencyContactContext.Provider value={{ contacts, addContact, updateContact, deleteContact }}>
      {children}
    </EmergencyContactContext.Provider>
  )
}

export function useEmergencyContacts() {
  const context = useContext(EmergencyContactContext)
  if (context === undefined) {
    throw new Error("useEmergencyContacts must be used within an EmergencyContactProvider")
  }
  return context
}
