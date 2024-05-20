"use client";
import Image from 'next/image';
import VerifyImg from './verify.svg'
import { useRef } from 'react';
import React from 'react';


export default function VerifyLogin() {
  const digit1Ref = useRef(null);
  const digit2Ref = useRef(null);
  const digit3Ref = useRef(null);
  const digit4Ref = useRef(null);



  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement> | null) => {
    if (event.target.value.length === 1 && ref && ref.current) {
      ref.current.focus();
    }
  };
  return (
    <div className="bg-[#6251A3] h-screen flex  items-center justify-center ">
      <div className="bg-white flex bg-opacity-10 border-gradient-rounded p-12 rounded-xl shadow-2xl hidden md:flex">
        <div className=" mx-auto my-auto text-white ">
          <Image
            src={VerifyImg}
            alt="signupforBusiness"
            height={275}
            width={275}
          />
        </div>
        <div className=' font-mplus lg:inline-block flex justify-center mx-8 my-[5%]  text-white text-lg'>
          <div className="">
            <p className='font-mplus text-2xl font-medium'>Verification Code</p>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Verification Code"
              className="px-8 py-3 my-6 w-full border rounded-md  text-black outline-none text-sm shadow-lg"
              pattern="[0-9]{10}"
              required
            />
            <br />
            <button type="button" className="hidden lg:inline-block font-mplus text-sm border-2 border-[#5AD192] py-1.5 px-8 mr-2 rounded text-[#5F6APE] shadow-lg">
              Back
            </button>
            <button type="button" className="font-mplus text-sm bg-[#5AD192] py-2 px-6 rounded text-white shadow-lg">
              CONTINUE
            </button>
          </div>
        </div>
      </div>

      {/* mobile version */}

      <div className="mx-auto my-auto text-white md:hidden justify-center items-center">
        <p className="font-mplus text-2xl font-medium ml-12">Enter OTP</p>
        <div className="flex justify-center m-6">
          <input
            ref={digit1Ref}
            type="text"
            id="digit1"
            name="digit1"
            placeholder="0"
            className="px-3 py-2 w-10 md:w-12 text-center border rounded-md text-black outline-none text-sm shadow-lg mr-2"
            maxLength={1}
            pattern="[0-9]{1}"
            onChange={(event) => handleInputChange(event, digit2Ref)}
          />
          <input
            ref={digit2Ref}
            type="text"
            id="digit2"
            name="digit2"
            placeholder="0"
            className="px-3 py-2 w-10 md:w-12 text-center border rounded-md text-black outline-none text-sm shadow-lg mr-2"
            maxLength={1}
            pattern="[0-9]{1}"
            onChange={(event) => handleInputChange(event, digit3Ref)}
          />
          <input
            ref={digit3Ref}
            type="text"
            id="digit3"
            name="digit3"
            placeholder="0"
            className="px-3 py-2 w-10 md:w-12 text-center border rounded-md text-black outline-none text-sm shadow-lg mr-2"
            maxLength={1}
            pattern="[0-9]{1}"
            onChange={(event) => handleInputChange(event, digit4Ref)}
          />
          <input
            ref={digit4Ref}
            type="text"
            id="digit4"
            name="digit4"
            placeholder="0"
            className="px-3 py-2 w-10 md:w-12 text-center border rounded-md text-black outline-none text-sm shadow-lg"
            maxLength={1}
            pattern="[0-9]{1}"
            onChange={(event) => handleInputChange(event, null)}
          />
        </div>
        <button type="button" className="font-mplus text-sm bg-[#5AD192] py-2 px-6 ml-12 rounded-lg font-semibold text-white shadow-lg">
          CONTINUE
        </button>
      </div>
    </div>
  )
};









