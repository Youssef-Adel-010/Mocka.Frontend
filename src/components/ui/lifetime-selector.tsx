import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card } from "@/components/ui/card"
import { Clock, Calendar, CalendarDays } from "lucide-react"
import { motion } from "framer-motion"

export interface LifetimeSelection {
  type: 'hours' | 'days' | 'weeks'
  value: number
}

interface LifetimeSelectorProps {
  value: LifetimeSelection
  onChange: (value: LifetimeSelection) => void
}

export function LifetimeSelector({ value, onChange }: LifetimeSelectorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const options = [
    {
      id: 'hours',
      label: 'Hours',
      icon: Clock,
      max: 12,
      description: 'Up to 12 hours'
    },
    {
      id: 'days',
      label: 'Days',
      icon: Calendar,
      max: 3,
      description: 'Up to 3 days'
    },
    {
      id: 'weeks',
      label: 'Weeks',
      icon: CalendarDays,
      max: 4,
      description: 'Up to 4 weeks'
    }
  ] as const

  const handleTypeChange = (type: LifetimeSelection['type']) => {
    const newValue = { type, value: 1 }
    onChange(newValue)
    setErrors({})
  }

  const handleValueChange = (inputValue: string) => {
    const numValue = parseInt(inputValue)
    const currentOption = options.find(opt => opt.id === value.type)

    if (!currentOption) return

    // Validate range
    if (isNaN(numValue) || numValue < 1) {
      setErrors({ value: 'Please enter a valid number' })
      return
    }

    if (numValue > currentOption.max) {
      setErrors({ value: `Maximum ${currentOption.max} ${value.type} allowed` })
      return
    }

    setErrors({})
    onChange({ ...value, value: numValue })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div>
        <Label className="text-xl font-semibold font-semibold">API Lifetime</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Choose how long your mock API will remain active
        </p>
      </div>

      <RadioGroup
        value={value.type}
        onValueChange={handleTypeChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = value.type === option.id

          return (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`glass-card p-4 cursor-pointer transition-all duration-200 hover:shadow-glow ${
                  isSelected
                    ? 'ring-2 ring-primary/50 bg-primary/5'
                    : 'hover:bg-white/20 dark:hover:bg-white/5'
                }`}
                onClick={() => handleTypeChange(option.id)}
              >
                <RadioGroupItem
                  value={option.id}
                  id={option.id}
                  className="sr-only"
                />
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Label
                    htmlFor={option.id}
                    className={`font-medium cursor-pointer ${isSelected ? 'text-primary' : ''}`}
                  >
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </RadioGroup>

      {/* Numeric Input */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        transition={{ duration: 0.2 }}
        className="space-y-2"
      >
        <Label htmlFor="lifetime-value" className="text-xl font-semibold">
          Number of {value.type}
        </Label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                if (value.value > 1) {
                  onChange({ ...value, value: value.value - 1 })
                }
              }}
              className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-lg font-bold"
            >
              -
            </button>

            <div className="px-7 py-3 min-w-[60px] text-center rounded-md border bg-background text-xl">
              {value.value}
            </div>

          <button
              type="button"
              onClick={() => {
                const max = options.find(opt => opt.id === value.type)?.max ?? 1
                if (value.value < max) {
                  onChange({ ...value, value: value.value + 1 })
                }
              }}
              className="px-3 py-1 rounded-md bg-muted hover:bg-muted/80 text-lg font-bold"
            >
              +
            </button>

            <span className="text-sm text-muted-foreground min-w-fit">
              {value.type}
            </span>
          </div>
        {errors.value && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {errors.value}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  )
}