import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Switcher, Dialog, Spinner } from '@/components/ui';
import axios from 'axios';
import { toast } from 'react-toastify';
import User from './page';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80">
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
      <div className="max-w-7xl mx-auto mt-5 space-y-6 font-sans">
        {/* Profile and Settings Container */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Info */}
          <div className="flex-1 p-6 shadow-sm bg-white dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl md:text-2xl font-bold">Profile Info</h2>
              <div className="flex ">

                <button
                  className="bg-primary-subtle text-primary font-normal px-2 md:px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition"
                  onClick={isEditing ? handleSave : handleEditToggle}
                  disabled={loading}

                >
                  {loading ? 'Saving...' : isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
            </div>


            <div className="divide-y divide-gray-200 space-y-6">
              {/* Profile Image Section */}
             


              {/* Basic Info */}
              <div className="space-y-3 pt-2">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold mb-1">Profile Image:</label>
                        <div className="relative">
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className=" w-full  opacity-0 cursor-pointer absolute"
                          />
                          <div className="flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg">
                            <label
                              htmlFor="file-upload"
                              className=" text-sm p-2 rounded-l-lg bg-gray-100 cursor-pointer transition"
                            >
                              Choose Image
                            </label>
                            
                            <span className="ml-3 text-sm text-gray-500 dark:text-gray-300 truncate text-right ">
                              {profileImage?.name || 'No file chosen'}
                            </span>
                          </div>
                        </div>
                      </div>



                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Full Name:</label>
                        <Input
                          value={name}
                          size='sm'
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter full name"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Mobile:</label>
                        <Input
                          value={phone}
                          size='sm'
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter mobile number"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Country:</label>
                        <Input
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Enter country"
                          size='sm'
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">City:</label>
                        <Input
                          size='sm'
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter city"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Canton:</label>
                        <Input
                          value={canton}
                          size='sm'
                          onChange={(e) => setCanton(e.target.value)}
                          placeholder="Enter canton"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Address:</label>
                        <Input
                          size='sm'
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter address"
                        />
                      </div>

                      <div className="flex flex-col">
                        <label className="font-semibold mb-1">Birth Date:</label>
                        <Input
                          size='sm'
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                        />
                      </div>

                      {/* Details - full width */}
                      <div className="flex flex-col md:col-span-2">
                        <label className="font-semibold mb-1">Details:</label>
                        <Input
                          size='sm'
                          textArea
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          rows={3}
                          placeholder="Enter additional details"
                        />
                      </div>
                    </div>

                  </>
                ) : (
                  <>
                   <div className="pb-3 flex items-center justify-center">
                  
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-5">
                      <div className="flex items-center gap-4">
                        {profileImagePreview || userData.profileImageUrl ? (
                          <img
                            // src={profileImagePreview || userData.profileImageUrl!}
                            src={`https://crypto-server.ahadcommit.com/uploads/user/${profileImagePreview}`}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Full Name:</span>
                      <span>{userData.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Mobile:</span>
                      <span>{userData.phone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">E-mail:</span>
                      <span>{userData.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Country:</span>
                      <span>{userData.country || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">City:</span>
                      <span>{userData.city || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Canton:</span>
                      <span>{userData.canton || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Address:</span>
                      <span>{userData.address || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Birth Date:</span>
                      <span>{userData.birthDate ? new Date(userData.birthDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Details:</span>
                      <span>{userData.details || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Joining Date:</span>
                      <span>{new Date(userData.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Last Updated:</span>
                      <span>{new Date(userData.updatedAt).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>


        </div>

      </div>



    </>
  );
};