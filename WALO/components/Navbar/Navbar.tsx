"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import waloLogo from '@/public/LandingPage/walo.svg';
import waloIcon from '@/public/LandingPage/icon.svg'
import Bars from '@/public/mobileNav/bars.svg';
import Cross from '@/public/mobileNav/cross.svg';
import Blogs from '@/public/mobileNav/blogs.svg';
import Funds from '@/public/mobileNav/funds.svg'
import Contact from '@/public/mobileNav/contact.svg';
import News from '@/public/mobileNav/news.svg';
import FAQ from '@/public/mobileNav/faq.svg';
import Social from '@/public/mobileNav/social.svg';
import Instagram from '@/public/mobileNav/SocialMedia/insta.svg';
import Facebook from '@/public/mobileNav/SocialMedia/facebook.svg';
import Twitter from '@/public/mobileNav/SocialMedia/twitter.svg';
import LinkedIN from '@/public/mobileNav/SocialMedia/linkedIn.svg';
import Profile from '@/public/LandingPage/profile.svg';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`h-20  bg-white fixed top-0 z-10 w-full font-mplus flex items-center justify-between ${isScrolled ? 'shadow-lg' : ''}`} style={{ borderBottom: '1px solid #D1D5DB' }}>
      <div className="md:container md:mx-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between space-x-4">
            <div className='hidden md:flex space-x-4'>
              <Image className='mx-4' src={waloIcon} alt="Walo" width={30} height={30} />
              <Image className='' src={waloLogo} alt="Walo" width={144} height={45} />
            </div>
            <div className='flex md:hidden space-x-2'>
              <Image className='' src={waloIcon} alt="Walo" width={30} height={30} />
              <Image className='' src={waloLogo} alt="Walo" width={120} height={120} />
            </div>
            {/* Mobile Menu Icon */}
            <div className="lg:hidden flex items-center absolute right-8">
              <div className="relative group mr-2">
                <div className="cursor-pointer rounded mr-4">
                  <button type="button" className=" w-auto font-mplus font-normal text-base border border-[#5AD192] px-4 rounded-full text-[#6251A3] ">
                    Login
                  </button>
                </div>
                <div className="hidden group-hover:block absolute mt-2 w-[130%] bg-[#5F6A9E] border rounded-r-lg shadow-md">
                  <ul className="p-2 ">
                    <li>
                      <Link className=' font-mplus text-white text-xs' href="/resources">As an Invester</Link>
                    </li>
                    <li>
                      <Link className='font-mplus text-white text-xs' href="/resources">As a Business</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {isMenuOpen ? (
                <button onClick={toggleMenu}>
                  <Image src={Cross} alt="Close" />
                </button>
              ) : (
                <button onClick={toggleMenu}>
                  <Image src={Bars} alt="Menu" />
                </button>
              )}

              {/* Mobile Menu Icon */}
            </div>
          </div>
          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center font-medium space-x-12 text-lg">
            <Link className='font-mplus ' href="/">Get Funded</Link>
            <Link className='font-mplus' href="/about">Contact Us</Link>
            <div className="relative group">
              <div className="cursor-pointer p-2 rounded">
                <button type="button" className="focus:outline-none font-mplus">
                  Resources
                </button>
              </div>
              <div className="hidden group-hover:block absolute mt-2 ht-92 w-24 bg-[#5F6A9E] border rounded-r-lg shadow-md">
                <ul className="p-4">
                  <li>
                    <Link className='font-mplus text-white text-xs' href="/resources">FAQ's</Link>
                  </li>
                  <li>
                    <Link className='font-mplus text-white text-xs' href="/resources">Blogs</Link>
                  </li>
                </ul>
              </div>
            </div>


            <div className="relative group">
              <div className="cursor-pointer p-2 rounded">
                {isLoggedIn && (
                  <button
                    type="button"
                    className="flex w-auto justify-center font-mplus border border-[#6251A3] px-8 py-2 rounded-full rounded-full"
                  >
                    <Image src={Profile} alt='Profile' height={20} width={20} className='mt-1 mr-2' />
                    <span>Profile</span>
                  </button>
                )}
                {!isLoggedIn && (
                  <button
                    type="button"
                    className="w-auto font-mplus border bg-[#5AD192] px-12 py-2 rounded-full text-white"
                    onClick={() => setIsLoggedIn(true)}
                  >
                    Log In
                  </button>
                )}
              </div>
              <div className="hidden group-hover:block absolute mt-2 w-28 bg-[#5F6A9E] border rounded-r-lg shadow-md">
                <ul className="p-2 ">
                  <li>
                    <Link className=' font-mplus text-white text-xs' href="/resources">As an Invester</Link>
                  </li>
                  <li>
                    <Link className='font-mplus text-white text-xs' href="/resources">As a Business</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile drop down navbar */}
      <div className={`lg:hidden absolute top-16 right-0 w-60 bg-white shadow-lg items-end transform transition-transform duration-1000 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <ul className="py-4 flex-col flex-wrap block ">
          <li className="py-4 px-4 flex">
            <Image className='' src={Funds} alt="Walo" width={20} height={20} />
            <Link className='font-mplus pl-4' href="/">Get Funded</Link>
            <span className="absolute left-6 right-6 h-0.5 bg-black mx-auto mt-8"></span>
          </li>
          <li className="py-4 px-4 flex">
            <Image className='' src={Contact} alt="Walo" width={20} height={20} />
            <Link className='font-mplus pl-4' href="/about">Contact Us</Link>
            <span className="absolute left-6 right-6 h-0.5 bg-black mx-auto mt-10"></span>
          </li>
          <li className="py-4 px-4 flex">
            <Image className='' src={Blogs} alt="Walo" width={20} height={20} />
            <Link className='font-mplus pl-4' href="/resources">Blogs</Link>
            <span className="absolute left-6 right-6 h-0.5 bg-black mx-auto mt-10"></span>
          </li>
          <li className="py-4 px-4 flex">
            <Image className='' src={FAQ} alt="Walo" width={20} height={20} />
            <Link className='font-mplus pl-4' href="/about">FAQ's</Link>
            <span className="absolute left-6 right-6 h-0.5 bg-black mx-auto mt-10"></span>
          </li>
          <li className="py-4 px-4 flex">
            <Image className='' src={News} alt="Walo" width={20} height={20} />
            <Link className='font-mplus pl-4' href="/about">News</Link>
            <span className="absolute left-6 right-6 h-0.5 bg-black mx-auto mt-10"></span>
          </li>
          <li className="py-4 px-4">
            <div className='flex'>
              <Image className='' src={Social} alt="Walo" width={20} height={20} />
              <Link className='font-mplus pl-4' href="/about">Social Media</Link>
            </div>
            <span className='py-4 pl-8 flex'>
              <Image className='pr-2' src={Instagram} alt="Walo" width={30} height={30} />
              <Image className='pr-2' src={Facebook} alt="Walo" width={30} height={30} />
              <Image className='pr-2' src={Twitter} alt="Walo" width={30} height={30} />
              <Image className='pr-2' src={LinkedIN} alt="Walo" width={30} height={30} />
            </span>
            <span className="absolute left-6 right-6 h-0.5 bg-black mx-auto mt-4"></span>
          </li>
          <li className="py-8 px-4">
            <p className='font-mplus text-xs'>Reach out us at <span className='font-mplus text-[#7F71B4]'>support@walo</span> <br /></p>
            <p className='font-mplus text-xs'>© 2024, all rights reserved</p>
          </li>
        </ul>
      </div>

    </nav>
  );
};

export default Navbar;


