import { NextResponse } from 'next/server'

const COIN_IDS = 'bitcoin,ethereum,tether,binancecoin,ripple,solana,dogecoin,cardano'

export async function GET() {
    try {
        const res = await fetch(
            `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0',
                },
                cache: 'no-store',
            }
        )
        console.log('[/api/markets] status:', res.status)

        if (!res.ok) {
            const text = await res.text()
            console.error('[/api/markets] error body:', text)
            return NextResponse.json(
                { error: `CoinGecko responded with ${res.status}`, detail: text },
                { status: res.status }
            )
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (err) {
        console.error('[/api/markets] fetch threw:', err)
        return NextResponse.json(
            { error: String(err) },
            { status: 500 }
        )
    }
}