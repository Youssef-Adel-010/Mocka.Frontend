import { useState, useEffect, useRef } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { authApi, setTokens } from "@/lib/api"
import { motion } from "framer-motion"

export function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement | null>(null)

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
  const [fieldErrors, setFieldErrors] = useState<Record<string,string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  setFieldErrors({})
  try {
      const form = e.target as HTMLFormElement
      const data = new FormData(form)
      const body = {
        username: data.get('username') as string | undefined,
        password: data.get('password') as string | undefined,
      }
  const res = await authApi.login(body)
  // Save access and refresh tokens to localStorage
  if (res) {
    setTokens(res.accessToken ?? null, res.refreshToken ?? null)
    try {
      const r: any = res as any
      const { setFullName } = await import('@/lib/api')
      if (r.FullName || r.fullName || r.full_name) setFullName(r.FullName || r.fullName || r.full_name)
    } catch {}
  }
      setIsLoading(false)
      toast({ title: 'Login successful!', description: 'Welcome back to Mocka.' })
      navigate('/upload')
    } catch (err: any) {
      setIsLoading(false)
      let validationMessages: string[] | null = null
      try { validationMessages = (await import('@/lib/api')).extractValidationMessages(err) } catch {}
      if (validationMessages && validationMessages.length) {
        try { const map = (await import('@/lib/api')).mapValidationErrors(err); setFieldErrors(map) } catch {}
        toast({ title: 'Validation Errors', description: 'Please fix the errors below', variant: 'destructive' })
      } else {
        toast({ title: 'Login failed', description: err?.message || 'Unable to sign in', variant: 'destructive' })
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
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Sign in to your Mocka account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" autoComplete="off" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                  className="focus-glow"
                />
                {fieldErrors.username && fieldErrors.username.map((m,i)=>(<p key={i} className="text-sm text-destructive mt-1">{m}</p>))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="focus-glow"
                />
                {fieldErrors.password && fieldErrors.password.map((m,i)=>(<p key={i} className="text-sm text-destructive mt-1">{m}</p>))}
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
                  {isLoading ? "Signing in..." : "Login"}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Create one here
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}