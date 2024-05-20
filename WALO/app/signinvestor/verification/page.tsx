"use client";
import Image from 'next/image';
import VerifyImg from './verify.svg'
import Link from 'next/link';

export default function VerifyLogin() {
  return (
    <div className="bg-[#6251A3] h-screen flex  items-center justify-center ">
      <div className="bg-white flex bg-opacity-10 p-12 rounded-xl  shadow-2xl">
        <div className=" mx-auto my-auto text-white ">
          <Image
            src={VerifyImg}
            alt="signupforBusiness"
            height={275}
            width={275}
          />
        </div>
        <div className=' font-mplus flex justify-center mx-8 my-[5%]  text-white text-lg'>
          <div className="">
            <p className='font-mplus text-2xl font-medium'>Verification Code</p>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Verification Code"
              className="px-8 py-3 my-6 w-full border rounded-md  text-black outline-none text-sm hover:shadow-lg"
              pattern="[0-9]{10}"
              required
            />
            <br />
            <button type="button" className=" font-mplus text-sm border-2 border-[#5AD192] font-semibold py-1.5 px-8 mr-2 rounded-lg text-[#5F6APE] hover:shadow-lg">
              <Link href='/login'>BACK</Link>
            </button>
            <button type="button" className="font-mplus text-sm bg-[#5AD192] py-2 px-6 font-semibold rounded-lg text-white hover:shadow-lg">
              CONTINUE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
};
