import { useState } from 'react';
import slide1 from './slide1.svg';
import slide2 from './slide2.svg';
import slide3 from './slide3.svg';
import mobile3 from './mobile3.svg'
import Image from 'next/image';
import './start.module.css'

const GetStartedSection = () => {
  const [activeSlide, setActiveSlide] = useState(1);
  const [isClicked, setIsClicked] = useState({
    1: false,
    2: false,
    3: false
  });
  const goToSlide = (slideNumber) => {
    setActiveSlide(slideNumber);
    setIsClicked(prevState => ({
      ...prevState,
      [slideNumber]: true
    }));
  };

  const finalSlide = () => {
    if (activeSlide === 2) {
      goToSlide(3);
    }
    else {
      goToSlide(2); // Go to slide 2 immediately
      setTimeout(() => {
        goToSlide(3);// After 2 seconds, go to slide 3
      }, 2000);
    }
  };

  return (
    <div>
      {/* Desktop Version */}
      <div className="px-4 py-2 relative hidden md:block bg-[#6251A3] mt-20 w-[90%] mx-auto rounded-xl">
        <div className="flex items-center  justify-center relative mx-48 my-10 mb-14">
          <button
            className={`bg-[#5AD192] text-black font-bold h-14 w-14 rounded-full `}
            onClick={() => goToSlide(1)}>
            1
          </button>
          <div className="h-[8px] bg-gray-400 flex-grow relative">
            <div
              className="absolute bg-green-500"
              style={{
                width: `${(activeSlide === 1) ? '0%' : (activeSlide === 2 || 3) ? '100%' : '0%'}`,
                height: '8px',
                transition: 'width 0.5s, background-color 0.5s',
              }}
            ></div>
          </div>
          <button
            className={`bg-${isClicked[2] ? '[#5AD192]' : 'white'} hover:bg-[#5AD192] text-black font-bold h-14 w-14 rounded-full`}
            onClick={() => goToSlide(2)}
          >
            2
          </button>
          <div className="h-[8px] bg-gray-400 flex-grow relative">
            <div
              className="absolute bg-green-500"
              style={{
                width: `${(activeSlide === 3) ? '100%' : '0%'}`,
                height: '8px',
                transition: 'width 0.5s, background-color 0.5s',
              }}
            ></div>
          </div>
          <button
            className={`bg-${isClicked[3] ? '[#5AD192]' : 'white'} hover:bg-[#5AD192] text-black font-bold h-14 w-14 rounded-full`}
            onClick={finalSlide}
          >
            3
          </button>
        </div>
        <div className="mb-8 bg-white bg-opacity-10 w-[70%] text-white py-4 rounded-xl mx-auto">
          <div className={`transition-opacity duration-1000 flex flex-col justify-center items-center`} style={{ opacity: activeSlide === 1 ? 1 : 0 }} >
            {activeSlide === 1 && (
              <>
                <h2 className="text-2xl font-bold mb-2">SIGN UP</h2>
                <p className='mb-8'>Sign up to create an account and get started with investing.</p>
                <Image
                  src={slide1}
                  alt='xyz'
                  height={150}
                  width={300}
                />
              </>
            )}
          </div>
          <div className={`transition-opacity duration-1000 flex flex-col justify-center items-center`} style={{ opacity: activeSlide === 2 ? 1 : 0 }}>
            {activeSlide === 2 && (
              <>
                <h2 className="text-2xl font-bold mb-2 ">EXPLORE</h2>
                <p className='mb-8'>Explore and research all business on WALO & see which one interests you.</p>
                <Image
                  src={slide2}
                  alt='xyz'
                  height={150}
                  width={300}
                />
              </>
            )}
          </div>
          <div className={`transition-opacity duration-1000 flex flex-col justify-center items-center`} style={{ opacity: activeSlide === 3 ? 1 : 0 }}>
            {activeSlide === 3 && (
              <>
                <h2 className="text-2xl font-bold mb-2 ">INVEST & RECEIVE RETURNS</h2>
                <p className='mb-8'>Invest & watch the business grow while getting returns!</p>
                <Image
                  src={slide3}
                  alt='xyz'
                  height={150}
                  width={300}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {/* MOBILE VERSION */}
      <div className='md:hidden'>
        {/* <div className='flex justify-center font-semibold mb-4 mt-10'>How To Get Started</div>
        <div className='flex justify-between w-full'>
          <div className='flex items-center justify-center mx-[4%] w-[36%]'>
            <Image
              src={slide1}
              alt='xyz'
              height={130}
              width={130}
            />
          </div>
          <div className='flex justify-center items-center bg-[#6251A3] rounded-l-3xl my-6 w-[64%]'>
            <div className='bg-white rounded-2xl m-4 p-4 font-medium  text-2xl'>
              <button >1</button>
            </div>
            <div className='text-white p-3 text-xs'>
              <span className='text-md font-semibold'>SIGN UP TO VALO</span>
              <br />
              Sign up to create an account and get started with investing.
            </div>
          </div>
        </div>

        <div className='connector-line'></div>

        <div className='flex justify-between w-full'>
          <div className='flex justify-center items-center bg-[#6251A3] rounded-r-3xl my-6 w-[65%]'>
            <div className='text-white p-3 text-xs w-[85%]'>
              <span className='text-md font-semibold'>EXPLORE</span>
              <br />
              Explore all businesses on WALO & see which ones interest you.
            </div>
            <div className='bg-white rounded-2xl m-4 p-4 font-medium  text-2xl'>
              <button>2</button>
            </div>
          </div>
          <div className=' flex items-center justify-center mx-[2%] w-[36%]'>
            <Image
              src={slide2}
              alt='xyz'
              height={110}
              width={110}
            />
          </div>
        </div> */}

        <div className='flex justify-center font-semibold mb-4 mt-10'>How To Get Started</div>
        <div className='relative'>
          <div className='flex justify-between w-full'>
            <div className='flex items-center justify-center mx-[4%] w-[36%]'>
              <Image
                src={slide1}
                alt='xyz'
                height={130}
                width={130}
              />
            </div>
            <div className='flex justify-center items-center bg-[#6251A3] rounded-l-3xl my-6 w-[64%]'>
              <div className='bg-white rounded-2xl m-4 p-4 font-medium  text-2xl'>
                <button >1</button>
              </div>
              <div className='text-white p-3 text-xs'>
                <span className='text-md font-semibold'>SIGN UP TO VALO</span>
                <br />
                Sign up to create an account and get started with investing.
              </div>
            </div>
          </div>
          {/* Vertical connector line */}
          <div className='connector-line1'></div>

          <div className='flex justify-between w-full'>
            <div className='flex justify-center items-center bg-[#6251A3] rounded-r-3xl my-6 w-[65%]'>
              <div className='text-white p-3 text-xs w-[85%]'>
                <span className='text-md font-semibold'>EXPLORE</span>
                <br />
                Explore all businesses on WALO & see which ones interest you.
              </div>
              <div className='bg-white rounded-2xl m-4 p-4 font-medium  text-2xl'>
                <button>2</button>
              </div>
            </div>
            <div className=' flex items-center justify-center mx-[2%] w-[36%]'>
              <Image
                src={slide2}
                alt='xyz'
                height={110}
                width={110}
              />
            </div>
          </div>

          <div className='connector-line2'></div>

          <div className='flex justify-between w-full'>
            <div className=' flex items-center justify-center mx-[4%] w-[36%]'>
              <Image
                src={mobile3}
                alt='xyz'
                height={130}
                width={130}
              />
            </div>
            <div className='flex justify-center items-center bg-[#6251A3] rounded-l-3xl my-6 w-[64%]'>
              {/* <div className='bg-[#6251A3] h-full w-0.5 absolute top-0 left-1/2 transform -translate-x-1/2'></div> */}
              <div className='bg-white rounded-2xl mx-4 p-4 font-medium  text-2xl'>
                <button >3</button>
              </div>
              <div className='text-white p-3 text-xs w-[80%]'>
                <span className='text-md font-semibold'>INVEST & RECEIVE RETURNS </span>
                <br />
                Invest & watch the business grow while getting returns!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default GetStartedSection;
