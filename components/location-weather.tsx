"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, ThermometerIcon, WindIcon, AlertCircleIcon } from "lucide-react"
import { useLogContext } from "@/context/log-context"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchWeatherData, type WeatherData } from "@/app/actions/weather"

interface LocationOption {
  name: string
  lat: number
  lon: number
}

export function LocationWeather() {
  const [location, setLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addLog } = useLogContext()

  // Predefined locations
  const locationOptions: LocationOption[] = [
    { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
    { name: "New York", lat: 40.7128, lon: -74.006 },
    { name: "London", lat: 51.5074, lon: -0.1278 },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
    { name: "Sydney", lat: -33.8688, lon: 151.2093 },
    { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
  ]

  const getWeatherData = async (lat: number, lon: number, locationName: string) => {
    if (!lat || !lon) return

    setLoading(true)
    setError(null)

    try {
      // Set the location immediately
      setLocation({
        lat,
        lon,
        name: locationName,
      })

      console.log(`Requesting weather data for ${locationName} (${lat}, ${lon})`)

      // Get weather data using server action
      const weatherData = await fetchWeatherData(lat, lon)
      console.log("Received weather data:", weatherData)

      if (weatherData) {
        setWeather(weatherData)
        addLog({
          message: `Weather data retrieved for ${locationName}: ${weatherData.description}, ${weatherData.temperature}°C`,
          type: "success",
          timestamp: new Date(),
        })
      } else {
        throw new Error("No weather data received")
      }
    } catch (err: any) {
      console.error("Error in getWeatherData:", err)
      const errorMessage = err?.message || "Failed to fetch weather data"
      setError(errorMessage)
      setWeather(null)
      addLog({
        message: `Error fetching weather data: ${errorMessage}`,
        type: "error",
        timestamp: new Date(),
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (locationName: string) => {
    setLoading(true)
    setError(null)

    const selectedLocation = locationOptions.find((loc) => loc.name === locationName)

    if (selectedLocation) {
      addLog({
        message: `Location changed to ${selectedLocation.name}`,
        type: "info",
        timestamp: new Date(),
      })

      getWeatherData(selectedLocation.lat, selectedLocation.lon, selectedLocation.name)
    }
  }

  useEffect(() => {
    // Use Bengaluru as default location on initial load
    const defaultLocation = locationOptions[0]
    addLog({
      message: `Using default location (${defaultLocation.name})`,
      type: "info",
      timestamp: new Date(),
    })

    getWeatherData(defaultLocation.lat, defaultLocation.lon, defaultLocation.name)
  }, [])

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Location & Weather</CardTitle>
        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Select onValueChange={handleLocationChange} defaultValue={locationOptions[0].name}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locationOptions.map((option) => (
                <SelectItem key={option.name} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-10 w-10" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircleIcon className="h-5 w-5" />
              <div className="font-medium">{error}</div>
            </div>
            <p className="text-sm text-muted-foreground">
              There was a problem fetching weather data. This could be due to a network issue or a problem with the
              weather service.
            </p>
            <Button onClick={() => handleLocationChange(locationOptions[0].name)}>Retry</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center">
              <MapPinIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">{location?.name}</h3>
            </div>
            <div className="mt-4 flex items-center">
              {weather?.icon && (
                <img
                  src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                  alt={weather.description}
                  className="h-16 w-16"
                />
              )}
              <div className="ml-2">
                <div className="text-2xl font-bold">{weather?.temperature.toFixed(1)}°C</div>
                <div className="text-muted-foreground capitalize">{weather?.description}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <ThermometerIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Humidity: {weather?.humidity}%</span>
              </div>
              <div className="flex items-center">
                <WindIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Wind: {weather?.windSpeed} m/s</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
