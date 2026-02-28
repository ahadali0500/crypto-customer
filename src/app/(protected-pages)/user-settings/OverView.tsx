import React, { useState, useEffect } from 'react';
import { Button, Input, Switcher, Dialog, Spinner } from '@/components/ui';
import axios from 'axios';
import { toast } from 'react-toastify';
import User from './page';
import { BiSolidUser } from 'react-icons/bi';
import {LocationEdit, MailIcon, MapPinHouse, PhoneIcon, SaveIcon, User2} from "lucide-react"
import { FaCity } from 'react-icons/fa';
import Card from '@/components/ui/Card/Card';
interface UserData {
  id: number;
  name: string;
  phone: string;
  brand: string;
  country: string;
  city: string | null;
  canton: string | null;
  address: string | null;
  email: string;
  isReal: boolean;
  isSync: boolean;
  postalCode: string | null;
  birthDate: string | null;
  details: string | null;
  documentVerified: boolean;
  completionRatio: number | null;
  agentId: number;
  sourcesId: number;
  statusId: number;
  withdrawFees: number | null;
  exchangeFees: number | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
}

interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const Overview = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [canton, setCanton] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [details, setDetails] = useState('');

  // Image handling states
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);


  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const data = response.data.data;
        setUserData(data);

        // Set form fields
        setName(data.name || '');
        setPhone(data.phone || '');
        setCountry(data.country || '');
        setCity(data.city || '');
        setCanton(data.canton || '');
        setAddress(data.address || '');
        setBirthDate(data.birthDate || '');
        setDetails(data.details || '');

        // Set existing profile image preview
        if (data.profileImageUrl) {
          setProfileImagePreview(data.profileImageUrl);
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data');
        setUserData({
          id: 0,
          name: 'N/A',
          phone: 'N/A',
          brand: 'N/A',
          country: 'N/A',
          city: 'N/A',
          canton: 'N/A',
          address: 'N/A',
          email: 'N/A',
          isReal: false,
          isSync: false,
          profileImageUrl: null,
          postalCode: null,
          birthDate: null,
          details: null,
          documentVerified: false,
          completionRatio: null,
          agentId: 0,
          sourcesId: 0,
          statusId: 0,
          withdrawFees: null,
          exchangeFees: null,
          isVerified: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset image states when canceling edit
    if (isEditing) {
      setProfileImage(null);
      setProfileImagePreview(userData?.profileImageUrl || null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setProfileImage(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('country', country);
      formData.append('city', city);
      formData.append('canton', canton);
      formData.append('address', address);
      formData.append('birthDate', birthDate);
      formData.append('details', details);

      // Add image if selected
      if (profileImage) {
        formData.append('profileImageUrl', profileImage);
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update user data in state
      if (userData) {
        const updatedData = {
          ...userData,
          name,
          phone,
          country,
          city,
          canton,
          address,
          birthDate,
          details,
          profileImageUrl: response.data.data?.profileImageUrl || profileImagePreview
        };
        setUserData(updatedData);
      }

      // Reset form states
      setIsEditing(false);
      setProfileImage(null);

      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('Update error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#111826]">
        <Spinner size={40} />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center text-red-500">
          {error || 'Failed to load user data'}
        </div>
      </div>
    );
  }

  return (
    <>
     <div className="max-w-6xl mx-auto mt-6 space-y-6 font-sans text-white">

  {/* Page Header */}
  <div className="flex items-center justify-center gap-3">
    <div className="bg-indigo-600 p-2 rounded-lg">
      ⚙️
    </div>
    <div>
      <h1 className="text-2xl font-bold">Account Settings</h1>
      <p className="text-sm text-gray-400">
        Update your personal information and preferences
      </p>
    </div>
  </div>

  {/* Profile Information Card */}
  <Card className="max-w-3xl mx-auto">

    {/* Card Header */}
    <div className="flex items-start gap-3 mb-6">
      <div className="bg-green-600/20 p-2 rounded-lg">
        👤
      </div>
      <div>
        <h2 className="text-lg font-semibold">Profile Information</h2>
        <p className="text-sm text-gray-400">
          Manage your basic account information
        </p>
      </div>
    </div>

    {/* Form */}
    <div className="space-y-5">

      {/* Email (Read Only) */}
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center gap-2 mb-1">
         <MailIcon className="w-4 h-4" /> Email Address
        </label>
        <Input
          value={userData.email}
          disabled
          // className="bg-[#283140] border border-slate-500 text-gray-400"
        />
        <p className="text-xs text-slate-500 mt-1">
          Email cannot be changed for security reasons
        </p>
      </div>

      {/* Full Name */}
      <div>
       <label className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center gap-2 mb-1">
            <User2 className="w-4 h-4" /> Full Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter full name"
          // className="bg-[#283140] border border-slate-500"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center gap-2 mb-1">
         <PhoneIcon className="w-4 h-4" />  Phone Number
        </label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+1234567890"
          // className="bg-[#1b2333] border border-gray-700"
        />
      </div>

      {/* Country */}
      <div>
       <label className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center gap-2 mb-1">
          <MapPinHouse className="w-4 h-4" /> Country
        </label>
        <Input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Enter country"
          // className="bg-[#283140] border border-slate-500"
        />
      </div>

      {/* City */}
      <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-300 flex items-center gap-2 mb-1">
          <FaCity className="w-4 h-4" /> City
        </label>
        <Input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city"
          // className="bg-[#283140] border border-slate-500"
        />
      </div>

      {/* Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center demonstrating-center gap-2 justify-center bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 transition text-white py-3 rounded-lg font-medium"
        >
          <SaveIcon className='w-4 h-4' /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

    </div>
  </Card>
</div>



    </>
  );
};