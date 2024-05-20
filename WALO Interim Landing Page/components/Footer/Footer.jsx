import Image from "next/image";
import waloFooter from '@/assets/walofooter.svg';
import {Quicksand} from 'next/font/google';

const quicksand = Quicksand ({
 subsets: ['latin'],
 weight: ['400','500']
})

const Footer = () => {
 return (
    <main className={quicksand.className}>
      <div className="w-1440 bg-gradient-to-r from-[#D8D0EE] to-[#D8D0EE] sm:pb-1">
        <div className="sm:pt-2 mt-12">
          <div className="flex justify-between items-center">
            <div className="flex pl-[5%]">
              <Image className="mr-[10%] md:block h-14"
                 src={waloFooter}
                alt="footerIcon"
              />
            </div>
            <div className="text-right sm:text-left lg:pr-12 sm:pr-4"> {/* Ensure this div takes up the full width or adjust as needed */}
                <p className="ml-16 mr-3 text-sm sm:text-2xl font-bold leading-5 lg:mr-[5%] md:inline text-nowrap" style={{ color: '#6251A3' }}>
                    Driving Growth,<br className="md:hidden" /> One Business at a Time.
                </p>
            </div>
          </div>
        </div>
      </div>
    </main>
 )
};

export default Footer;
