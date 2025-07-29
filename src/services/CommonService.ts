import ApiService from './ApiService'

export async function apiGetNotificationCount() {
    return ApiService.fetchDataWithAxios<{
        count: number
    }>({
        url:  `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification/fetch`,
        method: 'get',
    })
}

export async function apiGetNotificationList() {
    return ApiService.fetchDataWithAxios<
        {
            id: string
            target: string
            description: string
            date: string
            image: string
            type: number
            location: string
            locationLabel: string
            status: string
            readed: boolean
        }[]
    >({
        url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/notification/fetch`,
        method: 'get',
    })
}

export async function apiGetSearchResult<T>(params: { query: string }) {
    return ApiService.fetchDataWithAxios<T>({
        url: '/search',
        method: 'get',
        params,
    })
}
