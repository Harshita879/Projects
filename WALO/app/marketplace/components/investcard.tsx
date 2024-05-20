"use client";
import { useState } from "react";
import Image from "next/image";
import Save from "@/app/marketplace/assets/save.svg";
import Giftbox from "@/app/marketplace/assets/giftbox.svg";

const InvestCard = () => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };
  return (
    <div className='w-auto' >
      <div className='flex  mx-[4%] md:w-3/4 font-mplus'>
        <div className='border-t-8 border-[#6251A3] border-solid rounded-sm'>
          <div className=" border border-gray-300  p-4  bg-white ">
            <p className=" mb-4 text-lg"><span className='text-3xl font-bold'>₹ 1,00,00,000</span> Total Raise from 1,400 Investors.</p>
            <div className='hidden md:block'>
              <h3 className="text-xl font-semibold mb-2">INVESTMENT</h3>
              <div className='flex gap-4'>
                <p className="text-lg mb-2 w-[35%]">Invest Min. <br /> ₹500</p>

                <div className='relative'>
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-2xl text-black">₹</span>
                  <input
                    className='bg-[#D9D9D9] font-md text-xl h-14 w-full pl-12 pr-4 text-black placeholder-opacity-100 placeholder-black rounded-sm'
                    type="text"
                    placeholder="0"
                  />
                </div>

              </div>
            </div>
            <div className="hidden md:block">
              <button className="bg-[#6251A3] border text-white  py-2 px-4 my-1 w-full">INVEST</button>
              <button className="bg-white border text-black py-2 px-4 my-1 w-full flex items-center justify-center ">
                SAVE
                <Image
                  src={Save}
                  alt='savelogo'
                  height={14}
                  width={16}
                  className="ml-2"
                />
              </button>
            </div>
          </div>
          <div className=' border border-gray-300  px-4  mx-auto bg-white'>
            <p className="text-lg  mt-4 mb-2 flex justify-between" >INVESTMENT TERMS
              <span className="ml-2 cursor-pointer" onClick={toggleExpanded}>{expanded ? '˄' : '˅ '}</span>
            </p>
            <p className="text-xs mb-2">
              <span className='font-semibold'>Future Equity</span><br />
              ₹1,00,000 <span className='text-gray-400'>valuation cap</span>
            </p>
            <p className="text-xs mb-2 flex">
              <Image
                src={Giftbox}
                alt='savelogo'
                height={10}
                width={10}
                className='mr-1'
              />
              <span className='font-semibold '>Investors Perks:</span>
              <span className="ml-1">
                <span> ₹500,</span>
                <span> ₹3K,</span>
                <span> ₹5K</span>
              </span>
            </p>
            {expanded && (
              <div className='text-xs pb-4'>
                <p className='mb-1'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam tempore ratione natus quaerat obcaecati</p>
                <p className=''>Learn more about this <a href="" className='underline'>click here</a></p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div >
  )
};

export default InvestCard;
