import React, { useState } from 'react';
import Image from 'next/image';
import Team from './assets/team.svg';
import Image1 from '@/app/marketplace/components/updates/update.svg'

const Overview = () => {
  const [activeTab, setActiveTab] = useState('Bio');

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  const [viewMore, setviewMore] = useState(false);

  const handleviewMoreClick = () => {
    setviewMore(true);
  };

  const handleviewLessClick = () => {
    setviewMore(false);
  };

  const profiles = [
    {
      name: 'Naveen',
      role: 'CEO, CTO and Founder',
      bio: 'Reed College dropout, UCB, Rhode Island School of Design, MIT Media Lab. Inventor with 23 patents, Land Rover mechanic/machinist, industrial design and sustainable transportation. 19+ years vehicle architecture & prototype development.'
    },
    {
      name: 'Naveen',
      role: 'CEO, CTO and Founder',
      bio: 'Reed College dropout, UCB, Rhode Island School of Design, MIT Media Lab. Inventor with 23 patents, Land Rover mechanic/machinist, industrial design and sustainable transportation. 19+ years vehicle architecture & prototype development.'
    },
    {
      name: 'Naveen',
      role: 'CEO, CTO and Founder',
      bio: 'Reed College dropout, UCB, Rhode Island School of Design, MIT Media Lab. Inventor with 23 patents, Land Rover mechanic/machinist, industrial design and sustainable transportation. 19+ years vehicle architecture & prototype development.'
    }
  ];

  const institutionalInvestors = [
    {
      name: 'Kotak Mahindra Group',
      date: '18 Nov 2021'
    },
    {
      name: 'BlackRock',
      date: '18 Nov 2021'
    },
    {
      name: 'Reliance Group',
      date: '18 Nov 2021'
    }
  ];

  return (
    <div className='md:ml-20 mx-4'>

      <div className="flex flex-col font-sm md:flex-row mt-4 md:justify-between md:border-b-2 md:border-[#827F7F] md:pb-8">
        <div className='border-b-2 border-[#827F7F] pb-8 md:border-none text-md md:text-lg font-medium space-x-[8%] space-y-4 md:space-y-2 md:pb-0  md:space-x-4 md:items-center md:justify-center'>
          <button
            className={`border border-[#938D8D]  md:py-2 px-4 md:px-8 rounded-full ${activeTab === 'Bio' ? 'bg-[#D8D0EE]' : ''}`}
            onClick={() => handleTabClick('Bio')}>
            Bio
          </button>
          <button
            className={`border border-[#938D8D]  md:py-2 px-4 md:px-8 rounded-full ${activeTab === 'Highlights' ? 'bg-[#D8D0EE]' : ''}`}
            onClick={() => handleTabClick('Highlights')}>
            Highlights
          </button>
          <button
            className={`border border-[#938D8D] md:py-2  px-4 md:px-8 rounded-full ${activeTab === 'Our Team' ? 'bg-[#D8D0EE]' : ''}`}
            onClick={() => handleTabClick('Our Team')}>
            Our Team
          </button>
          <button
            className={`border border-[#938D8D]  md:py-2 px-4 md:px-8 rounded-full ${activeTab === 'Institutional Investors' ? 'bg-[#D8D0EE]' : ''}`}
            onClick={() => handleTabClick('Institutional Investors')}>
            Institutional Investors
          </button>
        </div>
      </div>


      {/* CONTENT DISPLAY ON BUTTON CLICK */}

      {activeTab === 'Bio' &&
        <div className='mb-12 text-base md:text-lg'>
          <p className='font-semibold text-lg md:text-2xl my-4'>Company Name Bio</p>

          <p>The Lit Motors Auto-Balance Electric Vehicle (AEV) is the holy grail of commuter vehicles:
            a groundbreaking hybrid of car and motorcycle vehicle architecture, enabled by satellite orientation technology.</p>
          <Image src={Image1}
            alt="Image"
            className=" my-8"
            height={335}
            width={900}
          />
          <p>The Lit Motors Auto-Balance Electric Vehicle (AEV) is the holy grail of commuter vehicles:
            a groundbreaking hybrid of car and motorcycle vehicle architecture, enabled by satellite orientation technology.</p>

          <br />
          <p>The Lit Motors Auto-Balance Electric Vehicle (AEV) is the holy grail of commuter vehicles:
            a groundbreaking hybrid of car and motorcycle vehicle architecture, enabled by satellite orientation technology.</p>
          <Image src={Image1}
            alt="Image"
            className="my-8"
            height={335}
            width={900}
          />
          <p>The Lit Motors Auto-Balance Electric Vehicle (AEV) is the holy grail of commuter vehicles:
            a groundbreaking hybrid of car and motorcycle vehicle architecture, enabled by satellite orientation technology.</p>

        </div>}

      {/* HIGHLIGHTS */}

      {activeTab === 'Highlights' &&
        <div>
          <p className='font-semibold text-lg md:text-2xl my-4'>Highlights</p>
          <div className='text-base  md:text-lg'>
            <ul className="list-disc ml-4 md:ml-12">
              <li>Forem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie.</li>
              <li>Forem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie.</li>
              <li>Forem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie.</li>
              <li>Forem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie.</li>
            </ul>

            {viewMore && (
              <ul className="list-disc ml-4 md:ml-12">
                <li>Forem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie.</li>
                <li>Forem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie.</li>
              </ul>
            )}

            {!viewMore ? (
              <button className='border border-black py-1 px-4 rounded-md my-8 ml-2 md:ml-6' onClick={handleviewMoreClick}>
                View More
              </button>
            ) : (
              <button className='border border-black py-1 px-4 rounded-md my-8 ml-2 md:ml-6' onClick={handleviewLessClick}>
                View Less
              </button>
            )}
          </div>
        </div>
      }

      {/* OUR TEAM */}

      {activeTab === 'Our Team' &&
        <div>
          <p className='font-semibold text-lg md:text-2xl my-4'>Our Team</p>
          <div className='text-base md:text-lg'>
            {profiles.map((profile, index) => (
              <div className='flex mb-8' key={index}>
                <Image src={Team} alt='Profile' height={30} width={30} className="w-12 h-12 rounded-full mr-4"></Image>
                <div>
                  <div className='flex'>
                    <p className='text-base md:text-lg font-semibold mb-4'>{profile.name}</p>
                    <span className='text-base md:text-lg font-semibold text-gray-500 ml-8'>{profile.role}</span>
                  </div>
                  <p className='text-sm md:text-lg'>{profile.bio}</p>
                </div>
              </div>
            ))}
            {viewMore && (
              <div className='flex mb-8'>
                <Image src={Team} alt='Profile' height={30} width={30} className="w-12 h-12 rounded-full mr-4"></Image>
                <div>
                  <div className='flex'>
                    <p className='text-base md:text-lg font-semibold mb-4'>Naveen</p>
                    <span className='text-base md:text-lg font-semibold text-gray-500 ml-8'>CEO, CTO and Founder</span>
                  </div>
                  <p className='text-sm md:text-lg'>Reed College dropout, UCB, Rhode Island School of Design, MIT Media Lab.
                    Inventor with 23 patents, Land Rover mechanic/machinist, industrial design and sustainable transportation.
                    19+ years vehicle architecture & prototype development.</p>
                </div>
              </div>
            )}
            {!viewMore ? (
              <button className='border border-black py-1 px-4 rounded-md my-8' onClick={handleviewMoreClick}>
                View More
              </button>
            ) : (
              <button className='border border-black py-1 px-4 rounded-md my-8' onClick={handleviewLessClick}>
                View Less
              </button>
            )}
          </div>
        </div>
      }

      {/* INSTITUTIONAL INVESTORS */}

      {activeTab === 'Institutional Investors' &&
        <div className='mb-12'>
          <p className='font-semibold text-lg md:text-2xl my-4'>Institutional Investors</p>
          {institutionalInvestors.map((investor, index) => (
            <div key={index}>
              <p className='font-normal text-base md:text-lg'>{investor.name}</p>
              <p className='font-medium md:font-semibold'>Investing in our company since {investor.date}</p>
              <br />
            </div>
          ))}
        </div>
      }



    </div>
  )
};

export default Overview;