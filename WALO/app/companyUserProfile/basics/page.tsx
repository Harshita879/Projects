"use client";
import React, { ChangeEvent } from 'react';
import { RefObject,useState,useRef } from 'react';
import uploadImage from '../components/uploadimage.svg';
import Image from 'next/image';

export default function basics() {

    const [tags, setTags] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
  
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    };
  
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue) {
        setTags([...tags, inputValue]);
        setInputValue('');
      }
    };
  
    const handleTagDelete = (tagIndex: number) => {
      const updatedTags = tags.filter((_, index) => index !== tagIndex);
      setTags(updatedTags);
    };

    const fileInputRef: RefObject<HTMLInputElement> = useRef(null);
    const [previewImage, setPreviewImage] = useState(uploadImage);


    const handleClick = () => {
      fileInputRef.current!.click();
    };
  
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
        // Handle the file upload logic here
        console.log('Uploaded file:', file);
      }
    };

  return (
    <div className="my-28 mx-20 font-rounded">
        <div className="inset-0 bg-gradient-to-r from-violet-900 to-indigo-50 opacity-75 rounded-lg z-0">
        <h1 className="ml-3 p-3 text-3xl font-rounded font-bold text-white border-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] z-1">
        Basics
      </h1>
      </div>
      <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Company Name</label>
      <input
        type="text"
        placeholder="Company Name"
        className="focus:outline-none border-0"
      />
      </div>
    </div>
    <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Tagline</label>
      <input
        type="text"
        placeholder="Tagline"
        className="focus:outline-none border-0"
      />
      </div>
    </div>
    <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Location</label>
      <input
        type="text"
        placeholder="Location"
        className="focus:outline-none border-0"
      />
      </div>
    </div>
    <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Website</label>
      <input
        type="text"
        placeholder="URL"
        className="focus:outline-none border-0"
      />
      </div>
    </div>
    <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Date of Formation</label>
      <input
        type="date"
        className="focus:outline-none border-0"
      />
      </div>
    </div>
    <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
        <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Tags</label>
    <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag, index) => (
          <div key={index} className="flex items-center bg-[#D8D0EE] rounded-full px-3 py-1">
            <span className="mr-2">{tag}</span>
            <button onClick={() => handleTagDelete(index)} className='font-extrabold'>&times;</button>
          </div>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Type and press Enter to add tags"
          className="w-full focus:outline-none border-0 px-2 py-1"
        />
      </div>
      </div>
      </div>
      <div className='my-10'>
        <h1 className='font-rounded font-bold text-2xl'>Social Media Handles</h1>
      </div>
      <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Instagram</label>
      <input
        type="text"
        placeholder="URL"
        className="focus:outline-none border-0"
      />
      </div>
      </div>
      <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Facebook</label>
      <input
        type="text"
        placeholder="URL"
        className="focus:outline-none border-0"
      />
      </div>
      </div>
      <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">LinkedIn</label>
      <input
        type="text"
        placeholder="URL"
        className="focus:outline-none border-0"
      />
      </div>
      </div>
      <div className="flex flex-col items-left w-1/2 justify-center my-8">
        <div className='flex flex-col border-2 border-[#6251A3] px-3 py-2 rounded-md'>
      <label className="text-[#6251A3] font-semibold mb-1 text-xs ">Twitter</label>
      <input
        type="text"
        placeholder="URL"
        className="focus:outline-none border-0"
      />
      </div>
      </div>
      <div className='my-10'>
        <h1 className='font-rounded font-bold text-2xl'>Main Image</h1>
        <h4 className='font-extralight text-[#757575]'>Upload a picture of your product to appeal to investors.</h4>
      </div>
      <div>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />
      <div className="flex cursor-pointer">
        <Image
        src={previewImage}
        alt='UploadImage'
        onClick={handleClick}
        className='w-3/4 h-3/4'
        width={50}
        height={50}
        />
      </div>
    </div>
    <div className='my-10 flex items-center justify-center'>
    <button className="p-3 px-10 bg-[#6251A3] hover:drop-shadow-lg text-white text-xl rounded-lg">CONTINUE</button>
    </div>
    </div>
  );
};
