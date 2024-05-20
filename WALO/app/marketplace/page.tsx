"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import Back from "./assets/back.svg";
import Stars from "./assets/star.svg";
import Video from "./assets/video.svg";
import MobileVideo from "./assets/mobileVideo.svg";
import Facebook from "./assets/fb.svg";
import Youtube from "./assets/youtube.svg";
import Insta from "./assets/insta.svg"
import AskQuestion from './components/question';
import Financials from './components/financial/financial';
import Overview from './components/overview/overview';
import UpdatesPage from './components/updates/updates';
import InvestCard from './components/investcard';


const MarketplacePage = () => {

    const [activeOption, setActiveOption] = useState('Overview');

    const handleOptionClick = (option: string) => {
        setActiveOption(option);
    };
    return (
        <div className=''>
            <div className='mt-24'>
                <div className='flex-row font-mplus text-lg ml-16 hidden md:flex'>
                    <Image src={Back} alt="Back" height={10} width={10} className='mx-4' />
                    <p>Back</p>
                </div>
                <div className='flex-row font-mplus ml-20 mt-4 mb-12 hidden md:flex'>
                    <p className='text-3xl font-bold'>Company Name</p>
                    <Image src={Stars} alt="StarRating" height={29} width={88} className='mx-4 ml-[36%]' />
                </div>
            </div>

            <div className='flex flex-col md:flex-row'>
                <div className='md:pr-6 md:w-2/3'>  {/*MAIN PAGE PARENT DIV */}
                    <div className='md:ml-20 md:border-b-2 border-[#827F7F] md:pb-8'>
                        <Image src={Video} alt="StarRating" height={372} width={890} className='hidden md:flex' />
                        <Image src={MobileVideo} alt="StarRating" height={400} width={400} className='md:hidden justify-center w-full' />
                        <div className='md:hidden pt-6'>
                            <InvestCard />
                        </div>
                        <div className='md:flex md:justify-between mt-8 font-mplus text-md'>
                            <div className='space-x-4 hidden md:flex'>
                                <p>Location</p>
                                <p>Website.com</p>
                                <span className='flex justify-between md:space-x-2'>
                                    <Image src={Youtube} alt="StarRating" height={24} width={24} className='' />
                                    <Image src={Facebook} alt="StarRating" height={24} width={24} className='' />
                                    <Image src={Insta} alt="StarRating" height={24} width={24} className='' />
                                </span>
                            </div>
                            <div className='flex justify-evenly'>
                                <button className='bg-[#D9D9D9] px-8 rounded-sm md:mr-4'>Tags</button>
                                <button className='bg-[#D9D9D9] px-8 rounded-sm md:mr-4'>Tags</button>
                                <button className='bg-[#D9D9D9] px-8 rounded-sm md:mr-4'>Tags</button>
                            </div>
                        </div>
                    </div>

                    <div className=' font-semibold text-xl justify-between mt-8 ml-20 hidden md:flex'>
                        <p className={`cursor-pointer ${activeOption === 'Overview' ? 'border-b-4 pb-1 border-[#6251A3] rounded-sm' : ''}`}
                            onClick={() => handleOptionClick('Overview')}>
                            Overview
                        </p>

                        <p className={`cursor-pointer ${activeOption === 'Financials' ? 'border-b-4 pb-1 border-[#6251A3] rounded-sm' : ''}`}
                            onClick={() => handleOptionClick('Financials')}>
                            Financials
                        </p>

                        <p className={`cursor-pointer ${activeOption === 'Updates' ? 'border-b-4 pb-1 border-[#6251A3] rounded-sm' : ''}`}
                            onClick={() => handleOptionClick('Updates')}>
                            Updates
                        </p>

                        <p className={`cursor-pointer ${activeOption === 'Ask a Question' ? 'border-b-4 pb-1 border-[#6251A3] rounded-sm' : ''}`}
                            onClick={() => handleOptionClick('Ask a Question')}>
                            Ask a Question
                        </p>
                    </div>


                    {activeOption === 'Overview' && (
                        <Overview />
                    )}
                    {activeOption === 'Financials' && (
                        <Financials />
                    )}
                    {activeOption === 'Updates' && (
                        <UpdatesPage />
                    )}
                    {activeOption === 'Ask a Question' && (
                        <AskQuestion />
                    )}
                    {/* Add other sub-options here */}


                </div> {/*MAIN PAGE PARENT DIV */}
                <div className='hidden md:block'>
                    <InvestCard />
                </div>
            </div>
        </div>
    );
};

export default MarketplacePage;
