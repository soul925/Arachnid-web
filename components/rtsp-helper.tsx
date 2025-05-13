"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CameraIcon, ServerIcon, CodeIcon, CopyIcon, CheckIcon } from "lucide-react"

export function RtspHelper() {
  const [rtspUrl, setRtspUrl] = useState("rtsp://10.8.0.249:8080/h264.sdp")
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const flaskCode = `
from flask import Flask, Response
import cv2
import threading

app = Flask(__name__)

# Store the RTSP URL
rtsp_url = "${rtspUrl}"
camera = None
output_frame = None
lock = threading.Lock()

def generate_frames():
    global output_frame, camera
    
    # Initialize camera
    camera = cv2.VideoCapture(rtsp_url)
    
    if not camera.isOpened():
        print("Error: Could not open RTSP stream.")
        return
    
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            # Encode the frame as JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
                
            # Convert to bytes and yield for streaming
            frame_bytes = buffer.tobytes()
            yield (b'--frame\\r\\n'
                   b'Content-Type: image/jpeg\\r\\n\\r\\n' + frame_bytes + b'\\r\\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/')
def index():
    return """
    <html>
      <head>
        <title>RTSP Stream</title>
      </head>
      <body>
        <h1>RTSP Stream</h1>
        <img src="/video_feed" width="640" height="480" />
      </body>
    </html>
    """

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
  `.trim()

  const nodeCode = `
const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  },
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        mode: 'push',
        edge: '${rtspUrl}',
        name: 'stream',
        rtsp_transport: 'tcp' // or 'udp'
      }
    ]
  }
};

var nms = new NodeMediaServer(config)
nms.run();

// Access the HLS stream at: http://localhost:8000/live/stream/index.m3u8
  `.trim()

  const ffmpegCommand = `ffmpeg -i "${rtspUrl}" -c:v copy -c:a aac -hls_time 2 -hls_list_size 10 -hls_flags delete_segments -hls_segment_filename "stream_%d.ts" stream.m3u8`

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CameraIcon className="h-5 w-5" />
          RTSP Stream Helper
        </CardTitle>
        <CardDescription>Tools and code examples to help you use RTSP streams in your web application</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rtsp-url">Your RTSP URL</Label>
            <Input
              id="rtsp-url"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              placeholder="rtsp://username:password@ip:port/path"
            />
            <p className="text-xs text-muted-foreground">This URL will be used in the code examples below</p>
          </div>

          <Tabs defaultValue="flask">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="flask">Flask + OpenCV</TabsTrigger>
              <TabsTrigger value="node">Node.js</TabsTrigger>
              <TabsTrigger value="ffmpeg">FFmpeg</TabsTrigger>
            </TabsList>

            <TabsContent value="flask" className="space-y-4">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Python Flask Server</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(flaskCode, "flask")}
                    className="h-8 gap-1"
                  >
                    {copied === "flask" ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                    <code>{flaskCode}</code>
                  </pre>
                </div>
                <div className="mt-2 text-sm">
                  <p>To use this code:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-xs text-muted-foreground">
                    <li>
                      Install requirements:{" "}
                      <code className="bg-muted p-1 rounded">pip install flask opencv-python</code>
                    </li>
                    <li>
                      Save as <code className="bg-muted p-1 rounded">app.py</code> and run with{" "}
                      <code className="bg-muted p-1 rounded">python app.py</code>
                    </li>
                    <li>
                      Access at <code className="bg-muted p-1 rounded">http://localhost:5000</code>
                    </li>
                    <li>
                      Use <code className="bg-muted p-1 rounded">http://localhost:5000/video_feed</code> as your camera
                      URL in the dashboard
                    </li>
                  </ol>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="node" className="space-y-4">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Node.js Media Server</h3>
                  <Button variant="ghost" size="sm" onClick={() => handleCopy(nodeCode, "node")} className="h-8 gap-1">
                    {copied === "node" ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" /> Copy Code
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                    <code>{nodeCode}</code>
                  </pre>
                </div>
                <div className="mt-2 text-sm">
                  <p>To use this code:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-xs text-muted-foreground">
                    <li>Install Node.js and FFmpeg</li>
                    <li>
                      Install node-media-server:{" "}
                      <code className="bg-muted p-1 rounded">npm install node-media-server</code>
                    </li>
                    <li>
                      Save as <code className="bg-muted p-1 rounded">server.js</code> and run with{" "}
                      <code className="bg-muted p-1 rounded">node server.js</code>
                    </li>
                    <li>
                      Access HLS stream at{" "}
                      <code className="bg-muted p-1 rounded">http://localhost:8000/live/stream/index.m3u8</code>
                    </li>
                  </ol>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ffmpeg" className="space-y-4">
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">FFmpeg Command</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(ffmpegCommand, "ffmpeg")}
                    className="h-8 gap-1"
                  >
                    {copied === "ffmpeg" ? (
                      <>
                        <CheckIcon className="h-3.5 w-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-3.5 w-3.5" /> Copy Command
                      </>
                    )}
                  </Button>
                </div>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                    <code>{ffmpegCommand}</code>
                  </pre>
                </div>
                <div className="mt-2 text-sm">
                  <p>To use this command:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1 text-xs text-muted-foreground">
                    <li>Install FFmpeg on your system</li>
                    <li>Run the command in your terminal</li>
                    <li>It will create HLS stream files in the current directory</li>
                    <li>Serve these files with a web server (Apache, Nginx, etc.)</li>
                    <li>
                      Access the stream at <code className="bg-muted p-1 rounded">http://your-server/stream.m3u8</code>
                    </li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          <ServerIcon className="h-3.5 w-3.5 inline mr-1" />
          These solutions require a server to convert RTSP to web-compatible formats
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open("https://github.com/aler9/rtsp-simple-server", "_blank")}
        >
          <CodeIcon className="h-3.5 w-3.5 mr-1" />
          More Solutions
        </Button>
      </CardFooter>
    </Card>
  )
}
