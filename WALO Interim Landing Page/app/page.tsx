"use client"
import React from "react";
import { useState } from 'react'
import Hero from "@/components/Hero/Hero";
import Hero2 from "@/components/Hero2/swiper.js";
import Footer from "@/components/Footer/Footer";
import GetStarted from "@/components/GetStarted/getstarted.js";
import Hero4 from "@/components/Hero4/Hero4";
import Video from "@/components/video/video";

export default function Home() {

   const [active, setActive] = useState([false, false, false, false, false]);
  const isSomeActive = active.some((element) => element);
  const handleClick = () => {
    isSomeActive
      ? setActive([false, false, false, false, false])
      : setActive([true, true, true, true, true, true]);
  }

  return (
    <main className=" font-mplus">
      <Hero />
      <Hero2 />
      <GetStarted />
      <Video />
      <Hero4 />
      <Footer/>
    </main>
  );
}
