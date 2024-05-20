"use client"
import React from "react";
import { useState } from 'react'
import Hero from "@/components/Hero/Hero";
import VideoSec from "@/components/Videosec/Videosec";
import Hero2 from "@/components/Hero2/swiper.js";
import GetStartedSection from "@/components/Start/start";

import FAQ from "@/components/FAQ/Faqlayout"
import data from "../public/data.json";
import Footer from "@/components/Footer/Footer";
import GetTouch from "@/components/GetinTouch/Getintouch";

export default function Home() {

  const [active, setActive] = useState([false, false, false, false, false]);
  const isSomeActive = active.some((element) => element);
  const handleclick = () => {
    isSomeActive
      ? setActive([false, false, false, false, false])
      : setActive([true, true, true, true, true, true]);
  }

  return (
    <main className=" font-mplus">
      <Hero />
      <Hero2 />
      <GetStartedSection />
      <VideoSec />
      <FAQ
        handleClick={handleclick}
        isSomeActive={isSomeActive}
        data={data}
        turn={active}
        setTurn={setActive}
      />
      <GetTouch />
      <Footer />
    </main>
  );
}
