import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, CloudIcon } from "lucide-react"

export function WeatherFallback() {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Location & Weather</CardTitle>
        <MapPinIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <CloudIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Weather data unavailable</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            Weather information is currently unavailable. Please check your internet connection or try again later.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
