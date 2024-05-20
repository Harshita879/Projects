import type { NextPage } from "next";

const PitchCompleted: NextPage = () => {
  return (
    <div className="w-[90rem] h-[59.563rem] relative bg-white overflow-hidden text-left text-[1.5rem] text-black font-rounded-mplus-1c lg:w-[90rem] lg:h-[59.563rem]">
      <div className="absolute top-[-0.187rem] left-[calc(50%_-_720px)] w-[90rem] h-[5.688rem]">
        <div className="absolute top-[0rem] left-[0rem] bg-white shadow-[0px_4px_13px_rgba(0,_0,_0,_0.25)] w-[90rem] h-[5.688rem]" />
        <div className="absolute top-[1.75rem] left-[39.063rem] flex flex-row items-start justify-start gap-[0rem_4.938rem]">
          <div className="relative font-medium">Get Funded</div>
          <div className="relative font-medium">Contact Us</div>
          <div className="relative font-medium">Resources</div>
        </div>
        <div className="absolute top-[1.313rem] left-[74.5rem] rounded-24xl box-border w-[10.688rem] h-[3.375rem] border-[1px] border-solid border-purple-1" />
        <div className="absolute top-[1.438rem] left-[3.938rem] w-[10.9rem] h-[2.813rem] text-[2.019rem] text-purple-1 font-chillax">
          <div className="absolute top-[0rem] left-[0rem] w-[10.9rem] h-[2.813rem]">
            <div className="absolute top-[0rem] left-[2.9rem] w-[8rem] h-[2.813rem]">
              <b className="absolute top-[0rem] left-[0rem] tracking-[0.15em]">
                <span>WALO</span>
                <span className="text-mediumseagreen">.</span>
              </b>
              <div className="absolute top-[1.894rem] left-[6.888rem] bg-white w-[1.669rem] h-[0.188rem] [transform:_rotate(-150.88deg)] [transform-origin:0_0]" />
            </div>
            <div className="absolute top-[0.375rem] left-[0rem] w-[2.081rem] h-[2.081rem]">
              <div className="absolute top-[0rem] left-[0rem] w-[2.081rem] h-[2.081rem]">
                <div className="absolute top-[0rem] left-[0rem] rounded-[1.25px] bg-purple-1 box-border w-[2.081rem] h-[2.081rem] border-[0.1px] border-solid border-gray-200" />
                <img
                  className="absolute top-[0.388rem] left-[0.388rem] w-[1.344rem] h-[1.344rem]"
                  alt=""
                  src="/vector-36.svg"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-[1.875rem] left-[76.375rem] w-[6.938rem] h-[2.25rem]">
          <div className="absolute top-[0rem] left-[2.25rem] font-medium">
            Profile
          </div>
          <img
            className="absolute top-[0.375rem] left-[0rem] w-[1.5rem] h-[1.5rem] overflow-hidden"
            alt=""
            src="/clarityuserline.svg"
          />
        </div>
      </div>
      <div className="absolute top-[8.875rem] left-[calc(50%_-_646px)] rounded-3xs bg-purple-3 w-[80.75rem] h-[46.188rem]" />
      <div className="absolute top-[13.313rem] left-[calc(50%_-_252px)] text-[2.313rem] font-medium">
        You’ve completed your pitch!
      </div>
      <div className="absolute top-[18.625rem] left-[calc(50%_-_460px)] text-[1.563rem] text-dimgray text-center inline-block w-[58.25rem]">
        <p className="m-0">{`Your pitch has been submitted for reviewing. `}</p>
        <p className="m-0">It will be visible to investors in 24 hours.</p>
      </div>
      <button className="cursor-pointer [border:none] p-0 bg-[transparent] absolute top-[44.813rem] left-[calc(50%_-_153px)] w-[19.188rem] h-[3.938rem]">
        <div className="absolute h-full w-full top-[0%] right-[0%] bottom-[0%] left-[0%] rounded-3xs bg-purple-1" />
        <div className="absolute top-[20.63%] left-[7.49%] text-[1.563rem] tracking-[0.05em] font-medium font-rounded-mplus-1c text-white text-center">
          CONTINUE TO HOME
        </div>
      </button>
      <img
        className="absolute top-[24.625rem] left-[calc(50%_-_180px)] w-[22.563rem] h-[18.813rem]"
        alt=""
        src="/walo-forum-3-1-1.svg"
      />
    </div>
  );
};

export default PitchCompleted;
