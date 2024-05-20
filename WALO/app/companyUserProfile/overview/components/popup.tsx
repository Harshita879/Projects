import React, { useState } from 'react';
import { useRef } from 'react';
import defaultimage from './defaultimage.svg';
import Image from 'next/image';

interface AddItemPopupProps {
  onClose: () => void;
  onAdd: (item: { name: string; role: string; description: string; image: File | null  }) => void;
}

const AddItemPopup: React.FC<AddItemPopupProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submittedName, setSubmittedName] = useState('');

  const handleAdd = () => {
    setSubmittedName(name);
    // Add item logic here
    onAdd({ name, role, description,image });
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg relative" style={{ width: '500px', height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>
        &#x2716;
        </button>
        <h2 className="text-lg font-semibold mb-4">Add member</h2>
        {image ? (
          <Image
            src={URL.createObjectURL(image)}
            alt="Uploaded"
            className="rounded-full mb-4"
            width={150}
            height={150}
          />
        ) : (
          <label htmlFor="fileInput" className="mb-4" onClick={handleImageClick}>
            <Image
              src={defaultimage} // Path to your default image
              alt="Upload"
              className=" cursor-pointer"
              width={150}
              height={150}
            />
          </label>
        )}
        <input
          type="file"
          accept="image/*"
          id="fileInput"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <input
          type="text"
          placeholder="Name"
          className="border border-gray-300 rounded px-2 py-1 mb-4 w-full bg-[#D8D0EE] font-rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Role/Position"
          className="border border-gray-300 rounded px-2 py-1 mb-4 w-full bg-[#D8D0EE] font-rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <textarea
          placeholder="Description"
          className="border border-gray-300 rounded px-2 py-1 mb-4 w-full bg-[#D8D0EE] font-rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>
        <button className="bg-[#6251A3] text-white px-6 py-2 rounded" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  );
};

export default AddItemPopup;
