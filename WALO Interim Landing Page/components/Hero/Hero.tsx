"use client"
import Image from 'next/image';
import { useState,useEffect } from 'react';
import heroimg from '@/public/LandingPage/heroimg.svg';
import playImg from '@/public/LandingPage/play.svg';
import {Quicksand} from 'next/font/google';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';

const scrollCircular = keyframes`
  0% {
    transform: translateY(0);
  }
  25% {
    transform: translateY(0%);
  }
  50% {
    transform: translateY(-55%);
  }
  75% {
    transform: translateY(-55%);
  }
  100% {
    transform: translateY(0%);
  }
`;

const List = styled.ul`
  float: right;
  margin: 0;
  padding: 0;
  
`;

const Box = styled.div`
  height: 50px;
  margin: auto;
  overflow: hidden;
  position: relative;
  clip-path: polygon(0 14%, 100% 10%, 100% 100%, 1 100%);
`;

const Ul = styled.ul`
  margin: 0;
  padding: 0;
  animation: ${scrollCircular} 4s linear infinite;
`;

const Li = styled.li`
  opacity: 1;
  height: 30px;
  padding: 0px 15px 50px 15px;
  list-style: none;
  margin-bottom: 10px;
`;

const quicksand = Quicksand ({
  subsets: ['latin'],
  weight: ['400','500']
})

const Hero = () => {
   const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 768);
    }

    handleResize(); // Call it initially
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <main className={quicksand.className}>
    <div className='bg-[#6251A3] text-white lg:bg-white lg:text-black'>
    <div className='flex flex-col lg:flex-row items-center justify-center lg:justify-around my-2 mt-20 lg:mt-0 mx-10 lg:mx-0 pt-5'>
      <div className='mb-4 lg:mb-0 lg:m-0 lg:w-3/5 xl:w-1/2 lg:order-1 flex flex-col '>
        <span className=' font-bold sm:text-3xl lg:text-5xl flex lg:mb-2 text-2xl whitespace-nowrap lg:pt-8 lg:mt-8'>
          Grow with
          <span>
            <Box className='hidden lg:block'>
              <Ul className=" font-extrabold text-transparent text-2xl sm:text-3xl  lg:text-5xl bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #5F6D9E, #5AD192)' }}>
                <Li>Confidence</Li>
                <Li>WALO</Li>
              </Ul>
            </Box>
            <Box className='lg:hidden'>
              <Ul className=" font-extrabold text-2xl sm:text-3xl  lg:text-5xl bg-clip-text text-[#5AD192]">
                <Li>Confidence</Li>
                <Li>WALO</Li>
              </Ul>
            </Box>
          </span>
          <br />
        </span>
        <span className='font-mplus font-bold sm:text-3xl lg:text-5xl flex text-2xl whitespace-nowrap lg:mb-2 pb-8'>
          Your Gateway to Success.
        </span>
        <div className='h-auto flex flex-col items-center justify-center lg:justify-start'>
           <p className='items-center justify-center font-mplus font-bold lg:font-bold lg:mb-6 text-sm md:text-xl'>
      {isMobile ? (
        "Unlike traditional loans or equity investments, WALO provides funding based on a fraction of your future revenue. This means you retain full ownership of your business while gaining access to the capital necessary to scale."
      ) : (
        "Unlike traditional loans or equity investments, WALO provides funding based on a fraction of your future revenue. This means you retain full ownership of your business while gaining access to the capital necessary to scale. Plus, repayments are directly linked to your revenue, ensuring they remain manageable, even during slower periods."
      )}
    </p>  
        </div>
        <div className='flex flex-col lg:flex-row items-center w-full lg:mt-2 lg:m-0 whitespace-normal lg:pb-10'>
          <a href='https://forms.gle/nw8pX7A7mHnZ6u177' target='_blank' className='w-full lg:w-auto'>
            <button 
            type="button" 
            className="h-10 w-full lg:w-32 bg-[#5AD192] py-2 px-4 rounded-lg lg:rounded-full text-white font-bold mt-6"
          >
            Get Started
          </button>
          </a>
          <div className='flex items-center mt-8 lg:mt-0 lg:ml-8'>
          <a href="#video">
            <Image className='lg:mt-6' src={playImg} alt="play" width={50} height={50} />
          </a>  
            <span className='font-bold text-lg ml-2 lg:mt-6'>How WALO works</span>
          </div>
        </div>
      </div>
      <div className="hidden lg:m-0  lg:order-2 w-10/12 lg:w-auto lg:flex flex-col items-center justify-center">
        <Image className='mt-20 ' src={heroimg} alt="Hero-sec" width={420} height={320} />
      </div>
    </div>
    </div>
    </main>
  );
};

export default Hero;













