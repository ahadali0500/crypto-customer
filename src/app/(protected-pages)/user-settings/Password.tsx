import { Button, Input } from "@/components/ui";
import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import {Switcher} from "@/components/ui";
import { Smartphone } from "lucide-react";
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
const [showOldPassword, setShowOldPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [is2FAEnabled, setIs2FAEnabled] = useState(false);
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
  <div className="mt-5 max-w-2xl mx-auto bg-[#18212F] p-6 rounded-xl border border-slate-500 shadow-md">
    
    {/* Header */}
    <div className="flex items-start gap-3 mb-6">
      <div className="bg-blue-600/20 p-2 rounded-lg">
        🔑
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">
          Change Password
        </h2>
        <p className="text-sm text-gray-400">
          Update your account password to maintain security and prevent unauthorized access.
        </p>
      </div>
    </div>

    <div className="space-y-5">
{passwordError && (
  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
    {passwordError}
  </div>
)}
     <div>
  <label className="block mb-2 text-sm font-medium text-gray-300">
    Current Password
  </label>
  <div className="relative">
    <Input
      type={showOldPassword ? "text" : "password"}
      placeholder="Enter current password"
      value={passwordData.oldPassword}
      

      onChange={(e) => {
  setPasswordError("");
  setPasswordData({ ...passwordData, oldPassword: e.target.value });
}}
      className="w-full bg-[#283140] border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 pr-10"
    />
    <button
      type="button"
      onClick={() => setShowOldPassword(!showOldPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

      {/* New Password */}
     <div>
  <label className="block mb-2 text-sm font-medium text-gray-300">
    New Password
  </label>
  <div className="relative">
    <Input
      type={showNewPassword ? "text" : "password"}
      placeholder="password must be at least 6 characters"
      value={passwordData.newPassword}
      onChange={(e) =>
        setPasswordData({
          ...passwordData,
          newPassword: e.target.value,
        })
      }
      className="w-full bg-[#283140] border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 pr-10"
    />
    <button
      type="button"
      onClick={() => setShowNewPassword(!showNewPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>
      {/* Confirm Password */}
      
<div>
  <label className="block mb-2 text-sm font-medium text-gray-300">
    Confirm New Password
  </label>
  <div className="relative">
    <Input
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm new password"
      value={passwordData.confirmPassword}
      onChange={(e) =>
        setPasswordData({
          ...passwordData,
          confirmPassword: e.target.value,
        })
      }
      className="w-full bg-[#283140] border border-gray-600 text-white placeholder-gray-400 rounded-lg px-4 py-2 pr-10"
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
    >
      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>
      {/* Tip Box */}
      <div className="bg-[#283140] border border-gray-700 text-sm text-gray-400 p-3 rounded-lg">
        <span className="font-medium text-gray-300">Tip:</span> Use a strong password with a mix of letters, numbers, and symbols.
      </div>

      {/* Button */}
      <div className="pt-2">
        <Button
      
          onClick={handlePasswordChange}
          disabled={
            !passwordData.oldPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
          }
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Change Password
        </Button>
      </div>
    </div>
  </div>
  <div className="mt-6 max-w-2xl mx-auto bg-[#18212F] p-6 rounded-xl border border-slate-500 shadow-md">
  
  {/* Header */}
  <div className="flex items-start justify-between gap-4">
    <div className="flex gap-3">
      <div className="bg-blue-600/20 p-2 rounded-lg">
        <Smartphone className="text-blue-400" size={20} />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">
          Two-Factor Authentication (2FA)
        </h2>
        <p className="text-sm text-gray-400">
          Add an extra layer of security by enabling 2FA. This requires a verification
          code in addition to your password when logging in.
        </p>
      </div>
    </div>

    {/* Toggle */}
    <Switcher
      checked={is2FAEnabled}
      // onCheckedChange={setIs2FAEnabled}
      className="data-[state=checked]:bg-blue-600"
    />
  </div>

  <hr className="my-5 border-gray-700" />

  {/* Status */}
  <p className="text-sm text-gray-300 mb-3">
    <span className="font-medium">2FA is {is2FAEnabled ? "Enabled" : "Disabled"}</span>
  </p>

  {/* Supported Methods */}
  <div className="text-sm text-gray-400 space-y-2">
    <p className="font-medium text-gray-300">Supported Methods:</p>
    <ul className="list-disc list-inside space-y-1">
      <li>Authenticator App (Google Authenticator, Authy, etc.)</li>
      <li>SMS Verification (if phone number is verified)</li>
    </ul>
  </div>
</div>
</>
    )
}

export default Password;