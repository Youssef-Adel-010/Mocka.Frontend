import { useState, useEffect, useRef } from "react"
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authApi, setTokens } from "@/lib/api"
import { motion } from "framer-motion"

export function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement | null>(null)

  const [validationMessages, setValidationMessages] = useState<string[] | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const f = formRef.current
    if (!f) return
    try {
      f.reset()
      const els = f.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')
      els.forEach((el) => {
        if (el instanceof HTMLInputElement) {
          const t = el.type?.toLowerCase()
          if (t === 'checkbox' || t === 'radio') el.checked = false
          else el.value = ''
        } else if (el instanceof HTMLTextAreaElement) {
          el.value = ''
        } else if (el instanceof HTMLSelectElement) {
          el.selectedIndex = -1
        }
      })
    } catch {}
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  setValidationMessages(null)
  setFieldErrors({})
  try {
      // collect form values
      const form = e.target as HTMLFormElement
      const data = new FormData(form)
      const body = {
        firstName: data.get('firstName') as string | undefined,
        lastName: data.get('lastName') as string | undefined,
        username: data.get('username') as string | undefined,
        password: data.get('password') as string | undefined,
      }

  const res = await authApi.register(body)
  if (res) {
    setTokens(res.accessToken ?? null, res.refreshToken ?? null)
    try { const r: any = res as any; const { setFullName } = await import('@/lib/api'); if (r.FullName || r.fullName || r.full_name) setFullName(r.FullName || r.fullName || r.full_name) } catch {}
  }
  setValidationMessages(null)
  setFieldErrors({})
  setIsLoading(false)
      toast({
        title: "Account created successfully!",
        description: "Welcome to Mocka. You can now start creating mock APIs.",
      })
      navigate('/upload')
    } catch (err: any) {
      setIsLoading(false)
      let validationMessages: string[] | null = null
      try { validationMessages = (await import('@/lib/api')).extractValidationMessages(err) } catch {}
      if (validationMessages && validationMessages.length) {
        setValidationMessages(validationMessages)
        try {
          const map = (await import('@/lib/api')).mapValidationErrors(err)
          setFieldErrors(map)
        } catch {}
        toast({ title: 'Validation Errors', description: 'Please fix the errors below', variant: 'destructive' })
      } else {
        toast({
          title: 'Registration failed',
          description: err?.message || 'Unable to create account',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription>
              Get started with Mocka today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
              {/* Simplified error summary: group field errors into a compact list */}
              {Object.keys(fieldErrors).length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Please fix the form errors</AlertTitle>
                  <AlertDescription>
                    <ul className="ml-4 list-disc">
                      {Object.entries(fieldErrors).map(([k, msgs]) => (
                        <li key={k}>
                          <strong>{(
                            { firstname: 'First Name', lastname: 'Last Name', username: 'Username', password: 'Password' } as Record<string,string>
                          )[k] || k}:</strong> {msgs.join('; ')}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      required
                      className="focus-glow"
                      onChange={() => { if (fieldErrors.firstname) setFieldErrors(prev => { const p = { ...prev }; delete p.firstname; return p }) }}
                    />
                    {fieldErrors.firstname?.[0] && (<p className="text-sm text-destructive mt-1">{fieldErrors.firstname[0]}</p>)}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      className="focus-glow"
                      onChange={() => { if (fieldErrors.lastname) setFieldErrors(prev => { const p = { ...prev }; delete p.lastname; return p }) }}
                    />
                    {fieldErrors.lastname?.[0] && (<p className="text-sm text-destructive mt-1">{fieldErrors.lastname[0]}</p>)}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    required
                    className="focus-glow"
                    onChange={() => { if (fieldErrors.username) setFieldErrors(prev => { const p = { ...prev }; delete p.username; return p }) }}
                  />
                  {fieldErrors.username?.[0] && (<p className="text-sm text-destructive mt-1">{fieldErrors.username[0]}</p>)}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a strong password"
                    required
                    className="focus-glow"
                    onChange={() => { if (fieldErrors.password) setFieldErrors(prev => { const p = { ...prev }; delete p.password; return p }) }}
                  />
                  {fieldErrors.password?.[0] && (<p className="text-sm text-destructive mt-1">{fieldErrors.password[0]}</p>)}
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full gradient-button hover-glow"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}