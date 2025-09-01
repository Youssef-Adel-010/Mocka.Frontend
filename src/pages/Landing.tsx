import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Code, Zap, Shield, Globe } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from '@/hooks/use-auth'

export function Landing() {
  const { isAuthenticated } = useAuth()
  return (
    <div className="min-h-screen animated-gradient">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              Mockify Your APIs With
              <br />
              <motion.span
                className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Mocka
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Upload your API documentation and get a fully functional mock API link in seconds
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="gradient-button shadow-glow text-lg px-8 py-4 h-auto hover-glow"
                  asChild
                >
                  <Link to="/upload">Get Started</Link>
                </Button>
              </motion.div>
              {!isAuthenticated && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-4 h-auto glass-card hover-glow"
                    asChild
                  >
                    <Link to="/register">Sign Up</Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Code Preview */}
          <motion.div
            className="max-w-4xl mx-auto float"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="p-6 glass-card shadow-glow hover-lift">
              <div className="bg-background/50 rounded-lg p-6 font-mono text-left">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  <span className="text-muted-foreground text-sm ml-4">terminal</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">$</span> curl https://api.mocka.dev/v1/users</div>
                  <div className="text-primary">{`{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}`}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      {/* <section className="py-16 border-t">
        <div className="container">
          <p className="text-center text-muted-foreground mb-8">Trusted by developers at</p>
          <div className="flex justify-center items-center space-x-8 md:space-x-12 opacity-60">
            {["Vercel", "GitHub", "Stripe", "Notion", "Linear"].map((company) => (
              <div key={company} className="text-lg font-semibold">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful tools to help you build and test APIs faster than ever before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Lightning Fast",
                description: "Generate mock APIs in seconds, not hours"
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "OpenAPI Support",
                description: "Full support for Swagger/OpenAPI v2 and v3"
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Reliable",
                description: "99.9% uptime with global CDN distribution"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "CORS Ready",
                description: "Pre-configured CORS for seamless integration"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 glass-card shadow-card hover-glow transition-all duration-300 h-full">
                  <motion.div
                    className="text-primary mb-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building faster with Mocka.
          </p>
          <Button
              size="lg"
              variant="outline"
              // className=" text-lg px-8 py-4 h-auto glass-card hover-glow"
            // className="gradient-button shadow-glow text-lg px-8 py-4 h-auto hover-glow"
                className="text-lg gradient-button px-8 py-4 h-auto hover-glow"

              asChild
          >
            <Link to="/upload">Start Building Now</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}