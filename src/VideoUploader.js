import React, { useState } from "react";
import { s3Client, transcribeClient } from "./aws-config.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { StartTranscriptionJobCommand } from "@aws-sdk/client-transcribe";

const VideoUploader = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [transcriptionStatus, setTranscriptionStatus] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  // Upload video to S3
  const uploadToS3 = async () => {
    if (!videoFile) {
      alert("Please select a video file to upload.");
      return;
    }

    const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
    const basePath = `transcriptionJobs/${Date.now()}/`;
    // TODO maybe check if the file already exists in the bucket

    setUploadStatus("Uploading to S3...");
    
    try {
        console.log(bucketName);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: basePath + videoFile.name, // path is key, key + videoFile.name in the bucket
          Body: videoFile,
          ContentType: "mp4",
        })
      );

      setUploadStatus("File uploaded successfully!");
      startTranscription(basePath);
    } catch (err) {
      console.error("Error uploading to S3:", err);
      setUploadStatus("Failed to upload file.");
    }
  };

  // Start transcription job
  const startTranscription = async (basePath) => {
    const bucketName = process.env.REACT_APP_S3_BUCKET_NAME;
    const transcriptionJobName = `transcription-job-${Date.now()}`;

    setTranscriptionStatus("Starting transcription job...");

    try {
      await transcribeClient.send(
        new StartTranscriptionJobCommand({
          TranscriptionJobName: transcriptionJobName,
          LanguageCode: "en-GB", // Change as needed
          Media: {
            MediaFileUri: `s3://${bucketName}/${basePath + videoFile.name}`,
          },
          OutputBucketName: `${bucketName}`,
          OutputKey: basePath + 'text', // JSON output, also SRT output
          // transcriptionJobs/2024-11-30T13:42:16.231Z_6CCS3AIN Lecture 9A Video.mp4transcription
          Subtitles: {
            Formats: ["srt"],
          },
        })
      );

      setTranscriptionStatus("Transcription job started successfully! Please wait while we caption the video.");
    } catch (err) {
      console.error("Error starting transcription job:", err);
      setTranscriptionStatus("Failed to start transcription.");
    }
  };

  return (
    <div className="video-uploader">
      <h1>Upload Video and Start Transcription</h1>

      {/* File Input */}
      <input type="file" accept="video/mp4" onChange={handleFileChange} />

      {/* Upload Button */}
      <button onClick={uploadToS3}>Upload to S3</button>

      {/* Status Messages */}
      <p>{uploadStatus}</p>
      <p>{transcriptionStatus}</p>
    </div>
  );
};

export default VideoUploader;
