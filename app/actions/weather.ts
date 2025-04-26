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
  // Check for the API key - try both environment variables to ensure compatibility
  const API_KEY = process.env.OPENWEATHER_API_KEY || process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

  if (!API_KEY) {
    console.error("Weather API key is missing - using mock data")

    // Return mock data instead of throwing an error
    return {
      temperature: 25 + (Math.random() * 10 - 5), // Random temperature between 20-30°C
      description: "weather data unavailable",
      humidity: 60 + Math.floor(Math.random() * 20), // Random humidity between 60-80%
      windSpeed: 2 + Math.random() * 3, // Random wind speed between 2-5 m/s
      icon: "50d", // Mist icon as a fallback
    }
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
    console.log("Weather API response received")

    // Validate the response data
    if (!data || !data.main || !data.weather || !data.weather[0]) {
      console.error("Invalid weather data format")
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

    // Return mock data on error instead of throwing
    return {
      temperature: 25 + (Math.random() * 10 - 5),
      description: "data unavailable (API error)",
      humidity: 60 + Math.floor(Math.random() * 20),
      windSpeed: 2 + Math.random() * 3,
      icon: "50d",
    }
  }
}
