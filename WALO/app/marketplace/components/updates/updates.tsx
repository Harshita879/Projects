import React from 'react';
import Image from 'next/image';
import update from "./update.svg";
import ProfileImg from "./profileimg.svg"

const UpdatesPage = () => {
    // Simulated data for updates
    const updates = [
        {
            Img: update, // Replace with actual image URL
            content: 'Single Liner Update',
            timestamp: '2024-02-29',
            profileName: 'Siddhu',
            updatename: 'CEO, CTO and Founder',
        },

    ];

    return (
        <div className="md:ml-12 bg-white mx-4 md:p-6">
            <p className='text-xl md:text-3xl my-3 md:mb-4 font-semibold'>Updates</p>
            <div className="update-list">
                {updates.map((updateData, index) => (
                    <div key={index} className="">
                        <div className="text-base md:text-lg">
                            <p >{updateData.content}</p>
                        </div>

                        <div className="profile-info mb-8">
                            <div>
                                <Image src={updateData.Img}
                                    alt="Profile"
                                    className="mt-2"
                                    height={400}
                                    width={900}
                                />
                            </div>
                            <div className='flex mt-8'>
                                <div>
                                    <Image src={ProfileImg} alt='Profile' height={90} width={90} className="w-12 h-12 rounded-full mr-4"></Image>
                                </div>
                                <div className='text-lg w-[90%]'>
                                    <span className='text-base md:text-lg font-semibold mb-4'>{updateData.profileName}</span>
                                    <span className='text-base md:text-lg font-semibold text-gray-500 ml-8'>{updateData.updatename}</span>
                                    <div className='flex justify-between'>
                                        <p className='text-base md:text-lg'>Updated on {updateData.timestamp}</p>
                                        <div className='hidden md:flex'>
                                            <button className='bg-[#D9D9D9] px-8 rounded-sm mr-4 text-sm'>Tags</button>
                                            <button className='bg-[#D9D9D9] px-8 rounded-sm mr-4 text-sm'>Tags</button>
                                            <button className='bg-[#D9D9D9] px-8 rounded-sm mr-4 text-sm'>Tags</button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='text-base md:text-lg'>
                                <p >{updateData.content}</p>
                            </div>
                            <div className="profile-info">
                                <div>
                                    <Image src={updateData.Img}
                                        alt="Profile"
                                        className="mt-2"
                                        height={400}
                                        width={900}
                                    />
                                </div>
                                <div className='flex mt-8'>
                                    <div>
                                        <Image src={ProfileImg} alt='Profile' height={90} width={90} className="w-12 h-12 rounded-full mr-4"></Image>
                                    </div>
                                    <div className='text-lg w-[90%]'>
                                        <span className='text-base md:text-lg font-semibold mb-4'>{updateData.profileName}</span>
                                        <span className='text-base md:text-lg font-semibold text-gray-500 ml-8'>{updateData.updatename}</span>
                                        <div className='flex justify-between'>
                                            <p className='text-base md:text-lg'>Updated on {updateData.timestamp}</p>
                                            <div className='hidden md:flex'>
                                                <button className='bg-[#D9D9D9] px-8 rounded-sm mr-4 text-sm'>Tags</button>
                                                <button className='bg-[#D9D9D9] px-8 rounded-sm mr-4 text-sm'>Tags</button>
                                                <button className='bg-[#D9D9D9] px-8 rounded-sm mr-4 text-sm'>Tags</button>
                                            </div>

                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpdatesPage;
