'use client'

import { useEffect, useRef, useState } from 'react'

type Crypto = {
  id: string
  code: string
  price: string
  change: number
  icon: string
}

const scrollSpeed = 0.35

const CurrencySlider = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>([])
  const [paused, setPaused] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('authToken')
            : null

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/markets/ticker`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const json = await res.json()
        const markets = json?.data || []

        const mapped: Crypto[] = markets.map((coin: any) => ({
          id: String(coin.id || coin.symbol || ''),
          code: String(coin.shortName || coin.symbol || '').toUpperCase(),
          price: Number(coin.current_price || 0).toLocaleString(undefined, {
            minimumFractionDigits: Number(coin.current_price || 0) >= 1 ? 2 : 3,
            maximumFractionDigits: Number(coin.current_price || 0) >= 1 ? 2 : 6,
          }),
          change: Number(
            coin.price_change_percentage_24h ??
              coin.price_change ??
              0
          ),
          icon: coin.image || '',
        }))

        setCryptos(mapped)
      } catch (e) {
        console.error('Failed to fetch crypto prices', e)
      }
    }

    fetchPrices()
    const i = setInterval(fetchPrices, 30000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    if (!contentRef.current || paused || cryptos.length === 0) return

    const el = contentRef.current

    const animate = () => {
      const x =
        parseFloat(
          el.style.transform.replace('translateX(', '').replace('px)', '')
        ) || 0

      let next = x - scrollSpeed
      if (Math.abs(next) >= el.scrollWidth / 2) next = 0

      el.style.transform = `translateX(${next}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [paused, cryptos])

  return (
    <div className="w-full bg-[oklch(0.24_0.03_260.32)] border-y border-slate-top border-slate-700">
      <div
        className="relative overflow-hidden h-10 flex items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={contentRef}
          className="flex items-center gap-8 px-6 whitespace-nowrap"
          style={{ willChange: 'transform' }}
        >
          {[...cryptos, ...cryptos].map((coin, i) => (
            <div key={`${coin.id}-${i}`} className="flex items-center gap-2 text-sm">
              {coin.icon ? (
                <img
                  src={coin.icon}
                  alt={coin.code}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <span className="text-yellow-400">•</span>
              )}

              <span className="text-white font-semibold">
                {coin.code}
              </span>

              <span className="text-slate-300">
                ${coin.price}
              </span>

              <span
                className={`font-medium ${
                  coin.change >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {coin.change >= 0 ? '+' : ''}
                {coin.change.toFixed(2)}%
              </span>

              <span className="text-slate-600 ml-2">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CurrencySlider