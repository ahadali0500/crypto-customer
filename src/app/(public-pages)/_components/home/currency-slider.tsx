'use client'

import { useEffect, useRef, useState } from 'react'

type Crypto = {
  id: string
  code: string
  price: string
  change: number
  icon: string
}

/* ✅ DEFINE cryptoMeta */
const cryptoMeta: Crypto[] = [
  { id: 'bitcoin', code: 'BTC', price: '', change: 0, icon: '₿' },
  { id: 'ethereum', code: 'ETH', price: '', change: 0, icon: 'Ξ' },
  { id: 'binancecoin', code: 'BNB', price: '', change: 0, icon: '◎' },
  { id: 'solana', code: 'SOL', price: '', change: 0, icon: 'S' },
  { id: 'dogecoin', code: 'DOGE', price: '', change: 0, icon: 'Ð' },
  { id: 'cardano', code: 'ADA', price: '', change: 0, icon: 'A' },
]

const scrollSpeed = 0.35

const CurrencySlider = () => {
  const [cryptos, setCryptos] = useState<Crypto[]>(cryptoMeta)
  const [paused, setPaused] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  /* -------- FETCH LIVE PRICES -------- */
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = cryptoMeta.map(c => c.id).join(',')
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        )
        const data = await res.json()

        setCryptos(
          cryptoMeta.map(c => ({
            ...c,
            price: data[c.id]?.usd?.toLocaleString() ?? '—',
            change: data[c.id]?.usd_24h_change ?? 0,
          }))
        )
      } catch (e) {
        console.error('Failed to fetch crypto prices', e)
      }
    }

    fetchPrices()
    const i = setInterval(fetchPrices, 30000)
    return () => clearInterval(i)
  }, [])

  /* -------- SCROLL ANIMATION -------- */
  useEffect(() => {
    if (!contentRef.current || paused) return

    const el = contentRef.current

    const animate = () => {
      const x =
        parseFloat(el.style.transform.replace('translateX(', '').replace('px)', '')) || 0

      let next = x - scrollSpeed
      if (Math.abs(next) >= el.scrollWidth / 2) next = 0

      el.style.transform = `translateX(${next}px)`
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current!)
  }, [paused])

  return (
    <div className="w-full bg-[oklch(0.24_0.03_260.32)]  border-y border-slate-top border-slate-700">
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
            <div key={i} className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">{coin.icon}</span>

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
