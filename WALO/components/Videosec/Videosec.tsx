import Image from 'next/image';
import videoImg from '@/public/LandingPage/video.svg'

const VideoSec = () => {
  return (
    <div className='mt-10 mb-20'>
      <p className='text-center mb-5' id='video'>New to investing? Watch this first!</p>
      <div className='flex justify-center items-center'>
        <Image src={videoImg} alt="Video" width={900} height={56} />
      </div>
    </div>
  )
};

export default VideoSec;
