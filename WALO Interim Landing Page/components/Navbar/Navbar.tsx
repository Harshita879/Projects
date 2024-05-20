"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import waloLogo from '@/public/LandingPage/walo.svg';
import waloIcon from '@/public/LandingPage/icon.svg'
import Bars from '@/public/mobileNav/bars.svg';
import Cross from '@/public/mobileNav/cross.svg';
import Funds from '@/public/mobileNav/funds.svg'
import Contact from '@/public/mobileNav/contact.svg';
import { Quicksand } from 'next/font/google';

const quicksand = Quicksand ({
  subsets: ['latin'],
  weight: ['400','500']
})

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <main className={quicksand.className}>
    <nav className={`h-16 bg-white fixed top-0 z-10 w-full flex items-center justify-between ${isScrolled ? 'shadow-lg' : ''}`} style={{ borderBottom: '1px solid #D1D5DB' }}>
      <div className="container mx-auto mr-[5%]">
        <div className="flex flex-row items-center justify-between ml-[0.7%] lg:ml-[5%] font-extrabold text-xl">
        <div className='sm:flex sm:flex-row'>
          <div className='flex'>
            <Image className='mx-4' src={waloIcon} alt="Walo" width={35} height={30} />
            <Image className='' src={waloLogo} alt="Walo" width={144} height={45} />
          </div>
           {/* Mobile Menu Icon */}
           <div className="lg:hidden flex items-center absolute top-5 right-4">
              <div className="relative group mr-2">
              </div>

              {isMenuOpen ? (
                <button onClick={toggleMenu}>
                  <Image className='inline mb-2 mr-2' src={Cross} alt="Close" width={12} height={12} />
                </button>
              ) : (
                <button onClick={toggleMenu}>
                  <Image src={Bars} alt="Menu" width={24} height={24}/>
                </button>
              )}

              {/* Mobile Menu Icon */}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-20 pl-20 ">
            <a href="https://forms.gle/nw8pX7A7mHnZ6u177" target='_blank'>Get Funded</a>
            <a href="https://forms.gle/nw8pX7A7mHnZ6u177" target='_blank'>Contact Us</a>
          </div>
        </div>
        </div>

      {/* mobile drop down navbar */}
      <div className={`rounded-lg lg:hidden absolute top-16 right-0 w-60 bg-white shadow-lg items-end transform transition-transform duration-1000 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <ul className="flex-col flex-wrap block ">
          <li className="py-4 px-4 flex mt-1">
            <Image className='' src={Funds} alt="Walo" width={20} height={20} />
            <a className=' pl-4' href="https://forms.gle/nw8pX7A7mHnZ6u177" target='_blank'>Get Funded</a>
            <span className="absolute left-5 right-5 h-px bg-zinc-800 opacity-60 mx-auto mt-10"></span>
          </li>
          <li className="py-4 px-4 flex mt-1">
              <Image className='' src={Contact} alt="Walo" width={20} height={20} />
              <a className=' pl-4' href="https://forms.gle/nw8pX7A7mHnZ6u177" target='_blank'>Contact Us</a>
          </li>
        </ul>
      </div>
    </nav>
    </main>
  );
};

export default Navbar;


