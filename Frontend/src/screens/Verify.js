import React, { useState, useEffect } from "react";
import Layout from "../components/Layout"; // Navbar component
import "./Verify.css";

function Verify() {
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(""); // State for download URL
  const [verifyMessage, setVerifyMessage] = useState(""); // State for verification message

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setDownloadUrl(""); // Clear previous download URL
    setVerifyMessage(""); // Clear previous verification message
  };

  const handleUpload = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/upload/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          setDownloadUrl(url); // Set download URL
          alert("File uploaded successfully!");
        } else {
          alert("Failed to upload the file.");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error uploading file.");
      }
    } else {
      alert("Please select a file first.");
    }
  };

  const checkIntegrity = async () => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("http://localhost:8000/verify/", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setVerifyMessage(result.message); // Display verification message
          alert("File integrity check completed successfully!");
        } else {
          alert("Failed to verify file integrity.");
        }
      } catch (error) {
        console.error("Error verifying file:", error);
        alert("Error verifying file.");
      }
    } else {
      alert("Please select a file first.");
    }
  };

  return (
    <div className="verify-page">
      <Layout /> {/* Navbar Layout */}
      <main>
        <div className="verify-hero-section">
          <div className="verify-upload-section">
            <label className="custum-file-upload" htmlFor="file">
              <div className="icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill=""
                  viewBox="0 0 24 24"
                >
                  {/* SVG icon code */}
                  <path
                    fill=""
                    d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                    clipRule="evenodd"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <div className="text">
                <span>Click to upload file</span>
              </div>
              <input type="file" id="file" onChange={handleFileChange} />
            </label>
            <div className="verify-button-group">
              <button className="verify-btn-upload" onClick={handleUpload}>
                Upload File
              </button>
              <button className="verify-btn-integrity" onClick={checkIntegrity}>
                Check File Integrity
              </button>
            </div>
            {downloadUrl && (
              <div className="verify-download-section">
                <a href={downloadUrl} download={`updated_${file.name}`}>
                  <button className="verify-btn-download">
                    Download Updated File
                  </button>
                </a>
              </div>
            )}
            {verifyMessage && (
              <div className="verify-message">
                <p>{verifyMessage}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Verify;
