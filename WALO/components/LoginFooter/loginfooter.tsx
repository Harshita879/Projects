import Media from './media.svg'
import Image from 'next/image';

const LoginFooter = () => {
  return (
    <div className='bg-[#6251A3] flex fixed bottom-0 w-full justify-between p-4 text-white'>
      <div className="flex">
        <p className="font-mplus text-xs ">© 2024 Walo —@walo</p>
      </div>
      <div className='mb-2'>
        <Image src={Media} alt='social media' width={60} height={60}></Image>
      </div>
    </div>
  )
};

export default LoginFooter;

