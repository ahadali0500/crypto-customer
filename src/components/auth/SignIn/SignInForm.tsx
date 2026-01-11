'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import classNames from '@/utils/classNames'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'
import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card1'
import { TrendingUp } from 'lucide-react'
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
    const {setSession} = useSessionContext();
    const { className, setMessage, onSignIn, passwordHint } = props
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirectUrl') || '/dashboard'  // Default redirect

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
                // setMessage('Login failed: No token received.')
                toast.error('Login failed: No token received.')
                setSubmitting(false)
                return
            }
            const loginData = response.data.data
           console.log('authtoken session:', loginData)
            // Store token locally for future auth
            localStorage.setItem('authToken', loginData.token)
            // Set the session globally
            setSession({
                user: loginData,
                expires: '', // You can set token expiry if available
            })

            toast.success('Login successful!')
            if (onSignIn) onSignIn({ values, setSubmitting, setMessage })

            // Redirect user to redirectUrl or default page
            router.push(redirectUrl)
        } catch (error: any) {
            // console.log('error', error);
            console.log(error.response.data.message);
            toast.error(error.response.data.message);
        } finally {
            setSubmitting(false)
        }

    }

    return (
        <>
        <div className={className}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl">
                <CardHeader className="space-y-4 pb-6">

                    <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-white">Welcome Back</CardTitle>
                    <CardDescription className="text-center text-gray-600 dark:text-gray-300">
                        Sign in to access your trading dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form onSubmit={handleSubmit(handleSignIn)}>
                        <FormItem
                            label="Email"
                            invalid={Boolean(errors.email)}
                            errorMessage={errors.email?.message}
                        >
                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        autoComplete="off"
                                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:ring-primary-500/20"
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label="Password"
                            invalid={Boolean(errors.password)}
                            errorMessage={errors.password?.message}
                            className={classNames(
                                passwordHint ? 'mb-0' : '',
                                errors.password?.message ? 'mb-8' : '',

                            )}

                        >
                            <Controller
                                name="password"

                                control={control}
                                rules={{ required: true }}

                                render={({ field }) => (
                                    <PasswordInput
                                        type="text"
                                        placeholder="Password"
                                        autoComplete="off"

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
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </Form>
                </CardContent>
            </Card>
        </div>
 {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
          <Spinner size={40} />
        </div>
      )}
        </>
    )
}

export default SignInForm
