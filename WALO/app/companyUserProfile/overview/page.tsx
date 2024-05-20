"use client";
import { useState } from "react";
import React, { ChangeEvent } from 'react';
import AddItemPopup from "./components/popup";

export default function overview() {

    interface Item {
        name: string;
        role: string;
        description: string;
        image: File | null;
      }

    const [tags1, setTags1] = useState<string[]>([]);
  const [tags2, setTags2] = useState<string[]>([]);
  const [tags3, setTags3] = useState<string[]>([]);
  const [inputValue1, setInputValue1] = useState<string>('');
  const [inputValue2, setInputValue2] = useState<string>('');
  const [inputValue3, setInputValue3] = useState<string>('');
  const [name, setName] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  
    const handleInputChange1 = (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue1(e.target.value);
    };
    const handleInputChange2 = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue2(e.target.value);
      };
      const handleInputChange3 = (e: ChangeEvent<HTMLInputElement>) => {
        setInputValue3(e.target.value);
      };

    const plusButton1 = (e: React.MouseEvent<HTMLButtonElement>) => {
        setTags1([...tags1, inputValue1]);
        setInputValue1('');
      };
      const plusButton2 = (e: React.MouseEvent<HTMLButtonElement>) => {
        setTags2([...tags2, inputValue2]);
        setInputValue2('');
      };
      const plusButton3 = (e: React.MouseEvent<HTMLButtonElement>) => {
        setTags3([...tags3, inputValue3]);
        setInputValue3('');
      };
  
    const handleInputKeyDown1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue1) {
        setTags1([...tags1, inputValue1]);
        setInputValue1('');
      }
    };
    const handleInputKeyDown2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue2) {
          setTags2([...tags2, inputValue2]);
          setInputValue2('');
        }
      };
      const handleInputKeyDown3 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue3) {
          setTags3([...tags3, inputValue3]);
          setInputValue3('');
        }
      };
  
    const handleTagDelete1 = (tagIndex: number) => {
      const updatedTags = tags1.filter((_, index) => index !== tagIndex);
      setTags1(updatedTags);
    };
    const handleTagDelete2 = (tagIndex: number) => {
        const updatedTags = tags2.filter((_, index) => index !== tagIndex);
        setTags2(updatedTags);
      };
      const handleTagDelete3 = (tagIndex: number) => {
        const updatedTags = tags3.filter((_, index) => index !== tagIndex);
        setTags3(updatedTags);
      };

      const [showPopup, setShowPopup] = useState(false);

  const handleAddItem = (item: Item) => {
    // Add item logic here
    setName(item.name);
    setItems([...items, item]);
    console.log(item);
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1); // Remove the item at the specified index
    setItems(updatedItems);
  };

    return (
        <div className="my-28 mx-20 font-rounded">
        <div className="inset-0 bg-gradient-to-r from-violet-900 to-indigo-50 opacity-75 rounded-lg z-0">
        <h1 className="ml-3 p-3 text-3xl font-rounded font-bold text-white border-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] z-1">
        Overview
      </h1>
      </div>
      <div className="my-5 mt-12">
      <h1 className='font-rounded font-bold text-2xl'>Highlights</h1>
      <h4 className='font-extralight text-[#757575] mt-2'>Minimum 2 highlights required.</h4>
      </div>
      <div className="relative w-ful bg-[#E2E2E2] rounded-md p-2 items-center justify-center">
      <div className="flex flex-wrap items-center gap-2 ml-10" id={`tags-section-1`}>
        {tags1.map((tag, index) => (
          <div key={index} className="flex items-center bg-[#D8D0EE] rounded-full px-3">
            <span className="mr-2">{tag}</span>
            <button onClick={() => handleTagDelete1(index)} className='font-extrabold'>&times;</button>
          </div>
        ))}
      <input
        type="text"
        value={inputValue1}
        onChange={handleInputChange1}
        onKeyDown={handleInputKeyDown1}
        placeholder="Add highlight"
        className="w-3/4 bg-[#E2E2E2] focus:outline-none"
      />
      
      <button className="absolute left-2 top-1 w-8 h-8 bg-[#BDB3DF] rounded-full flex items-center justify-center" onClick={plusButton1}>
        <span className="text-black font-extrabold text-2xl mb-1">+</span>
      </button>
      </div>
    </div>
    <div className="my-5">
      <h1 className='font-rounded font-bold text-2xl'>Institutional Investors</h1>
      </div>
      <div className="relative w-full bg-[#E2E2E2] rounded-md p-2 items-center justify-center">
      <div className="flex flex-wrap items-center gap-2 ml-10" id={`tags-section-2`}>
        {tags2.map((tag, index) => (
          <div key={index} className="flex items-center bg-[#D8D0EE] rounded-full px-3">
            <span className="mr-2">{tag}</span>
            <button onClick={() => handleTagDelete2(index)} className='font-extrabold'>&times;</button>
          </div>
        ))}
      <input
        type="text"
        value={inputValue2}
        onChange={handleInputChange2}
        onKeyDown={handleInputKeyDown2}
        placeholder="Add investor"
        className="w-3/4 bg-[#E2E2E2] focus:outline-none"
      />
      
      <button className="absolute left-2 top-1 w-8 h-8 bg-[#BDB3DF] rounded-full flex items-center justify-center" onClick={plusButton2}>
        <span className="text-black font-extrabold text-2xl mb-1">+</span>
      </button>
      </div>
    </div>
    <div className="my-5">
      <h1 className='font-rounded font-bold text-2xl'>Fund Utilisation</h1>
      </div>
      <div className="relative w-full bg-[#E2E2E2] rounded-md p-2 items-center justify-center">
      <div className="flex flex-wrap items-center gap-2 ml-10" id={`tags-section-3`}>
        {tags3.map((tag, index) => (
          <div key={index} className="flex items-center bg-[#D8D0EE] rounded-full px-3">
            <span className="mr-2">{tag}</span>
            <button onClick={() => handleTagDelete3(index)} className='font-extrabold'>&times;</button>
          </div>
        ))}
      <input
        type="text"
        value={inputValue3}
        onChange={handleInputChange3}
        onKeyDown={handleInputKeyDown3}
        placeholder="Add"
        className="w-3/4 bg-[#E2E2E2] focus:outline-none"
      />
      
      <button className="absolute left-2 top-1 w-8 h-8 bg-[#BDB3DF] rounded-full flex items-center justify-center" onClick={plusButton3}>
        <span className="text-black font-extrabold text-2xl mb-1">+</span>
      </button>
      </div>
    </div>
    <div className="my-5">
      <h1 className='font-rounded font-bold text-2xl'>Our Team</h1>
      </div>
      <div className="relative w-full bg-[#E2E2E2] rounded-md p-2 items-center justify-center">
      <div className="flex flex-wrap items-center gap-2">
      <div className="bg-[#E2E2E2] ml-10 cursor-default text-gray-400">
            Add Member
      {items.map((item, index) => (
        <div key={index} className="flex items-center bg-[#D8D0EE] rounded-full px-3 text-black my-1">
           <span className="mr-2"> {item.name} </span>
          <button onClick={() => handleDeleteItem(index)}>&times;</button>
        </div>
      ))}
      </div>
      <button className="absolute left-2 top-1 w-8 h-8 bg-[#BDB3DF] rounded-full flex items-center justify-center" onClick={() => setShowPopup(true)}>
        <span className="text-black font-extrabold text-2xl mb-1">+</span>
      </button>
      {showPopup && (
        <AddItemPopup onClose={() => setShowPopup(false)} onAdd={handleAddItem} />
      )}
      
      </div>
      </div>

      <div className='my-10 flex items-center justify-center'>
    <button className="p-3 px-10 bg-[#6251A3] hover:drop-shadow-lg text-white text-xl rounded-lg">CONTINUE</button>
    </div>
      
    </div>
    );
}