'use client'

interface FileUploadProps {
    label: string
    file: File | null
    onFileSelect: (file: File | null) => void
}

export default function FileUpload({ label, file, onFileSelect }: FileUploadProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null
        onFileSelect(selectedFile)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.name.endsWith('.csv')) {
            onFileSelect(droppedFile)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    return (
        <div>
            {label && (
                <label className="block text-xs font-medium text-slate-700 mb-2">
                    {label}
                </label>
            )}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`border-2 border-dashed rounded-lg p-4 text-center transition cursor-pointer ${
                    file
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
            >
                <label className="block cursor-pointer">
                    <div className="text-center">
                        <svg
                            className="mx-auto h-8 w-8 text-slate-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                        >
                            <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {file ? (
                            <div className="mt-2">
                                <p className="text-xs font-medium text-emerald-700">
                                    ✓ {file.name}
                                </p>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        onFileSelect(null)
                                    }}
                                    className="mt-1 text-xs text-rose-600 hover:text-rose-800"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="mt-2">
                                <p className="text-xs font-medium text-slate-700">
                                    Drop CSV here or click to upload
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                    CSV files only
                                </p>
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleChange}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    )
}
