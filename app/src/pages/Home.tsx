import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { readFiles } from "../model/parser";
import { addStreams } from "../util/db";

const Home = () => {
	const [files, setFiles] = useState<File[]>([]);
	const [dragOver, setDragOver] = useState(false);
	const navigate = useNavigate();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFiles = (fileList: FileList | null) => {
		if (fileList) {
			const jsonFiles = Array.from(fileList).filter((file) => file.type === "application/json" || file.name.endsWith(".json"));
			setFiles(jsonFiles);
		}
	};

	//#region File handling methods
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleFiles(e.target.files);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
		handleFiles(e.dataTransfer.files);
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setDragOver(false);
	};
	//#endregion

	const handleUpload = async () => {
		if (files.length === 0) return;

		const streams = await readFiles(files);
		await addStreams(streams);
		navigate("/stats");
	};

	const openFileDialog = () => {
		fileInputRef.current?.click();
	};

	const removeFile = (index: number) => {
		setFiles(files.filter((_, i) => i !== index));
	};

	return (
		<>
			<h1 className="title">Spotify Window</h1>
			<div>
				<h1>Upload Spotify files</h1>

				{/* Hidden actual input */}
				<input ref={fileInputRef} type="file" accept=".json" multiple onChange={handleFileSelect} style={{ display: "none" }} />

				{/* Custom drop zone */}
				<div
					onClick={openFileDialog}
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					style={{
						border: `2px dashed ${dragOver ? "#007bff" : "#ccc"}`,
						borderRadius: "8px",
						padding: "40px 20px",
						textAlign: "center",
						cursor: "pointer",
						backgroundColor: dragOver ? "#f8f9fa1c" : "",
						transition: "all 0.3s ease",
						margin: "20px 0",
					}}
				>
					<div style={{ fontSize: "48px", marginBottom: "10px" }}>📁</div>
					<p style={{ margin: "10px 0", fontSize: "16px", fontWeight: "bold" }}>Drop JSON files here or click to browse</p>
					<p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>Multiple .json files accepted</p>
				</div>

				{files.length > 0 && (
					<div style={{ margin: "20px 0" }}>
						<h3>{files.length} files selected:</h3>
						{files.map((file, index) => (
							<div
								key={index}
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									padding: "8px 12px",
									margin: "5px 0",
									borderRadius: "4px",
								}}
							>
								<span>{file.name}</span>
								<button
									onClick={(e) => {
										e.stopPropagation();
										removeFile(index);
									}}
									style={{
										background: "#ff4444",
										color: "white",
										border: "none",
										borderRadius: "3px",
										padding: "4px 8px",
										cursor: "pointer",
									}}
								>
									✕
								</button>
							</div>
						))}
						<button
							onClick={handleUpload}
							style={{
								backgroundColor: "#007bff",
								color: "white",
								border: "none",
								padding: "12px 24px",
								borderRadius: "6px",
								cursor: "pointer",
								fontSize: "16px",
								marginTop: "10px",
							}}
						>
							Upload Files
						</button>
					</div>
				)}
			</div>
		</>
	);
};

export default Home;
