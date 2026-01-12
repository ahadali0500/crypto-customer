'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card1'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSessionContext } from '../AuthProvider/SessionContext'
import { Spinner } from '@/components/ui'

export type OnSignInPayload = {
    values: SignInFormSchema
    setSubmitting: (isSubmitting: boolean) => void
    setMessage: (message: string) => void
}

export type OnSignIn = (payload: OnSignInPayload) => void

interface SignInFormProps extends CommonProps {
    passwordHint?: string | ReactNode
    setMessage: (message: string) => void
    onSignIn?: OnSignIn
}

type SignInFormSchema = {
    email: string
    password: string
}

const validationSchema = z.object({
    email: z
        .string({ required_error: 'Please enter your email' })
        .min(1, { message: 'Please enter your email' }),
    password: z
        .string({ required_error: 'Please enter your password' })
        .min(1, { message: 'Please enter your password' }),
})

const SignInForm = (props: SignInFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)
    const { setSession } = useSessionContext();
    const { className, setMessage, onSignIn, passwordHint } = props
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirectUrl') || '/dashboard'

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<SignInFormSchema>({
        defaultValues: {
            email: '',
            password: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const handleSignIn = async (values: SignInFormSchema) => {
        setSubmitting(true)
        setMessage('')
        try {
            const formData = new FormData()
            formData.append('email', values.email)
            formData.append('password', values.password)

            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/login`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )

            if (!response.data?.data || !response.data.data.token) {
                toast.error('Login failed: No token received.')
                setSubmitting(false)
                return
            }
            const loginData = response.data.data

            localStorage.setItem('authToken', loginData.token)
            setSession({
                user: loginData,
                expires: '',
            })

            toast.success('Login successful!')
            if (onSignIn) onSignIn({ values, setSubmitting, setMessage })

            router.push(redirectUrl)
        } catch (error: any) {
            toast.error(error.response.data.message);
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className={className}>
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <CardHeader className="pb-6">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                                <span className="text-xl font-bold text-white">B</span>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                Sign In to Bexchange
                            </CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                                Enter your credentials to continue
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <Form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
                            <FormItem
                                label="Email Address"
                                invalid={Boolean(errors.email)}
                                errorMessage={errors.email?.message}
                              
                            >
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="email"
                                            placeholder="Enter your email address"
                                            autoComplete="off"
                                            // className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>

                            <FormItem
                                label="Password"
                                invalid={Boolean(errors.password)}
                                errorMessage={errors.password?.message}
                               
                            >
                                <Controller
                                    name="password"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="relative">
                                            <PasswordInput
                                                placeholder="Enter your password"
                                                autoComplete="off"
                                                className='rounded-lg'
                                                {...field}
                                            />
                                        </div>
                                    )}
                                />
                            </FormItem>

                            {passwordHint}

                            <Button
                                block
                                loading={isSubmitting}
                                variant="solid"
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                                {isSubmitting ? 'Signing in...' : 'Sign In'}
                            </Button>
                        </Form>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                Need assistance?{' '}
                                <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isSubmitting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <Spinner size={40} />
                </div>
            )}
        </>
    )
}

export default SignInForm