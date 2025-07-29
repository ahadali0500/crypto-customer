import { RiVerifiedBadgeFill } from "react-icons/ri";
import React, { useEffect, useState } from 'react';
import axios from "axios";

const Status = () => {
    const [status, setStatus] = useState(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const checkStatus = async () => {
        if (!token) return;

        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/verification/status`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });
            setStatus(res.data);
        } catch (error) {
            console.error('Error on fetching status:', error);
        }
    }

    useEffect(() => {
        checkStatus();
    }, []);

    console.log('status', status);

    return (
        <div>
            <RiVerifiedBadgeFill
                size={22}
                className={`${status?.VerificationStatus ? 'text-green-400' : 'text-gray-400'}`}
            />
        </div>
    );
}

export default Status;
