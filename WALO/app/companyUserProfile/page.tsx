"use client";
import Image from "next/image";
import moreButton from "./components/more.svg";
import bgImage from "./components/image.svg";
import { useState } from "react";



const switchText = () => {
    const [textType, setTextType] = useState('2'); // 1 for Complete Pitch, 2 for Complete KYC, 3 for View Pitch

    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: string) => {
        console.log(`Option clicked: ${option}`);
        // Add your logic for handling option
    };
    
    return (
        <>
        <div className="flex flex-col my-20 mx-20 mt-28 items-center">
        <div className="bg-[#6251A3] mb-8 flex flex-row rounded-md font-rounded text-white w-full tracking-wide">
            <div className="flex flex-row w-full justify-between mx-5 items-center flex-wrap text-lg">
            <h4 className="font-semibold">Company Name</h4>
            <div className="flex items-center mr-10">
                <button className="font-extralight">Edit Campaign</button>
                <div className='w-fit h-min ml-20'>


                <div className="dropdown">
      <button className="dropbtn" onClick={toggleDropdown}>
      <Image
            src={moreButton}
            alt="More"
            height={36}
            width={48}
             />
      </button>
      {isOpen && (
        <div className="p-2 overflow-hidden z-10 group-hover:block absolute m-2 w-min bg-white border rounded-lg shadow-md text-black text-base text-nowrap font-medium cursor-pointer">
          <a onClick={() => handleOptionClick('Option 1')}>Manage Investments</a>
          <hr className="m-2"></hr>
          <a onClick={() => handleOptionClick('Option 2')}>Fundraise Stats</a>
          <hr className="m-2"></hr>
          <a onClick={() => handleOptionClick('Option 3')}>Post an Update</a>
        </div>
      )}
    </div>
                


        </div>
        </div>
            </div>
            </div>
            <div className="relative flex justify-center items-center">
            <div className="relative flex justify-center w-max items-center rounded-lg overflow-hidden">
            <Image 
            src={bgImage}
            alt="Rectangle"
            />
            </div>
            <div className="absolute flex flex-col text-center items-center font-rounded tracking-wide font-semibold text-2xl">
                {textType === '1' && (
                        <>
                        <h4>Complete your pitch</h4>
                        <br></br>
                        <h4 className="font-extralight text-[#515151]">Complete your pitch to invite investors and get funded.</h4> <br></br>
                        <button className="p-3 px-14 bg-[#6251A3] hover:drop-shadow-lg text-white font-extralight rounded-md">Complete Pitch</button>
                        </>
                )}
                {textType === '2' && (
                        <>
                        <h4>Complete your KYC Verification</h4>
                        <br></br>
                        <h4 className="font-extralight text-[#515151]">Complete your KYC Verification to get funded.</h4> <br></br>
                        <button className="p-3 px-14 bg-[#6251A3] hover:drop-shadow-lg text-white font-extralight rounded-md">Complete KYC</button>
                        </>
                )}
                {textType === '3' && (
                        <>
                        <h4>View your pitch</h4>
                        <br></br>
                        <h4 className="font-extralight text-[#515151]">See what your pitch your pitch looks like to investors.</h4> <br></br>
                        <button className="p-3 px-14 bg-[#6251A3] hover:drop-shadow-lg text-white font-extralight rounded-md">View Pitch</button>
                        </>
                )}
            </div>
        </div>
        </div>
        
        </>
    );
}
export default switchText;