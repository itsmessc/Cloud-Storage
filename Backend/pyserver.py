import os
import io
import hmac
import hashlib
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
import pdfplumber
from PyPDF2 import PdfReader, PdfWriter
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
app = FastAPI()

# Define a secret key for HMAC

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow access from any origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable not set")  # Ensure this key is securely managed and kept private
SECRET_KEY=SECRET_KEY.encode('utf-8')
def compute_hmac(data):
    """Compute HMAC-SHA-384 hash of the provided data using a secret key."""
    return hmac.new(SECRET_KEY, data, hashlib.sha384).hexdigest()

def extract_images_from_pdf(pdf_path):
    """Extract images from a PDF file and return their HMAC values."""
    image_hmacs = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for img in page.images:
                x0, top, x1, bottom = img['x0'], img['top'], img['x1'], img['bottom']
                img_obj = page.within_bbox((x0, top, x1, bottom)).to_image(resolution=300)
                image_bytes = io.BytesIO()
                img_obj.save(image_bytes, format='PNG')
                image_hmac = compute_hmac(image_bytes.getvalue())
                image_hmacs.append(image_hmac)
    return image_hmacs

def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file and return it."""
    text_content = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text_content += page.extract_text() + "\n"
    return text_content.strip()

def calculate_hmacs(pdf_path):
    """Extract text and images from a PDF and calculate their HMAC values."""
    text_content = extract_text_from_pdf(pdf_path)
    text_hmac = compute_hmac(text_content.encode('utf-8'))
    image_hmacs = extract_images_from_pdf(pdf_path)
    return text_hmac, image_hmacs

def generate_combined_hmac(text_hmac, image_hmacs):
    """Generate an overall combined HMAC from text and image HMACs."""
    combined_data = text_hmac + ''.join(image_hmacs)
    return compute_hmac(combined_data.encode('utf-8'))

def add_metadata_to_pdf(input_pdf: bytes, combined_hmac: str) -> bytes:
    """Add metadata to the PDF and return the updated PDF as bytes."""
    input_pdf_file = io.BytesIO(input_pdf)
    pdf_reader = PdfReader(input_pdf_file)
    pdf_writer = PdfWriter()

    for page in pdf_reader.pages:
        pdf_writer.add_page(page)

    # Add the HMAC hash to the metadata
    original_metadata = pdf_reader.metadata
    updated_metadata = {**original_metadata, '/Keywords': combined_hmac}
    pdf_writer.add_metadata(updated_metadata)

    # Save the updated PDF in memory and return as bytes
    output_pdf_file = io.BytesIO()
    pdf_writer.write(output_pdf_file)
    output_pdf_file.seek(0)

    return output_pdf_file.getvalue()  # Return the bytes instead of the BytesIO object

def verify_keywords_in_pdf(pdf_content: bytes):
    """Verify the keywords in the PDF metadata."""
    pdf_file = io.BytesIO(pdf_content)
    pdf_reader = PdfReader(pdf_file)
    metadata = pdf_reader.metadata
    keywords = metadata.get('/Keywords', 'No Keywords Found')
    
    # Recalculate the combined HMAC for verification
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        temp_file.write(pdf_content)
        temp_pdf_path = temp_file.name

    text_hmac, image_hmacs = calculate_hmacs(temp_pdf_path)
    combined_hmac = generate_combined_hmac(text_hmac, image_hmacs)

    if keywords == combined_hmac:
        return "Data Integrity Verified"
    else:
        return "Data has been manipulated"

@app.post("/compute-hash/")
async def compute_hash(file: UploadFile = File(...)):
    """Endpoint to compute hash and add it to PDF metadata."""
    if not file:
        raise HTTPException(status_code=422, detail="No file provided.")
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=422, detail="File is not a valid PDF.")

    pdf_content = await file.read()
    
    # Save file temporarily to calculate HMACs
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
        temp_file.write(pdf_content)
        temp_pdf_path = temp_file.name

    # Calculate the HMACs and generate combined HMAC
    text_hmac, image_hmacs = calculate_hmacs(temp_pdf_path)
    combined_hmac = generate_combined_hmac(text_hmac, image_hmacs)

    # Add the HMAC to the metadata and get the modified PDF bytes
    updated_pdf_content = add_metadata_to_pdf(pdf_content, combined_hmac)

    # Return the updated PDF as a StreamingResponse
    return StreamingResponse(io.BytesIO(updated_pdf_content), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={file.filename}"})

@app.get("/")
async def read_root():
    return {"message": "Hi"}

@app.post("/verify-hash")
async def verify_hash(file: UploadFile = File(...)):
    """Endpoint to verify the hash in the PDF metadata."""
    pdf_content = await file.read()
    verification_result = verify_keywords_in_pdf(pdf_content)
    return {"filename": file.filename, "verification_result": verification_result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)  
