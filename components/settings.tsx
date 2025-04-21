"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLogContext } from "@/context/log-context"
import { EmergencyContacts } from "@/components/emergency-contacts"

export function Settings() {
  const [movementSpeed, setMovementSpeed] = useState(50)
  const [sensorSensitivity, setSensorSensitivity] = useState(70)
  const [autoReturn, setAutoReturn] = useState(true)
  const [lowBatteryThreshold, setLowBatteryThreshold] = useState(20)
  const [communicationMode, setCommunicationMode] = useState("standard")
  const [emergencyContact, setEmergencyContact] = useState("+1 (555) 123-4567")
  const [autoRecording, setAutoRecording] = useState(true)
  const { addLog } = useLogContext()

  const handleSaveGeneral = () => {
    addLog({
      message: "General settings updated",
      type: "success",
      timestamp: new Date(),
    })
  }

  const handleSaveSensors = () => {
    addLog({
      message: "Sensor settings updated",
      type: "success",
      timestamp: new Date(),
    })
  }

  const handleSaveSafety = () => {
    addLog({
      message: "Safety settings updated",
      type: "success",
      timestamp: new Date(),
    })
  }

  const handleResetToDefaults = () => {
    setMovementSpeed(50)
    setSensorSensitivity(70)
    setAutoReturn(true)
    setLowBatteryThreshold(20)
    setCommunicationMode("standard")
    setEmergencyContact("+1 (555) 123-4567")
    setAutoRecording(true)

    addLog({
      message: "All settings reset to defaults",
      type: "info",
      timestamp: new Date(),
    })
  }

  return (
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="sensors">Sensors</TabsTrigger>
        <TabsTrigger value="safety">Safety</TabsTrigger>
        <TabsTrigger value="emergency">Emergency</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movement-speed">Movement Speed ({movementSpeed}%)</Label>
            <Slider
              id="movement-speed"
              min={10}
              max={100}
              step={1}
              value={[movementSpeed]}
              onValueChange={(value) => setMovementSpeed(value[0])}
            />
            <p className="text-xs text-muted-foreground">Controls the maximum speed of the robot's movement.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="communication-mode">Communication Mode</Label>
            <Select value={communicationMode} onValueChange={setCommunicationMode}>
              <SelectTrigger id="communication-mode">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low-power">Low Power</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="high-bandwidth">High Bandwidth</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">Determines the communication protocol and bandwidth usage.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-recording">Automatic Recording</Label>
              <p className="text-xs text-muted-foreground">Automatically record video during missions</p>
            </div>
            <Switch id="auto-recording" checked={autoRecording} onCheckedChange={setAutoRecording} />
          </div>

          <Button onClick={handleSaveGeneral}>Save General Settings</Button>
        </div>
      </TabsContent>

      <TabsContent value="sensors" className="space-y-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sensor-sensitivity">Sensor Sensitivity ({sensorSensitivity}%)</Label>
            <Slider
              id="sensor-sensitivity"
              min={10}
              max={100}
              step={1}
              value={[sensorSensitivity]}
              onValueChange={(value) => setSensorSensitivity(value[0])}
            />
            <p className="text-xs text-muted-foreground">
              Adjusts the sensitivity of all sensors. Higher values may increase false positives.
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Object Detection</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="object-detection">Enabled</Label>
                  <Switch id="object-detection" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Thermal Imaging</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="thermal-imaging">Enabled</Label>
                  <Switch id="thermal-imaging" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">LIDAR</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="lidar">Enabled</Label>
                  <Switch id="lidar" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Audio Detection</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <Label htmlFor="audio-detection">Enabled</Label>
                  <Switch id="audio-detection" defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={handleSaveSensors}>Save Sensor Settings</Button>
        </div>
      </TabsContent>

      <TabsContent value="safety" className="space-y-4 mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="low-battery-threshold">Low Battery Threshold ({lowBatteryThreshold}%)</Label>
            <Slider
              id="low-battery-threshold"
              min={5}
              max={50}
              step={1}
              value={[lowBatteryThreshold]}
              onValueChange={(value) => setLowBatteryThreshold(value[0])}
            />
            <p className="text-xs text-muted-foreground">Battery level at which warnings will be triggered.</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-return">Automatic Return</Label>
              <p className="text-xs text-muted-foreground">Automatically return to base on low battery</p>
            </div>
            <Switch id="auto-return" checked={autoReturn} onCheckedChange={setAutoReturn} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency-contact">Emergency Contact</Label>
            <Input
              id="emergency-contact"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Contact to notify in case of emergency.</p>
          </div>

          <Button onClick={handleSaveSafety}>Save Safety Settings</Button>
        </div>
      </TabsContent>

      <TabsContent value="emergency" className="space-y-4 mt-4">
        <EmergencyContacts />
      </TabsContent>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handleResetToDefaults}>
          Reset to Defaults
        </Button>
        <Button variant="destructive">Factory Reset</Button>
      </div>
    </Tabs>
  )
}
