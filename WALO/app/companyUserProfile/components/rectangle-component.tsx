import type { NextPage } from "next";
const RectangleComponent: NextPage = () => {
  return (
    <>
      <div className="w-[432px] h-[810px] bg-[#D8D0EE]">
      <button className="cursor-pointer [border:none] p-0 bg-lavender absolute top-[8.938rem] left-[calc(50%_-_686px)] rounded-3xs w-[22.688rem] h-[4.125rem]" />
      <button className="cursor-pointer [border:none] p-0 bg-[transparent] absolute top-[9.813rem] left-[3.938rem] text-[1.5rem] font-medium font-rounded-mplus-1c text-black text-left inline-block">
        Part 1: The Basics
      </button>
      <button className="cursor-pointer [border:none] p-0 bg-purple-3 absolute top-[14.75rem] left-[calc(50%_-_686px)] rounded-3xs w-[22.688rem] h-[4.125rem]" />
      <button className="cursor-pointer [border:none] p-0 bg-[transparent] absolute top-[15.625rem] left-[3.938rem] text-[1.5rem] font-medium font-rounded-mplus-1c text-black text-left inline-block">
        Part 2: Overview
      </button>
      <button className="cursor-pointer [border:none] p-0 bg-lavender absolute top-[20.563rem] left-[calc(50%_-_686px)] rounded-3xs w-[22.688rem] h-[4.125rem]" />
      <button className="cursor-pointer [border:none] p-0 bg-[transparent] absolute top-[21.438rem] left-[3.938rem] text-[1.5rem] font-medium font-rounded-mplus-1c text-black text-left inline-block">
        Part 3: Financials
      </button>
        </div>
    </>
    );
};
export default RectangleComponent;