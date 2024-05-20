import React, { useState } from 'react';

const AskQuestion = () => {
    const [questionInput, setQuestionInput] = useState<string>('');
    const [questions, setQuestions] = useState<{ text: string, dateTime: string }[]>([]);
    const [sortBy, setSortBy] = useState<string>('recent'); // Default sorting by recent
    const [showAll, setShowAll] = useState<boolean>(false); // State to control showing all questions

    const submitQuestion = () => {
        if (questionInput.trim() === '') {
            alert('Please enter a question.');
            return;
        }
        const newQuestion = {
            text: questionInput,
            dateTime: formatDate(new Date())
        };
        setQuestions([...questions, newQuestion]);
        setQuestionInput('');
    };

    const formatDate = (date: Date): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(event.target.value);
    };

    const handleSeeMore = () => {
        setShowAll(true);
    };

    const sortedQuestions = [...questions].sort((a, b) => {
        if (sortBy === 'recent') {
            return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
        } else if (sortBy === 'alphabetical') {
            return a.text.localeCompare(b.text);
        }
        return 0;
    });

    return (
        <div className="md:ml-20 ml-8 mt-12 bg-white">
            <p className='text-xl md:text-2xl mb-4 font-semibold'>Ask a Question</p>
            <div className="relative mr-4">
                <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    className="w-full px-2 py-4 md:px-4 md:py-6 pr-[20%] rounded-full border border-gray-600 md:border-gray-300 focus:outline-none focus:border-[#6251A3]"
                    placeholder="Type your question here..."
                />
                <button
                    onClick={submitQuestion}
                    className="absolute right-2 top-2 px-8 py-2 md:px-12 md:py-4 bg-[#6251A3] text-white rounded-full focus:outline-none focus:bg-purple-800"
                >
                    Submit
                </button>
            </div>

            <div className="mt-4">
                <select
                    value={sortBy}
                    onChange={handleSortChange}
                    className="px-4 py-2  border-gray-300 focus:outline-none focus:border-[#6251A3]"
                >
                    <option value="recent">Sort by Recent</option>
                    <option value="alphabetical">Sort Alphabetically</option>
                </select>
            </div>

            <div className="mt-4">
                {sortedQuestions.slice(0, showAll ? sortedQuestions.length : 4).map((question, index) => (
                    <React.Fragment key={index}>
                        <div className="p-4">
                            <div className='flex justify-between items-center'>
                                <div className="flex items-center">
                                    <img
                                        src="profile-placeholder.png" // Replace with your actual profile image
                                        className="w-12 h-12 rounded-full mr-4"
                                        alt="Profile"
                                    />
                                    <span className="text-gray-700">{/* Profile name */}John Doe</span>
                                </div>
                                <span className="text-gray-500">{question.dateTime}</span>
                            </div>
                            <div className='bg-[#D8D0EE] ml-4 p-2 rounded'>
                                <span>{question.text}</span>
                            </div>
                        </div>
                        {index !== sortedQuestions.length - 1 && <hr className="my-4 border-gray-300" />}
                    </React.Fragment>
                ))}
            </div>
            {!showAll && (
                <div className="mt-4">
                    <button
                        onClick={handleSeeMore}
                        className="px-4 py-2 bg-[#6251A3] text-white rounded focus:outline-none focus:bg-purple-800"
                    >
                        See more
                    </button>
                </div>
            )}
        </div>
    )
};

export default AskQuestion;
