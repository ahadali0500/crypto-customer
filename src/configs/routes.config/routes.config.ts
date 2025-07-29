import authRoute from './authRoute'
import type { Routes } from '@/@types/routes'

export const protectedRoutes: Routes = {
    '/dashboard': {
        key: 'dashboard',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/view-ticket': {
        key: 'Viewticket',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/create-ticket': {
        key: 'ticket',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/invoice': {
        key: 'invoice',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/withdrawal/crypto': {
        key: 'withdrawal.crypto',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/withdrawal/bank': {
        key: 'withdrawal.bank',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/deposit/crypto': {
        key: 'deposit.crypto',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/inbox': {
        key: 'inbox',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/exchange/exchange-amount': {
        key: 'exchange.exchange',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },
    '/exchange/view-analysis': {
        key: 'exchange.view',
        authority: [],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },

    },


}

export const publicRoutes: Routes = {}

export const authRoutes = authRoute
