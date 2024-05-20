import pyttsx3
import pdfplumber 
import PyPDF2

file_path = r"C:\Users\prafu\OneDrive\Desktop\Urvi LOC.pdf"
output_audio_path = r"C:\Users\prafu\OneDrive\Desktop\audiosample2.mp3"

# Open the PDF file
with open(file_path, 'rb') as f:
    pdf_reader = PyPDF2.PdfReader(f)
    num_pages = len(pdf_reader.pages)
    
    # Initialize pyttsx3 engine
    engine = pyttsx3.init()
    
    # Iterate through each page
    with pdfplumber.open(file_path) as pdf: 
        full_text = ""
        for i in range(num_pages):
            page = pdf.pages[i]
            text = page.extract_text()
            full_text += text + "\n"
        
        # Save the full text to an audio file
        engine.save_to_file(full_text, output_audio_path)
        engine.runAndWait()
