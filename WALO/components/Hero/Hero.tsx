"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import heroImg from '@/public/LandingPage/hero.svg';
import playImg from '@/public/LandingPage/play.svg';

import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import VideoSec from '../Videosec/Videosec';

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
  height: 40px;
  margin: auto;
  overflow: hidden;
  position: relative;
  clip-path: polygon(0 10%, 100% 10%, 100% 90%, 0 90%);
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
    <div className='flex flex-col lg:flex-row items-center justify-center lg:justify-evenly my-20'>
      {/* <div className=" lg:m-0">
        <Image className='mt-16 mb-16' src={heroImg} alt="Hero-sec" width={400} height={400} />
      </div> */}
      <div className='m-6 lg:m-0 lg:w-2/5 xl:w-1/3 lg:order-2 '>
        <span className='font-mplus font-bold text-2xl md:text-4xl flex mb-2 '>
          Invest with
          <span>
            <Box className='pt-1 lg:pt-0'>
              <Ul className="font-mplus font-extrabold text-transparent text-2xl  md:text-4xl bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #5F6D9E, #5AD192)' }}>
                <Li>Confidence</Li>
                <Li>WALO</Li>
              </Ul>
            </Box>
          </span>
          <br />
        </span>
        <span className='font-bold text-xl lg:text-4xl mb-3'>
          Your Gateway to Success
        </span>
        <br />
        <div className='h-auto mt-3'>
          <p className='font-mplus font-semibold lg:font-normal mb-6 text-base lg:text-lg'>
            {isMobile ? (
              "WALO redefines the landscape, empowering you to invest directly in high-growth companies shaping the future."
            ) : (
              "Tired of traditional investments that stagnate or plummet? WALO redefines the landscape, empowering you to invest directly in high-growth companies shaping the future. Forget faceless corporations and distant portfolios. Here, you become a partner, not just a shareholder."
            )}
          </p>
        </div>
        <div className='flex flex-col lg:flex-row items-center '>
          <button type="button" className="h-10 w-full lg:w-32  font-mplus bg-[#5AD192] py-2 px-4  rounded-lg lg:rounded-full text-white ">
            Get Started
          </button>
          {!isMobile && ( // Check if the screen width is greater than 768px
            <>
              <Image src={playImg} alt="Hero-sec" width={36} height={36} className='ml-4 lg:ml-6' />
              <Link href='#video' className='ml-2 lg:ml-3 font-mplus text-xs'>How Walo works</Link>
            </>
          )}
        </div>
      </div>
      <div className=" lg:m-0  lg:order-1">
        <Image className='mt-16 ' src={heroImg} alt="Hero-sec" width={420} height={380} />
      </div>
    </div>
  );
};

export default Hero;













