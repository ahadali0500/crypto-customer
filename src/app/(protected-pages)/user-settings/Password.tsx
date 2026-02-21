import { Button, Input } from "@/components/ui";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";


interface PasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}


const Password = () => {
    const [passwordData, setPasswordData] = useState<PasswordData>({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters long');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('oldPassword', passwordData.oldPassword);
            formData.append('newPassword', passwordData.newPassword);
            formData.append('confirmPassword', passwordData.confirmPassword);

            await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/password`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );


            setPasswordData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setPasswordError('');
            toast.success('Password updated successfully!');
        } catch (err: any) {
            console.error('Password change error:', err);
            const errorMessage = err.response?.data?.message || 'Failed to update password. Please check your old password.';
            setPasswordError(errorMessage);
        }
    };


    return (
        <>
            <div className="p-6  mt-5 shadow-sm bg-white dark:bg-[#111826]  rounded-lg">
                <div className="text-xl font-semibold ">
                    Change Password
                </div>
                <div className="space-y-4 p-4">
                    {passwordError && (
                        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                            {passwordError}
                        </div>
                    )}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Old Password</label>
                        <Input
                            type="password"
                            placeholder="Enter old password"
                            value={passwordData.oldPassword}
                            onChange={(e) => setPasswordData({
                                ...passwordData,
                                oldPassword: e.target.value
                            })}
                            className="w-full border border-gray-300 dark:border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">New Password</label>
                        <Input
                            type="password"
                            placeholder="Enter new password (min 6 characters)"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({
                                ...passwordData,
                                newPassword: e.target.value
                            })}
                            className="w-full border border-gray-300 dark:border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium">Confirm Password</label>
                        <Input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value
                            })}
                            className="w-full border border-gray-300 dark:border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-0 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">

                        <Button
                            size="sm"
                            variant='solid'
                            className="px-4 rounded-lg"
                            onClick={handlePasswordChange}
                            disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        >
                            Update Password
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Password;