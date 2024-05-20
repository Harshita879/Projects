
import React, { Dispatch, SetStateAction } from 'react'
import Accordion from './Faq';

type Props = {
    question :string,
    answer: string,
    idx: number
}

interface LayoutProps {
    handleClick: React.MouseEventHandler<HTMLButtonElement>,
    isSomeActive: any,
    turn: boolean[],
    setTurn: Dispatch<SetStateAction<boolean[]>>,
    data: Props[]
}

const Layout = ({handleClick, isSomeActive, data, turn, setTurn}:LayoutProps) => {
    return (
    <div >
    <div className='flex  flex-col lg:w-7/12 lg:mx-auto lg:mt-7 w-full my-5 px-4'>
        <span className='text-sm lg:text-3xl  lg:font-semibold flex justify-center px-6 py-6'>
            Frequently Asked Questions
        </span>

      {data.map((el,i)=>{
        return (
            <div className='w-full'  key={"questions"+i}>
                <Accordion
                question={el.question}
                answer={el.answer}
                turn={turn}
                setTurn={setTurn}
                idx={el.idx}
                />
            </div>
        )
      })}
    </div>
    <div className='flex justify-center my-20 '>
                <button className='bg-[#5AD192] py-2 text-white md:text-4xl text-sm  px-4 rounded-lg '>
                    <h2 className=''>See more Investors FAQ's</h2>
                </button>
            </div>
      </div>
        
  )
}

export default Layout