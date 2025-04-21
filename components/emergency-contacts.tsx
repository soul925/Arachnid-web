"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusIcon, TrashIcon, PhoneIcon, UserIcon, EditIcon } from "lucide-react"
import { useEmergencyContacts, type EmergencyContact } from "@/context/emergency-contact-context"
import { useLogContext } from "@/context/log-context"

export function EmergencyContacts() {
  const { contacts, addContact, updateContact, deleteContact } = useEmergencyContacts()
  const { addLog } = useLogContext()
  const [newContact, setNewContact] = useState({ name: "", phone: "", relationship: "" })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", phone: "", relationship: "" })

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      addLog({
        message: "Name and phone number are required for emergency contacts",
        type: "warning",
        timestamp: new Date(),
      })
      return
    }

    addContact(newContact)
    setNewContact({ name: "", phone: "", relationship: "" })
    addLog({
      message: `Added emergency contact: ${newContact.name}`,
      type: "success",
      timestamp: new Date(),
    })
  }

  const handleDeleteContact = (id: string, name: string) => {
    deleteContact(id)
    addLog({
      message: `Removed emergency contact: ${name}`,
      type: "info",
      timestamp: new Date(),
    })
  }

  const startEditing = (contact: EmergencyContact) => {
    setEditingId(contact.id)
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship || "",
    })
  }

  const saveEdit = () => {
    if (!editingId) return

    if (!editForm.name || !editForm.phone) {
      addLog({
        message: "Name and phone number are required for emergency contacts",
        type: "warning",
        timestamp: new Date(),
      })
      return
    }

    updateContact(editingId, editForm)
    setEditingId(null)
    addLog({
      message: `Updated emergency contact: ${editForm.name}`,
      type: "success",
      timestamp: new Date(),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contact-name">Name</Label>
                <div className="flex items-center mt-1">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="contact-name"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Contact name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-phone">Phone Number</Label>
                <div className="flex items-center mt-1">
                  <PhoneIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="contact-phone"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-relationship">Relationship (Optional)</Label>
                <Input
                  id="contact-relationship"
                  value={newContact.relationship}
                  onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                  placeholder="Family, Supervisor, etc."
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleAddContact} className="w-full">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Emergency Contact
            </Button>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Saved Contacts ({contacts.length})</h3>
            {contacts.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                No emergency contacts added yet
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <div key={contact.id} className="border rounded-md p-3">
                    {editingId === contact.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`edit-name-${contact.id}`}>Name</Label>
                            <Input
                              id={`edit-name-${contact.id}`}
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edit-phone-${contact.id}`}>Phone</Label>
                            <Input
                              id={`edit-phone-${contact.id}`}
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`edit-relationship-${contact.id}`}>Relationship</Label>
                          <Input
                            id={`edit-relationship-${contact.id}`}
                            value={editForm.relationship}
                            onChange={(e) => setEditForm({ ...editForm, relationship: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button variant="outline" size="sm" onClick={cancelEdit}>
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEdit}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-muted-foreground">{contact.phone}</div>
                          {contact.relationship && (
                            <div className="text-xs text-muted-foreground mt-1">{contact.relationship}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditing(contact)}>
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteContact(contact.id, contact.name)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
