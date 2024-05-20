import Link from "next/link";
import Image from "next/image";
import waloLogo from "@/public/LandingPage/footerlogo.svg"
import instaIcon from "@/public/mobileNav/SocialMedia/insta2.svg"
import fbIcon from "@/public/mobileNav/SocialMedia/facebook2.svg"
import twIcon from "@/public/mobileNav/SocialMedia/twitter2.svg"
import linkIcon from "@/public/mobileNav/SocialMedia/linkedIn2.svg"
import WaloIcon from "@/public/LandingPage/icon.svg"
import MobileLogo from '@/components/Footer/mobileVersion/logo.svg'
import Facebook from '@/components/Footer/mobileVersion/facebook.svg'
import Twitter from '@/components/Footer/mobileVersion/twitter.svg'
import Linkedin from '@/components/Footer/mobileVersion/linkedin.svg'
import Insta from '@/components/Footer/mobileVersion/insta.svg'
const Footer = () => {
  return (
    <div className="w-1440 h-276 pt-[21px] text-[#2f2f2f] pb-[25px] bg-[#6251A3] md:bg-[#D8D0EE]">
      <div className="hidden md:block">
        <div>
          <div className="flex justify-between ">
            <div className="flex pl-[5%] ">

              <Image className="mr-[10%] hidden md:block"
                src={WaloIcon}
                alt="footerIcon"
                height={42}
                width={40}
              />
              <Image className=""
                src={waloLogo}
                alt="footerIcon"
                height={56}
                width={158}
              />
            </div>
            <p className="text-2xl leading-9 mr-16 hidden md:block">Lorep ipsum dolor sit amet, consecturet</p>
          </div>
          <hr className="border-t-2 border-[#6251A3] my-3.5 mx-14 hidden md:block " />
        </div>
        <div className="flex flex-wrap justify-between px-16 sm:px-28">
          <div className="flex flex-col mb-4">
            <Link href="/">GET FUNDED </Link>
            <Link href="/">LOGIN</Link>
            <Link href="/">CAREERS</Link>
            <Link href="/">COMMUNITY PAGE</Link>
          </div>
          <div className="flex flex-col mb-4">
            <Link href="/">RESOURCES</Link>
            <Link href="/">FAQs</Link>
            <Link href="/">BLOG</Link>
          </div>
          <div className="flex flex-col mb-4">
            <Link href="/">ABOUT US</Link>
            <Link href="/">MEET OUR TEAM</Link>
            <Link href="/">PRIVACY POLICY</Link>

          </div>
          <div className="flex flex-col mb-4">
            <Link href="/">CONTACT US</Link>
            <Link href="/">EMAIL</Link>
            <Link href="/">CONTACT NO.</Link>
          </div>
          <div className="flex flex-col mb-4">
            <p className="h-22 mb-[16px] ">FOLLOW US!</p>
            <div className="flex ">
              <Image
                className="mr-3.5"
                src={instaIcon}
                height={30}
                width={30}
                alt="Insta"
              />
              <Image
                className="ml-3.5"
                src={fbIcon}
                height={30}
                width={30}
                alt="Insta"
              />
            </div>
            <div className="flex">
              <Image
                className="mt-2 mr-3.5"
                src={twIcon}
                height={30}
                width={30}
                alt="Insta"
              />
              <Image
                className="mt-2 ml-3.5"
                src={linkIcon}
                height={30}
                width={30}
                alt="Insta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE VERSION */}
      <div className="md:hidden w-full text-sm">
        <div className="flex border-b-2 border-[#D8D0EE] mb-4 justify-between">
          <div className="flex pl-[5%] mb-4">
            <Image className=""
              src={MobileLogo}
              alt="footerIcon"
              height={43}
              width={121}
            />
          </div>
          <div className="flex space-x-3 mb-4 mr-[5%]">
            <Image className=""
              src={Insta}
              alt="footerIcon"
              height={17}
              width={17}
            />
            <Image className=""
              src={Facebook}
              alt="footerIcon"
              height={17}
              width={17}
            />
            <Image className=""
              src={Twitter}
              alt="footerIcon"
              height={17}
              width={17}
            />
            <Image className=""
              src={Linkedin}
              alt="footerIcon"
              height={17}
              width={17}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-between px-4 text-white mb-4">
          <div className="flex flex-col mb-6 space-y-1">
            <Link href="/">GET FUNDED </Link>
            <Link href="/">LOGIN</Link>
            <Link href="/">CAREERS</Link>
          </div>
          <div className="flex flex-col mb-4 space-y-1">
            <Link href="/">RESOURCES</Link>
            <Link href="/">FAQs</Link>
            <Link href="/">BLOG</Link>
          </div>

          <div className="flex flex-col mb-4 space-y-1">
            <Link href="/">CONTACT US</Link>
            <Link href="/">EMAIL</Link>
            <Link href="/">CONTACT NO.</Link>
          </div>
        </div>
        <div className="flex flex-wrap justify-between px-4 text-white">
          <div className="flex flex-col mb-4 space-y-1">
            <Link href="/">ABOUT US</Link>
            <Link href="/">MEET OUR <br /> TEAM</Link>
          </div>
          <div className="flex flex-col mb-4 space-y-1">
            <Link href="/">PRIVACY POLICY</Link>
            <Link href="/">TERMS & <br /> CONDITIONS</Link>
          </div>
          <div className="flex flex-col mb-4 ml-12"></div>
        </div>

      </div>
    </div>
  )
};

export default Footer;
