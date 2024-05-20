"use client";
import Image from "next/image";
import forumImage from "./waloforum.svg";
import magnifyingGlass from "@/assets/magnifying-glass.svg";
import filter from "@/assets/filter.svg";

export default function forum() {
    return ( 
        <>
        <div className='mt-20 flex flex-row items-center justify-center'>
    <div className="m-15 font-mplus flex flex-col items-center justify-center" >
        <div className='font-mplus font-medium text-3xl flex mb-2 tracking-widest'>
         <h1> WALO  Forum </h1>
         </div>
           <div className='mt-4 font-mplus font-extralight text-[#686666] tracking-widest flex flex-row text-center'>
            <h2>Keep up with the latest news on <br /> WALO and gain new insights.</h2>
            </div>
            </div>
            <div className='ml-5'>
            <Image
            src={forumImage}
            alt="forumImage"
            height={221}
            width={193} />
            </div>
            </div>
            <div className="items-center px-4 flex flex-row justify-center m-7" >
            <div className="relative w-full mx-3">
            <div className="absolute top-2 left-2 items-center">
                <Image
                src={magnifyingGlass}
                alt="magnifyingGlass"
                height={27}
                width={25}
                />
                </div>
                <input
                    type="search"
                    className="h-47 w-full p-2 pl-12 pr-3 text-{#878787} bg-[#EAEAEA] rounded-full border border-gray-300 font-mplus font-extralight tracking-widest"
                    placeholder="What are you looking for?"
                />
            </div>
            <div className='bg-[#EAEAEA] rounded-full border border-gray-300 h-47 w-47 p-2'>
            <div className="top-2 left-2 items-center">
            <Image
            src={filter}
            alt="filter"
            height={32}
            width={25} />
            </div>
            </div>
            </div>
            </>
    );
}