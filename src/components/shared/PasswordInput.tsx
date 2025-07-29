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
            style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
            }}
            onFocus={(e) => {
                e.target.style.borderColor = '#facc15' // yellow-400
                e.target.style.boxShadow = '0 0 0 3px rgba(250, 204, 21, 0.2)' // ring
            }}
            onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                e.target.style.boxShadow = 'none'
            }}
            suffix={
                <span
                    className="cursor-pointer select-none text-xl"
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
