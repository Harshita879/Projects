import Image from 'next/image'
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react'

import plus from "@/public/LandingPage/plus.svg";
import minus from "@/public/LandingPage/minus.svg"

type Props = {
    question: string,
    answer: string,
    turn: boolean[],
    setTurn: Dispatch<SetStateAction<boolean[]>>,
    idx: number
}

const Accordion = ({question, answer, turn, setTurn, idx}: Props) => {

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(()=>{
        if(contentRef.current){
            contentRef.current.style.maxHeight = turn![idx] ? `${contentRef.current.scrollHeight}px`:"0px"
        }

    },[contentRef, turn, idx])

    const toggleAccordion = () => {
        let newTurn = [...turn!]
        newTurn[idx] = !newTurn[idx]
        setTurn!(newTurn)
    }
  return (
    <div className='flex flex-col items-center justify-center w-full px-2 text-lg pt-2 lg:text-base'>
      <div 
        className={`bg-transparent px-5  w-full h-full ${turn![idx]}`}>
        <div className='py-3'>
           <div className='flex items-center justify-between h-12 text-left'>
                <span className='ml-2 font-medium lg:font-semibold lg:text-xl text-sm'>{question}</span>
                      
              <div onClick={toggleAccordion} className='cursor-pointer'>
               { turn![idx] ? <Image src={minus} alt="" width={20} height={20}/> :
                <Image src={plus} alt="" width={20} height={20}/>}
                
              </div>
           </div>
           <div ref={contentRef} className='mx-4 overflow-hidden text-left transition-all duration-500 h-full'>
                      <p className='font-normal leading-normal text-justify whitespace-pre-line text-xs lg:text-lg'>
                {answer}
              </p>
           </div>
              </div>
                    <hr className="border-t-1 border-[#000]  " />
          </div>
      </div>
  )
}

export default Accordion