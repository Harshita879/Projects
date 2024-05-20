import React from "react";
import '../video/video.css';

const Video = () => {
    return (
        <div className="m-12 mb-[15%] lg:mb-12 lg:w-3/4 lg:ml-[12%]">
        <div className="iframe-container">
        <div className=" flex justify-center items-center" id="video">
            <iframe  
                src="https://www.youtube.com/embed/Qgky93OHgnE" 
                title="YouTube video player" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
            ></iframe>
        </div>
        </div>
        </div>
    );
}

export default Video;
