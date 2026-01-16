import { useState } from 'react'
import { Input, InputProps } from '@/components/ui/Input'
import { HiOutlineEyeOff, HiOutlineEye } from 'react-icons/hi'
import type { MouseEvent, Ref } from 'react'

interface PasswordInputProps extends InputProps {
    onVisibleChange?: (visible: boolean) => void
    ref?: Ref<HTMLInputElement>
}

const PasswordInput = (props: PasswordInputProps) => {
    const { onVisibleChange, ref, ...rest } = props

    const [pwInputType, setPwInputType] = useState('password')

    const onPasswordVisibleClick = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault()
        const nextValue = pwInputType === 'password' ? 'text' : 'password'
        setPwInputType(nextValue)
        onVisibleChange?.(nextValue === 'text')
    }

    return (
        <Input
            {...rest}
            ref={ref}
            type={pwInputType}
            className={`bg-[oklch(0.24_0.03_260.32)] border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-primary-500 focus:ring-primary-500/20 ${rest.className || ''}`}
            suffix={
                <span
                    className="cursor-pointer select-none text-xl text-gray-500 dark:text-gray-400"
                    role="button"
                    onClick={onPasswordVisibleClick}
                >
                    {pwInputType === 'password' ? (
                        <HiOutlineEyeOff />
                    ) : (
                        <HiOutlineEye />
                    )}
                </span>
            }
        />
    )
}

export default PasswordInput
