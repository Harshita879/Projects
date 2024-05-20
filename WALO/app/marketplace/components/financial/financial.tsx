import React, { useState } from 'react';
import Image from 'next/image';
import Revenue from "./assets/revenue.svg";
import NetLoss from "./assets/loss.svg";
import Money from "./assets/money.svg";
import Rise from "./assets/rise.svg";
import Debt from "./assets/debt.svg"

const Financials = () => {
  const [activeTab, setActiveTab] = useState('Financials');

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const [showMore, setShowMore] = useState(false);

  const handleShowMoreClick = () => {
    setShowMore(true);
  };

  const handleShowLessClick = () => {
    setShowMore(false);
  };

  return (
    <div className='md:ml-20 mx-4'>

      <div className="text-md md:text-lg flex font-medium md:flex-row py-7 justify-between border-b-2  border-[#827F7F] ">
        <button
          className={`border border-[#938D8D] md:py-2 px-3 md:px-8 rounded-full ${activeTab === 'Risks' ? 'bg-[#D8D0EE]' : ''}`}
          onClick={() => handleTabClick('Risks')}>
          Risks
        </button>
        <button
          className={`border border-[#938D8D] md:py-2 px-3 md:px-8 rounded-full ${activeTab === 'Financials' ? 'bg-[#D8D0EE]' : ''}`}
          onClick={() => handleTabClick('Financials')}>
          Financials
        </button>
        <button
          className={`border border-[#938D8D] md:py-2 px-3 md:px-8 rounded-full  ${activeTab === 'Fund Utilization' ? 'bg-[#D8D0EE]' : ''}`}
          onClick={() => handleTabClick('Fund Utilization')}>
          Fund Utilization
        </button>

      </div>

      {/* CONTENT DISPLAY ON BUTTON CLICK */}

      {activeTab === 'Financials' &&
        <div className='mb-12 text-base md:text-lg'>
          <p className='font-semibold text-xl md:text-2xl my-4'>Financials</p>
          <p className=''>
            The Lit Motors Auto-Balance Electric Vehicle (AEV) is the holy grail of commuter vehicles:
            a groundbreaking hybrid of car and motorcycle vehicle architecture, enabled by satellite orientation technology.
          </p>
          <p className='font-semibold text-xl md:text-2xl my-4'>At a Glance</p>
          <div className='flex flex-wrap justify-between text-sm pb-4 border-b-2 border-[#938D8D]'>
            <div className=''>
              <Image src={Revenue} alt="Revenue" height={80} width={80} className='mb-4' />
              <p className='font-semibold'>₹1,00,000</p>
              <p>Revenue</p>
            </div>
            <div>
              <Image src={NetLoss} alt="Net Loss" height={80} width={80} className='mb-4' />
              <p className='font-semibold'>₹1,00,000</p>
              <p>Net Loss</p>
            </div>
            <div>
              <Image src={Money} alt="Money" height={80} width={80} className='mb-4' />
              <p className='font-semibold'>₹1,00,000</p>
              <p>Money in Hand</p>
            </div>
            <div>
              <Image src={Debt} alt="Debt" height={80} width={80} className='mb-4' />
              <p className='font-semibold'>₹1,00,000</p>
              <p>Short-term Debt</p>
            </div>
            <div>
              <Image src={Rise} alt="Rise" height={50} width={60} className='mt-4 md:mt-0 mb-4' />
              <p className='font-semibold'>₹1,00,000</p>
              <p>Rise in 2024</p>
            </div>
          </div>

          <div className='md:block flex-col hidden '>
            <div className='flex justify-between mt-4 text-base md:text-lg  '>
              <div className='space-y-2'>
                <p className='font-semibold'>Min. Investement</p>
                <p>₹81,164.68</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Face Value</p>
                <p>1,00,000</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Coupon Rate(annual)</p>
                <p>11.25</p>
              </div>
            </div>

            <div className='flex justify-between mt-4'>
              <div className='space-y-2 pr-12'>
                <p className='font-semibold'>ISIN</p>
                <p>INE814007469</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Type of NCD</p>
                <p>Listed</p>
              </div>
              <div className='space-y-2'>
                <p className='font-semibold'>Nature of Instrument</p>
                <p>Senior Secured</p>
              </div>
            </div>
          </div>

          <div className='block md:hidden text-base flex-col'>
            <div className='flex space-x-2 mt-4 '>
              <div className='py-3 flex flex-col w-1/2 justify-center items-center  space-y-2 bg-[#E8E8E8] rounded-md'>
                <p className='font-semibold'>Min. Investement</p>
                <p>₹81,164.68</p>
              </div>
              <div className='py-3 flex flex-col w-1/2 justify-center items-center space-y-2 bg-[#E8E8E8] rounded-md'>
                <p className='font-semibold'>Face Value</p>
                <p>1,00,000</p>
              </div>
            </div>

            <div className='flex space-x-2 mt-4 '>
              <div className='py-3 flex flex-col w-1/2 justify-center items-center space-y-2 bg-[#E8E8E8] rounded-md'>
                <p className='font-semibold'>Coupon Rate(annual)</p>
                <p>11.25</p>
              </div>
              <div className='py-3 flex flex-col w-1/2 justify-center items-center space-y-2 bg-[#E8E8E8] rounded-md'>
                <p className='font-semibold'>ISIN</p>
                <p>INE814007469</p>
              </div>
            </div>

            <div className=' flex space-x-2 mt-4'>
              <div className='flex flex-col w-1/2 justify-center items-center space-y-2 bg-[#E8E8E8] rounded-md'>
                <p className='font-semibold'>Type of NCD</p>
                <p>Listed</p>
              </div>
              <div className='py-3 flex flex-col w-1/2 justify-center items-center space-y-2 bg-[#E8E8E8] rounded-md'>
                <p className='font-semibold ml-8'>Nature of Instrument</p>
                <p>Senior Secured</p>
              </div>

            </div>
          </div>

        </div>}

      {activeTab === 'Risks' &&
        <div className='pt-4'>
          <p className='font-semibold text-xl md:text-2xl'>Use of Funds</p>
          <div className='text-base md:text-lg'>
            <div className='flex mt-6'>
              <button className=' border-4 border-[#6251A3] rounded-full w-36 h-12 flex items-center justify-center  mr-4 md:mr-12'>1</button>
              <p>Our future success depends on the efforts of a small management team. The loss of services of the members of the management team may have an adverse effect on the company.
                There can be no assurance that we will be successful in attracting and retaining other personnel we require to successfully grow our business.
              </p>
            </div>
            <div className='flex mt-8'>
              <button className=' border-4 border-[#6251A3] rounded-full w-36 h-12 flex items-center justify-center mr-4 md:mr-12'>2</button>
              <p>Our future success depends on the efforts of a small management team. The loss of services of the members of the management team may have an adverse effect on the company.
                There can be no assurance that we will be successful in attracting and retaining other personnel we require to successfully grow our business.
              </p>
            </div>
            <div className='flex mt-8'>
              <button className=' border-4 border-[#6251A3] rounded-full w-36 h-12 flex items-center justify-center mr-4 md:mr-12'>3</button>
              <p>Our future success depends on the efforts of a small management team. The loss of services of the members of the management team may have an adverse effect on the company.
                There can be no assurance that we will be successful in attracting and retaining other personnel we require to successfully grow our business.
              </p>
            </div>


            {showMore && (
              <div className='flex mt-8'>
                <button className=' border-4 border-[#6251A3] rounded-full w-36 h-12 flex items-center justify-center mr-4 md:mr-12'>4</button>
                <p>Our future success depends on the efforts of a small management team. The loss of services of the members of the management team may have an adverse effect on the company.
                  There can be no assurance that we will be successful in attracting and retaining other personnel we require to successfully grow our business.
                </p>
              </div>
            )}

            {!showMore ? (
              <button className='border border-black py-1 px-4 rounded-md my-8' onClick={handleShowMoreClick}>
                Show More
              </button>
            ) : (
              <button className='border border-black py-1 px-4 rounded-md my-8' onClick={handleShowLessClick}>
                Show Less
              </button>
            )}
          </div>
        </div>
      }


      {activeTab === 'Fund Utilization' &&
        <div>
          <p className='font-semibold text-xl md:text-2xl  my-4'>Use of Funds</p>
          <div className='text-base md:text-lg'>
            <p>$100,00065% towards product development, 15% towards influencer, grassroots, and social media marketing,
              12.5% on legal and other administrative costs, and 7.5% Wefunder fees.
            </p>
            <p className='mt-8'>$5,000,00065% towards product development,
              15% towards influencer, grassroots, and social media marketing, 12.5% on legal and other administrative costs, and 7.5% Wefunder fees.
              Raising our maximum target allows us to better scale our college ambassador influencer program.
            </p>

            {showMore && (
              <p className='mt-8'>
                $5,000,000 65% towards product development,
                15% towards influencer, grassroots, and social media marketing, 12.5% on legal and other administrative costs, and 7.5% Wefunder fees.
                Raising our maximum target allows us to better scale our college ambassador influencer program.
              </p>
            )}

            {!showMore ? (
              <button className='border border-black py-1 px-4 rounded-md my-8' onClick={handleShowMoreClick}>
                Show More
              </button>
            ) : (
              <button className='border border-black py-1 px-4 rounded-md my-8' onClick={handleShowLessClick}>
                Show Less
              </button>
            )}
          </div>
        </div>
      }



    </div>
  )
};

export default Financials;