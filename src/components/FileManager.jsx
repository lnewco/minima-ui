import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"; // ✅ Added for prop validation
import useChatStore from "../stores/useChatStore";

const FileManager = ({ userId }) => {
    const {
        uploadFiles,
        fetchUploadedFiles,
        uploadedFiles,
        deleteFile,
        renameFile,
        uploading
    } = useChatStore();

    const [renamingFile, setRenamingFile] = useState(null);
    const [newFileName, setNewFileName] = useState("");
    const [menuOpen, setMenuOpen] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null); // ✅ Native file picker trigger

    useEffect(() => {
        fetchUploadedFiles(userId);
    }, [userId, fetchUploadedFiles]); // ✅ Added fetchUploadedFiles as dependency

    const handleFileChange = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        await handleFileUpload(files);
    };

    const handleFileUpload = async (files) => {
        if (files.length === 0) return;
        await uploadFiles(userId, files);
    };

    const handleFileRename = async (fileId) => {
        if (newFileName.trim() !== "") {
            await renameFile(fileId, newFileName);
            setRenamingFile(null);
            setNewFileName("");
        }
    };

    const handleDeleteFile = async (fileId) => {
        await deleteFile(fileId);
    };

    const getFileIconColor = (fileName) => {
        if (fileName.endsWith(".pdf")) return "#EA4E40";
        if (fileName.endsWith(".doc") || fileName.endsWith(".docx")) return "#3F66E6";
        if (fileName.endsWith(".xls") || fileName.endsWith(".xlsx")) return "#40C766";
        if (fileName.endsWith(".ppt") || fileName.endsWith(".pptx")) return "#FFA500";
        return "#000000";
    };

    // ✅ Drag & Drop Events
    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        const files = Array.from(event.dataTransfer.files);
        handleFileUpload(files);
    };

    // ✅ Trigger native file picker
    const triggerFilePicker = () => {
        fileInputRef.current.click();
    };

    return (
        <div className="files-col sidebar-col">
            <div className="col-head">
                <div className="circle-btn white-hover">
                    <svg><use xlinkHref="#icon-file-text" /></svg>
                </div>
                <div className="col-head-title">Files</div>
            </div>

            <div className="col-body">
                {/* ✅ Display Uploaded Files */}
                {uploadedFiles.length === 0 ? (
                    <div className="empty-files-text">
                        No files uploaded yet
                        <span>Add PDFs, DOCX, XLS, or PPT files to start working with AI</span>
                    </div>
                ) : (
                    <div className="files-list">
                        {uploadedFiles.map((file) => (
                            <div key={file.file_id} className="file-item">
                                <div
                                    className="file-item-icon"
                                    style={{ color: getFileIconColor(file.file_name) }}
                                >
                                    <svg><use xlinkHref={`#icon-filetype-${file.file_name.split('.').pop()}`} /></svg>
                                </div>

                                {/* ✅ File Renaming */}
                                {renamingFile === file.file_id ? (
                                    <input
                                        type="text"
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        onBlur={() => handleFileRename(file.file_id)}
                                        placeholder="Enter new file name"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="file-item-title">{file.file_name}</div>
                                )}

                                {/* ✅ Three Dots Menu for File Actions */}
                                <div className="file-item-controls">
                                    <button
                                        className="file-item-edit"
                                        onClick={() => setMenuOpen(menuOpen === file.file_id ? null : file.file_id)}
                                    >
                                        <svg>
                                            <use xlinkHref="#icon-dots-vertical" />
                                        </svg>
                                    </button>

                                    {/* ✅ Dropdown Actions */}
                                    {menuOpen === file.file_id && (
                                        <div className="file-item-dropdown">
                                            <button
                                                className="file-item-rename"
                                                onClick={() => {
                                                    setRenamingFile(file.file_id);
                                                    setMenuOpen(null);
                                                }}
                                            >
                                                <svg><use xlinkHref="#icon-pencil-simple" /></svg>
                                                <span>Rename</span>
                                            </button>
                                            <button
                                                className="file-item-delete"
                                                onClick={() => {
                                                    handleDeleteFile(file.file_id);
                                                    setMenuOpen(null);
                                                }}
                                            >
                                                <svg><use xlinkHref="#icon-trash" /></svg>
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ✅ File Upload with Drag & Drop */}
                <label
                    className={`file-input ${isDragging ? "drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {/* ✅ Hidden Input for File Picker */}
                    <input
                        type="file"
                        multiple
                        hidden
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleFileChange}
                    />
                    <span className="file-input-icon">
                        <svg><use xlinkHref="#icon-folder-notch-plus" /></svg>
                    </span>
                    <span className="file-input-title">
                        {isDragging ? "Drop files to upload" : "Choose a file or Drag & Drop it here"}
                    </span>
                    <button
                        className="file-input-btn"
                        onClick={triggerFilePicker}
                        disabled={uploading}
                    >
                        {uploading ? "Uploading..." : "Upload Files"}
                    </button>
                </label>
            </div>
        </div>
    );
};

// ✅ Prop validation
FileManager.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default FileManager;