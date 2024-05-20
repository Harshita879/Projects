"use client"
import { useState } from "react";
import Image from "next/image";
import signupBusinessImg from "./signup.svg";
import Link from "next/link";

export default function LoginPage2() {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="bg-[#6251A3] h-screen flex items-center justify-center">

      <div className="bg-white bg-opacity-10 p-8 rounded-xl shadow-2xl border-gray hidden md:flex">
        <div className=" mx-auto my-[5%] text-white pr-4">
          <p className="text-2xl">Welcome</p>
          <p>Already have an account? <a href="/loginbusiness" className="text-white-500 hover:underline">Login here</a></p>
          <div className="hidden md:block">
            <Image src={signupBusinessImg} alt="signupforBusiness" height={300} width={300} />
          </div>
        </div>
        <div className="bg-white p-4 md:p-8 rounded-lg ml-4 md:ml-8 w-[60%]">
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-gray-900 text-lg md:text-xl font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Enter name"
                className="block w-full border-b border-gray-300 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-gray-900 text-lg md:text-xl font-medium mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="company"
                name="company"
                placeholder="Enter company name"
                className="block w-full border-b border-gray-300 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-900 text-lg md:text-xl font-medium mb-1">
                Business Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="@email.com"
                className="block w-full border-b border-gray-300 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="mobile" className="block text-gray-900 text-lg md:text-xl font-medium mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="mobile"
                name="mobile"
                placeholder="Enter Phone No."
                className="block w-full border-b border-gray-300 focus:outline-none"
              />
            </div>
            <button type="button" className="font-mplus text-sm bg-[#5AD192] py-2 px-4 rounded-lg font-semibold text-white hover:shadow-lg">
              <Link href='signbusiness/verification'>CONTINUE</Link>
            </button>
          </form>
        </div>
        <div className="md:hidden mt-4 flex justify-center">
          <Image src={signupBusinessImg} alt="signupforBusiness" height={200} width={200} />
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="md:hidden w-[80%] items-center justify-center">
        <div className=" my-[10%] text-white pr-4">
          <p className="font-medium text-3xl mb-2">Welcome!</p>
          <p>Already have an account? <a href="/login" className="text-white-500 hover:underline">Login here</a></p>
        </div>
        <div className="text-white font-sm">
          <p>Name</p>
          <input
            type="tel"
            id="name"
            name="name"
            placeholder="Enter your Name"
            className="px-8 py-3 pl-4 my-4 w-full border rounded-md text-black outline-none text-sm hover:shadow-lg"
            required
          />
          <p>Company Name</p>
          <input
            type="tel"
            id="company"
            name="company"
            placeholder="Enter Company Name"
            className="px-8 py-3 pl-4 my-4 w-full border rounded-md text-black outline-none text-sm hover:shadow-lg"
            pattern="[0-9]{10}"
            required
          />
          <p>Business Email</p>
          <input
            type="tel"
            id="email"
            name="email"
            placeholder="Enter Email"
            className="px-8 py-3 pl-4 my-4 w-full border rounded-md text-black outline-none text-sm hover:shadow-lg"
            pattern="[0-9]{10}"
            required
          />
          <p>Phone Number</p>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            placeholder="Enter Number"
            className="px-8 py-3 pl-4 my-4 w-full border rounded-md text-black outline-none text-sm hover:shadow-lg"
            pattern="[0-9]{10}"
            required
          />
          <br />
          <button type="button" className="font-mplus text-sm bg-[#5AD192] mt-4 py-2 px-8 rounded-lg font-semibold text-white hover:shadow-lg">
            <Link href='login/verification'>CONTINUE</Link>
          </button>
        </div>
      </div>
    </div>

  );
}
