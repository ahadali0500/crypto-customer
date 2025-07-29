'use client'

import useTheme from '@/utils/hooks/useTheme'
import { MdOutlineLightMode } from "react-icons/md";
import { MdDarkMode } from "react-icons/md";

const ModeSwitcher = () => {
    const mode = useTheme((state) => state.mode)
    const setMode = useTheme((state) => state.setMode)

    const toggleMode = () => {
        setMode(mode === 'dark' ? 'light' : 'dark')
    }

    return (
        <div className="cursor-pointer" onClick={toggleMode}>
            {mode === 'dark' ? (
                <MdOutlineLightMode className="text-xl text-white" />
            ) : (
                <MdDarkMode className="text-xl text-gray-800" />
            )}
        </div>
    )
}

export default ModeSwitcher