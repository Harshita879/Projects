"use client";
import Image from "next/image";
import Link from "next/link";


import loginImg from "./login.svg"
const login = () => {
  return (
    <div className="bg-[#6251A3] h-screen flex  items-center justify-center ">
      <div className="bg-white flex bg-opacity-10 p-12 rounded-xl shadow-2xl hidden md:flex">
        <div className=" mx-auto my-auto text-white pr-4">
          <Image
            src={loginImg}
            alt="signupforBusiness"
            height={300}
            width={300}
          />
        </div>
        <div className=' font-mplus flex justify-center mx-auto my-auto p-4 text-white'>
          <div className="">
            <p className='font-mplus text-2xl font-normal mb-4'>Hi!  Welcome Back</p>

            <p className='font-mplus text-md mb-8'>
              New to Walo? <a href="/signinvestor" className="text-white-500 hover:underline">Sign Up</a>
            </p>

            <p className='font-mplus text-3xl font-medium'>Phone Number</p>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="Phone Number"
              className="px-8 py-3 pl-4 my-4 w-full border rounded-md text-black outline-none text-sm hover:shadow-lg"
              pattern="[0-9]{10}"
              required
            />
            <br />
            <button type="button" className="font-mplus text-sm bg-[#5AD192] py-2 px-4 rounded-lg font-semibold text-white hover:shadow-lg">
              <Link href='login/verification'>CONTINUE</Link>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION  */}
      <div className=' font-mplus  text-white text-lg md:hidden w-[85%] items-center justify-center'>
        <p className='font-mplus text-3xl font-medium mb-2'>Hi!  Welcome Back</p>
        <p className='font-mplus text-xs mb-5'>
          New to Walo? <a href="/signbusiness" className="text-white-500 hover:underline">Sign Up</a>
        </p>

        <p className='font-mplus text-sm font-medium'>Phone Number</p>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Phone Number"
          className="px-8 py-3 pl-4 my-4 w-full border rounded-md text-black outline-none text-sm hover:shadow-lg"
          pattern="[0-9]{10}"
          required
        />
        <br />
        <button type="button" className="font-mplus text-sm bg-[#5AD192] py-2 px-8 rounded-lg font-semibold text-white hover:shadow-lg">
          <Link href='login/verification'>CONTINUE</Link>
        </button>
      </div>

    </div>


  )
};

export default login;
