import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useAuth } from '@/hooks/use-auth'

export function Navigation() {
  const location = useLocation()
  const { isAuthenticated, logout, fullName } = useAuth()

  return (
    <nav className="glass-navigation">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
<div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
  <span className="text-primary-foreground font-bold text-lg">
    &lt;&gt;
  </span>
</div>

            <span className="text-xl font-bold">Mocka</span>
          </Link>

          {/* <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              to="/#pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/#docs"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
            </Link>
          </div> */}
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {!isAuthenticated && location.pathname === "/" && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gradient-button px-3 py-2.5 h-auto hover-glow"
                asChild
              >
                <Link to="/register">Sign Up</Link>
              </Button>
            </>
          )}

          {!isAuthenticated && location.pathname !== "/" && (
            <Button variant="ghost" asChild>
              <Link to="/">Home</Link>
            </Button>
          )}

          {isAuthenticated && (
            <>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">{fullName || ''}</span>
                <Button variant="ghost" asChild>
                  <Link to="/">Home</Link>
                </Button>
                <Button variant="default" onClick={logout}>
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}