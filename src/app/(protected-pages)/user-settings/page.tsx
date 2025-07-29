'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { IoLocationOutline } from "react-icons/io5";
import { AiOutlineMessage } from "react-icons/ai";
import Tabs from '@/components/ui/Tabs/Tabs';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import TabContent from '@/components/ui/Tabs/TabContent';
import { useParams } from 'next/navigation';
import { Overview } from './OverView';
import Document from './Document';
import axios from 'axios';
import Password from './Password';
import Balance from './Balance';

// Define a type for user
interface UserType {
  name: string;
  email: string;
  city?: string;
  country?: string;
  profileImageUrl?: string;
  // Add other user properties if needed
}

const User = () => {
    const [user, setUser] = useState<UserType | null>(null);
    const [balance, setBalance] = useState();
    const [imageError, setImageError] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const params = useParams();
    const slug = params?.slug || '';
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/fetch`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const data = response.data.data;
            setUser(data);
        } catch (err) {
            console.log('Error on fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    const fetchBalance = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/balance`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const data = response.data.data;
            setBalance(data);
        } catch (err) {
            console.log('Error on fetching balance:', err);
        }
    }

    useEffect(() => {
        if (token) {
            fetchUsers();
            fetchBalance();
        }
    }, [token]);

    // console.log('balance', balance);

    // Show loading state
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-700"></div>
            </div>
        );
    }


    return (
        <div className=''>
            <div className='flex flex-col lg:flex-row gap-6 bg-gradient-to-b from-purple-700 to-purple-900 rounded-2xl p-8'>
                {/* Left Section */}
                <div className='w-full  flex justify-center items-center'>
                    <div className='flex flex-col justify-center sm:flex-row items-center gap-4'>
                        {/* Profile Image with proper error handling */}
                        <div className='w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center overflow-hidden'>
                            {user.profileImageUrl && !imageError ? (
                                <Image 
                                    // src={user.profileImageUrl} 
                                    src={`https://crypto-server.ahadcommit.com/uploads/user/${user.profileImageUrl}`}
                                    width={80} 
                                    height={80} 
                                    className='rounded-full object-cover' 
                                    alt={user.name || 'User profile'}
                                    onError={() => setImageError(true)}
                                    priority
                                />
                            ) : (
                                // Fallback when no image or image fails to load
                                <div className="w-full h-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-2xl">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <div className='text-white space-y-2 text-center sm:text-left'>
                            <div className='text-2xl sm:text-3xl font-semibold'>
                                {user.name || 'Unknown User'}
                            </div>
                            <div className='text-sm sm:text-base'>
                                {user.email || 'No email provided'}
                            </div>
                            
                            {(user.city || user.country) && (
                                <div className='flex flex-col sm:flex-row items-center sm:gap-3 gap-1'>
                                    <div className='flex items-center gap-1 cursor-pointer hover:opacity-80'>
                                        <IoLocationOutline size={20} />
                                        <span>
                                            {user.city ? user.city : ''} 
                                            {user.city && user.country ? ', ' : ''} 
                                            {user.country ? user.country : ''}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

             
            </div>

            {/* Content start from here */}
            <div className='mt-4'>
                <Tabs defaultValue="overview" className="w-full">
                    {/* Tab Headers */}
                    <TabList className=" border-b">
                        <TabNav value="overview" className='text-sm font-semibold'>Profile Info</TabNav>
                        <TabNav value="password" className='text-sm font-semibold'>Change Password</TabNav>
                        <TabNav value="documents" className='text-sm font-semibold'>Documents</TabNav>
                        {/* <TabNav value="balance" className='text-sm font-semibold'>Balance</TabNav> */}
                       
                    </TabList>

                    {/* Tab Content */}
                    <TabContent value="overview">
                        <Overview />
                    </TabContent>

                    <TabContent value="password">
                        <Password />
                    </TabContent>

                    <TabContent value="documents">
                        <Document />
                    </TabContent>
                    {/* <TabContent value="balance">
                        <Balance />
                    </TabContent> */}
                </Tabs>
            </div>
        </div>
    );
};

export default User;