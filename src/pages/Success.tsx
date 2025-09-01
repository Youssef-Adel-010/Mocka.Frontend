import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle, Copy, ExternalLink, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"
import { API_BASE } from '@/lib/api'

export function Success() {
  const [copied, setCopied] = useState(false)
  const location = useLocation()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Expect location.state to contain { token?: string, ExpiryDate?: string, fileName?: string }
  const fileName = location.state?.fileName || "your-api.json"
  const token = location.state?.token || location.state?.tokenString || null
  const expiryRaw = location.state?.ExpiryDate || location.state?.expiryDate || location.state?.expiry || null
  const mockApiUrl = token ? `${API_BASE}/${token}` : `https://api.mocka.dev/v1/${fileName.replace(/\.[^/.]+$/, "")}-${Math.random().toString(36).substr(2, 9)}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(mockApiUrl)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Mock API URL copied to clipboard.",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the URL manually.",
        variant: "destructive",
      })
    }
  }

  const openInNewTab = () => {
    window.open(mockApiUrl, '_blank')
  }

  // Format expiry as "May 10th, 2030 · 1:35 PM"
  const formatExpiry = (raw: any): string | null => {
    try {
      if (!raw) return null
      const d = new Date(raw)
      if (isNaN(d.getTime())) return String(raw)
      const month = d.toLocaleString(undefined, { month: 'long' })
      const day = d.getDate()
      const year = d.getFullYear()
      // ordinal
      const ordinal = (n: number) => {
        if (n % 100 >= 11 && n % 100 <= 13) return 'th'
        switch (n % 10) {
          case 1: return 'st'
          case 2: return 'nd'
          case 3: return 'rd'
          default: return 'th'
        }
      }
      const suffix = ordinal(day)
      const time = d.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true })
      return `${month} ${day}${suffix}, ${year} · ${time}`
    } catch { return String(raw) }
  }

  const expiryDisplay = formatExpiry(expiryRaw)

  // Prevent direct access to success page unless we have a token from generation
  useEffect(() => {
    if (!token) {
      // redirect to upload if reached directly
      navigate('/upload', { replace: true })
    }
  }, [token, navigate])

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card shadow-elegant">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-16 w-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400">
              Your Mock API is Ready!
            </CardTitle>
            <CardDescription className="text-lg">
              Successfully generated from <span className="font-medium">{fileName}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* API URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Mock API URL:</label>
              <div className="flex space-x-2">
                <Input
                  value={`${mockApiUrl}/?statusCode=200`}
                  readOnly
                  className="font-mono text-sm"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                    className="shrink-0 hover-glow"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openInNewTab}
                    className="shrink-0 hover-glow"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Usage Example */}
            <div className="bg-background/50 rounded-lg p-4 font-mono text-sm">
              <div className="text-muted-foreground mb-2"># Test your Mock API.</div>
              <div className="text-muted-foreground mb-2"># Replace 200 with the status code you want.</div>
              <div className="text-primary">curl ${mockApiUrl}/?statusCode=200</div>
            </div>

            {/* Expiry Info */}
            {expiryDisplay && (
              <div className="p-4 bg-background/40 rounded-lg text-center">
                <div className="text-sm text-muted-foreground">Expires on</div>
                <div className="text-lg font-semibold text-amber-600 dark:text-amber-400">{expiryDisplay}</div>
              </div>
            )}

            {/* Features */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="font-semibold text-green-600 dark:text-green-400">✓ CORS Enabled</div>
                <div className="text-sm text-muted-foreground">Ready for frontend use</div>
              </div>
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="font-semibold text-blue-600 dark:text-blue-400">⚡ High Performance</div>
                <div className="text-sm text-muted-foreground">Global CDN distribution</div>
              </div>
              <div className="p-4 bg-background/30 rounded-lg">
                <div className="font-semibold text-purple-600 dark:text-purple-400">🔄 Real-time Updates</div>
                <div className="text-sm text-muted-foreground">Instant endpoint changes</div>
              </div> */}
            {/* </div> */}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                className="flex-1 gradient-button"
                asChild
              >
                <Link to="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Doc
                </Link>
              </Button>
            </div>

            {/* Secret token warning */}
            <div className="text-center text-sm text-red-600 dark:text-red-400 font-medium">
              Your API token is secret — only share it with trusted members of your dev team.
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground">
              Mocka successfully generated your mock API.
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}