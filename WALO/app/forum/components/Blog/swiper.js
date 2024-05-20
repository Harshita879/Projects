import React, { useState } from 'react';
import SwiperCore, { Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import './style.css';
import {useRouter} from 'next/navigation'; 
// import 'swiper/swiper-bundle.min.css';

SwiperCore.use([Pagination]);

const CardGrid = ({ cards }) => {
  const router = useRouter();
  const itemsPerPage = 12;
  const totalPages = Math.ceil(cards.length / itemsPerPage);
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };


  return (
    <div>
      <Swiper
        slidesPerView={1}
        allowTouchMove={ false }
        spaceBetween={10}
        pagination={{ clickable: true }}
        className="mySwiper"
        initialSlide={(currentPage - 1) * itemsPerPage}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 70,
          },
        }}
      >
        {cards
          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
          .map((card, index) => (
            <SwiperSlide key={index}>
              <div className="card" onClick={() => router.push('/forum/'+card.id)}>
              <div className='mt-4 font-mplus font-extralight text-[#686666] tracking-widest text-sm mb-5px cursor-pointer'>
                <img src={card.imageUrl} alt={card.title} />
                </div>
                <div className="card-content">
                <div className='mt-2 font-mplus font-medium text-[#686666] tracking-widest text-sm mb-5px cursor-pointer'>
                  <h3>{card.title}</h3>
                  </div>
                  <hr className="mt-4 h-px bg-gray-200 border-0 dark:bg-gray-700 relative" />
                  <div className='mt-1 font-mplus font-extralight text-[#686666] tracking-widest text-xs'>
                  <p>{card.dateAdded}</p>
                    <p>{card.timeToRead} mins</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
      <div className="pagination">
      <div className="navigation">
          <button onClick={handlePreviousPage}>&lt;</button>
        </div>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <>
          <div className='hover:font-medium'>
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={currentPage === page ? 'active' : ''}
          >
            {page}
          </button>
          </div>
          </>
        ))}
        <div className='navigation'>
        <button onClick={handleNextPage}>&gt;</button>
        </div>
        </div>
      </div>
  );
};

export default CardGrid;
