'use server'
import type { SignInCredential } from '@/@types/auth'
import axios from 'axios'

const validateCredential = async (values: SignInCredential) => {
    const { email, password } = values

    try {
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)

        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/login`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        )

        const loginData = response.data.data

        if (!loginData || !loginData.token) {
            return null
        }

        // Optional: You can return full user data if your backend provides it
        return {
            email: email,
            token: loginData.token,
            ...loginData // add other data if any
        }

    } catch (error) {
        console.error('Login error:', error)
        return null
    }
}

export default validateCredential
