"use server"

// Define the weather data interface
export interface WeatherData {
  temperature: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData> {
  // Only use the server-side environment variable
  const API_KEY = process.env.OPENWEATHER_API_KEY

  if (!API_KEY) {
    console.error("API key is missing")
    throw new Error("Weather API key is missing. Please check server configuration.")
  }

  try {
    console.log(`Fetching weather data for lat: ${lat}, lon: ${lon}`)

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    const response = await fetch(url, { cache: "no-store" })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Weather API error: ${response.status} ${response.statusText}`, errorText)
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("Weather API response:", JSON.stringify(data))

    // Validate the response data
    if (!data || !data.main || !data.weather || !data.weather[0]) {
      console.error("Invalid weather data format:", data)
      throw new Error("Invalid weather data received from API")
    }

    return {
      temperature: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
    }
  } catch (error) {
    console.error("Error fetching weather data:", error)
    // Re-throw with a more user-friendly message
    throw new Error(`Failed to fetch weather data: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
