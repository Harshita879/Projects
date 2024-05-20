"use client";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";

//Import gifs
import Image from "next/image";

import flexible from "@/assets/flexible.svg";
import founderfriendly from "@/assets/founderfriendly.svg";
import fair from "@/assets/fair.svg";
import frequent from "@/assets/frequent.svg";
import whychoosewalo from "@/assets/whychoosewalo.svg";

// import required modules
import { Pagination, Autoplay } from "swiper/modules";
import { useState, useEffect } from "react";

import {Quicksand} from 'next/font/google';

const quicksand = Quicksand ({
  subsets: ['latin'],
  weight: ['400','500','700']
})



export default function Cards() {
  const [slidesPerView, setSlidesPerView] = useState(4);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
        setSlidesPerView(1);
      } else {
        setSlidesPerView(4);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call to set the initial state based on window width

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <main className={quicksand.className}>
    <div className="ht-600 lg:bg-[#6251A3] flex flex-col justify-center items-center text-sm lg:mb-8">
      <p className="lg:hidden font-mplus text-[#6251A3] lg:text-white text-center font-extrabold text-3xl py-8">
        WHY CHOOSE WALO
      </p>
      <Image src={whychoosewalo} alt="whychoosewalo" className="hidden lg:inline"/>
      <div className="lg:hidden mx-auto w-[90%] h-[85%] items-center justify-center mt-4  text-center md:ml-auto  rounded-lg" style={{
      boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.1)',
      '@media (min-width: 769px)': {
        boxShadow: 'none',
      },
    }}>

        <Swiper
          slidesPerView={slidesPerView}
          spaceBetween={16}
          pagination={{
            clickable: true,
          }}
          autoplay={{ delay: 20000 }}
          modules={[Pagination, Autoplay]}
          className="mySwiper"
        >
          <SwiperSlide className="mb-10 flex justify-center">
            <div className="relative w-full">
              <div className="h-full flex items-center justify-center">
                  <Image
                    src={flexible}
                    alt="flexible"
                    className="px---2 py-2"
                    height={286}
                    width={286}
                  />
                </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className="mb-20 flex justify-center">
            <div className="relative w-full">
              <div className="h-full flex items-center justify-center">
                      <Image
                        src={founderfriendly}
                        alt="founderfriendly"
                        className="px---2 py-0.5"
                        height={286}
                        width={286}
                      />
            </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className="mb-20 flex justify-center">
            <div className="relative w-full">
              <div className="h-full flex items-center justify-center">
                  <Image
                    src={fair}
                    alt="fair"
                    className="px---2 py-0.5"
                    height={286}
                    width={286}
                  />
                </div>
            </div>
          </SwiperSlide>

          <SwiperSlide className="mb-20 flex justify-center">
            <div className="relative w-full">
              <div className="h-full flex items-center justify-center">
                  <Image
                    src={frequent}
                    alt="frequent"
                    className="px---2 py-2 "
                    height={286}
                    width={286}
                  />
                </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

    </div>
    </main>
  );
}


