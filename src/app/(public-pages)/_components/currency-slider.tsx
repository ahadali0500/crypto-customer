'use client'

import { useEffect, useRef, useState } from 'react'

type Currency = {
  code: string
  name: string
  rate: string
  icon: string
  flag: string
}

const currencies: Currency[] = [
  // Fiat currencies
  { code: "USD", name: "US Dollar", rate: "1.00", icon: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", rate: "0.92", icon: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", rate: "0.78", icon: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", rate: "156.32", icon: "¥", flag: "🇯🇵" },
  { code: "INR", name: "Indian Rupee", rate: "83.12", icon: "₹", flag: "🇮🇳" },
  { code: "AUD", name: "Australian Dollar", rate: "1.51", icon: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", rate: "1.36", icon: "C$", flag: "🇨🇦" },
  { code: "CNY", name: "Chinese Yuan", rate: "7.23", icon: "¥", flag: "🇨🇳" },
  { code: "CHF", name: "Swiss Franc", rate: "0.89", icon: "CHF", flag: "🇨🇭" },
  { code: "NZD", name: "New Zealand Dollar", rate: "1.66", icon: "NZ$", flag: "🇳🇿" },
  { code: "SGD", name: "Singapore Dollar", rate: "1.35", icon: "S$", flag: "🇸🇬" },
  { code: "HKD", name: "Hong Kong Dollar", rate: "7.83", icon: "HK$", flag: "🇭🇰" },

  // Cryptocurrencies
  { code: "BTC", name: "Bitcoin", rate: "29,300", icon: "₿", flag: "₿" },
  { code: "ETH", name: "Ethereum", rate: "1,850", icon: "Ξ", flag: "Ξ" },
  { code: "DOGE", name: "Dogecoin", rate: "0.063", icon: "Ð", flag: "Ð" },
  { code: "LTC", name: "Litecoin", rate: "65.21", icon: "Ł", flag: "Ł" },
]

const CurrencySlider = () => {
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const scrollSpeed = 0.4 // pixels per frame

  useEffect(() => {
    if (!containerRef.current || !contentRef.current || isPaused) return

    const content = contentRef.current

    const animate = () => {
      const currentX =
        parseFloat(
          content.style.transform.replace('translateX(', '').replace('px)', '')
        ) || 0

      let newX = currentX - scrollSpeed

      if (Math.abs(newX) >= content.scrollWidth / 2) {
        newX = 0
      }

      content.style.transform = `translateX(${newX}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isPaused])

  return (
    <div className="sticky top-0 z-40 w-full bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
      {/* Currency Ticker */}
      <div
        ref={containerRef}
        className="relative overflow-hidden py-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          ref={contentRef}
          className="flex items-center space-x-6 px-4"
          style={{ willChange: 'transform' }}
        >
          {[...currencies, ...currencies].map((currency, index) => (
            <div
              key={`${currency.code}-${index}`}
              className="flex items-center space-x-2 min-w-max"
            >
              {/* Flag + Icon */}
              <div className="flex items-center space-x-1.5">
                <span className="text-xs">{currency.flag}</span>
                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {currency.icon}
                  </span>
                </div>
              </div>

              {/* Currency Info */}
              <div className="flex flex-col leading-tight">
                <div className="flex items-center space-x-1">
                  <span className="text-white text-sm font-semibold">
                    {currency.code}
                  </span>
                  <span className="text-gray-400 text-xs hidden sm:inline">
                    {currency.name}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-white text-sm font-bold">
                    {currency.rate}
                  </span>
                  <span className="text-gray-500 text-[10px]">/USD</span>
                </div>
              </div>

              {/* Separator */}
              <span className="text-gray-700 text-lg ml-3">•</span>
            </div>
          ))}
        </div>

        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-900 via-gray-900/90 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-900 via-gray-900/90 to-transparent pointer-events-none" />
      </div>
    </div>
  )
}

export default CurrencySlider
