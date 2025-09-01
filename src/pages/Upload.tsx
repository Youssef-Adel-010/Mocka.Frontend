import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload as UploadIcon, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { docApi, mockApi } from "@/lib/api"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { LifetimeSelector, LifetimeSelection } from "@/components/ui/lifetime-selector"
import { motion } from "framer-motion"

export function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const [lifetime, setLifetime] = useState<LifetimeSelection>({ type: 'days', value: 1 })
  const navigate = useNavigate()
  const { toast } = useToast()
  const [validationMessages, setValidationMessages] = useState<string[] | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(json|yaml|yml)$/i)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JSON or YAML file.",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    toast({
      title: "File selected",
      description: `${selectedFile.name} is ready to upload.`,
    })
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    try {
      // Build form data for multipart upload
      const form = new FormData()
      form.append('DocFile', file)

      // Upload the document
      const docRes = await docApi.uploadDoc(form)

      // Optionally use lifetime selection to pass ltDays/hours/weeks
      const payload: any = { docId: (docRes as any)?.docId }
      if (lifetime.type === 'days') payload.ltDays = lifetime.value
  if (lifetime.type === 'hours') payload.ltHours = lifetime.value
      if (lifetime.type === 'weeks') payload.ltWeeks = lifetime.value

  // Generate mock and capture token/expiry
  const mockRes: any = await mockApi.generate(payload)

  clearInterval(interval)
  setIsUploading(false)
  // Expect mockRes to contain { token, ExpiryDate } or similar
  navigate('/success', { state: { fileName: file.name, token: mockRes?.token, ExpiryDate: mockRes?.ExpiryDate || mockRes?.expiryDate || mockRes?.expiry } })
    } catch (err: any) {
      // Fallback to previous simulated behavior if API fails
      clearInterval(interval)
      setIsUploading(false)
      let validationMessagesArr: string[] | null = null
      try { validationMessagesArr = (await import('@/lib/api')).extractValidationMessages(err) } catch {}
      if (validationMessagesArr && validationMessagesArr.length) {
        setValidationMessages(validationMessagesArr)
        try { const map = (await import('@/lib/api')).mapValidationErrors(err); setFieldErrors(map) } catch {}
        toast({ title: 'Validation Errors', description: 'Please fix the errors below', variant: 'destructive' })
      } else {
        toast({ title: 'Upload failed', description: err?.message || 'Could not upload document', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="glass-card shadow-elegant">
          <CardHeader className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold">Upload your API Documentation</CardTitle>
              <CardDescription className="text-lg">
                Supports OpenApi v3 and Swagger v2 docs
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isUploading ? (
              <>
                {/* File Upload Area */}
                {validationMessages && (
                  <div className="mb-4">
                    <Alert variant="destructive">
                      <AlertTitle>Validation Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="ml-4 list-disc">
                          {validationMessages.map((m, i) => <li key={i}>{m}</li>)}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                {fieldErrors.docfile && (
                  <div className="mb-2">
                    {fieldErrors.docfile.map((m,i)=>(<p key={i} className="text-sm text-destructive mt-1">{m}</p>))}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 hover-glow ${
                    isDragOver
                      ? "border-primary bg-primary/5 scale-105"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <motion.div
                    animate={{
                      y: isDragOver ? -5 : 0,
                      scale: isDragOver ? 1.1 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <UploadIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">
                    {file ? "File Selected" : "Drop your API doc here"}
                  </h3>
                  {file ? (
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{file.name}</span>
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  ) : (
                    <p className="text-muted-foreground mb-4">
                      or click to browse files
                    </p>
                  )}

                  <input
                    type="file"
                    accept=".json,.yaml,.yml"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0]
                      if (selectedFile) handleFileSelect(selectedFile)
                    }}
                    className="hidden"
                    id="file-upload"
                    autoComplete="off"
                    spellCheck={false}
                  />

                  {!file && (
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer hover-lift" asChild>
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  )}
                </motion.div>

                {/* API Lifetime Selection */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <LifetimeSelector
                      value={lifetime}
                      onChange={setLifetime}
                    />
                  </motion.div>
                )}

                {/* Supported Formats */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="text-center text-sm text-muted-foreground"
                >
                  Supported formats: <span className="font-medium">JSON, YAML</span>
                  <br />
                  Compatible with: <span className="font-medium">OpenAPI 2.0, 3.0, 3.1</span>
                </motion.div>

                {/* Upload Button */}
                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <Button
                      onClick={handleUpload}
                      className="w-full gradient-button shadow-glow text-lg py-6 hover-lift"
                      size="lg"
                    >
                      Generate Mock API ({lifetime.value} {lifetime.type})
                    </Button>
                  </motion.div>
                )}
              </>
            ) : (
              /* Loading State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center space-y-6"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="h-16 w-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4 shadow-glow"
                >
                  <UploadIcon className="h-8 w-8 text-primary-foreground" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <h3 className="text-xl font-semibold mb-2">Generating your mock API...</h3>
                  <p className="text-muted-foreground mb-4">
                    Analyzing your API documentation and creating endpoints
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="space-y-2"
                >
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{uploadProgress}% complete</p>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}