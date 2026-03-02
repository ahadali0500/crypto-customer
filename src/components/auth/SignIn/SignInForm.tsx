'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import Card from '@/components/ui/Card/Card'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSessionContext } from '../AuthProvider/SessionContext'
import { Spinner } from '@/components/ui'
import logo from '../../../../public/img/logo/logo.png'

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
    const { setSession } = useSessionContext()
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
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )

            const loginData = response.data?.data

            if (!loginData || !loginData.token) {
                toast.error('Login failed: No token received.')
                setSubmitting(false)
                return
            }

            localStorage.setItem('authToken', loginData.token)

            const lastLoginAt =
                loginData.lastLoginAt ||
                loginData.lastLogin ||
                loginData.last_login ||
                loginData.last_login_at ||
                new Date().toISOString()

            const userInfo = {
                name: loginData.name,
                email: loginData.email,
                profileImageUrl: loginData.profileImageUrl,
                lastLoginAt,
            }
            localStorage.setItem('userInfo', JSON.stringify(userInfo))

            setSession({
                user: { ...loginData, lastLoginAt },
                expires: '',
            })

            toast.success('Login successful!')

            if (onSignIn) onSignIn({ values, setSubmitting, setMessage })

            router.push(redirectUrl)
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <>
            <div className={className}>
                

                    {/* Logo + Title — used as card header content */}
                    <Card
                        bordered={false}
                        header={{
                            bordered: true,
                            content: (
                                <div className="flex flex-col items-center py-2">
                                    <div className="w-12 h-12 flex items-center justify-center mb-3">
                                        <img
                                            src={logo.src}
                                            alt="Bexchange Logo"
                                            className="w-10 h-10"
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                                        Sign In to Bexchange
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-slate-300">
                                        Enter your credentials to continue
                                    </p>
                                </div>
                            ),
                        }}
                    >
                        {/* Form Body */}
                        <Form
                            onSubmit={handleSubmit(handleSignIn)}
                            className="space-y-5 pt-2"
                        >
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
                                            // className="bg-gray-50 dark:bg-[oklch(0.24_0.03_260.32)]"
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
                                        <PasswordInput
                                            placeholder="Enter your password"
                                            autoComplete="off"
                                            className="rounded-lg bg-gray-50 dark:bg-[oklch(0.24_0.03_260.32)]"
                                            {...field}
                                        />
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