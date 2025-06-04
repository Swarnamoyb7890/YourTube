import React, { useState } from "react";
import "./Videoupload.css";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";
import { useSelector, useDispatch } from "react-redux";
import { uploadvideo } from "../../action/video";

const Videoupload = ({ setvideouploadpage }) => {
  const [title, settitle] = useState("");
  const [videofile, setvideofile] = useState("");
  const [progress, setprogress] = useState(0);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  
  const handlesetvideofile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "video/mp4") {
        setError("Please upload MP4 video files only");
        setvideofile(null);
        return;
      }
      console.log("Selected file:", file.name, "Size:", file.size, "Type:", file.type);
      setvideofile(file);
      setError(null);
    }
  };
  
  const currentuser = useSelector((state) => state.currentuserreducer);
  
  const fileoption = {
    onUploadProgress: (progressEvent) => {
      const { loaded, total } = progressEvent;
      const percentage = Math.floor(((loaded / 1000) * 100) / (total / 1000));
      console.log("Upload progress:", percentage + "%");
      setprogress(percentage);
      if (percentage === 100) {
        setTimeout(() => {
          setvideouploadpage(false);
        }, 3000);
      }
    },
  };

  const uploadvideofile = async () => {
    try {
      if (!currentuser?.result) {
        setError("Please login to upload a video");
        return;
      }

      if (!title) {
        setError("Please enter a title for the video");
        return;
      }

      if (!videofile) {
        setError("Please attach a video file");
        return;
      }

      if (videofile.size > 50 * 1024 * 1024) {
        setError("Please attach a video file less than 50MB");
        return;
      }

      console.log("Starting upload with:", {
        title,
        fileSize: videofile.size,
        fileName: videofile.name,
        fileType: videofile.type,
        userId: currentuser.result._id,
        userName: currentuser.result.name
      });

      const filedata = new FormData();
      filedata.append("file", videofile);
      filedata.append("title", title);
      filedata.append("chanel", currentuser.result._id);
      filedata.append("uploader", currentuser.result.name);

      await dispatch(uploadvideo({ filedata: filedata, fileoption: fileoption }));
      setError(null);
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "Error uploading video. Please try again.");
    }
  };

  return (
    <div className="container_VidUpload">
      <input
        type="submit"
        name="text"
        value={"X"}
        onClick={() => setvideouploadpage(false)}
        className="ibtn_x"
      />
      <div className="container2_VidUpload">
        {error && (
          <div className="error-message" style={{ color: "red", margin: "10px 0" }}>
            {error}
          </div>
        )}
        <div className="ibox_div_vidupload">
          <input
            type="text"
            maxLength={30}
            placeholder="Enter title of your video"
            className="ibox_vidupload"
            onChange={(e) => {
              settitle(e.target.value);
              setError(null);
            }}
          />
          <label htmlFor="file" className="ibox_cidupload btn_vidUpload">
            <input
              type="file"
              id="file"
              name="file"
              accept="video/mp4"
              style={{ fontSize: "1rem" }}
              onChange={(e) => {
                handlesetvideofile(e);
              }}
              className="ibox_vidupload"
            />
          </label>
          {videofile && (
            <div style={{ color: "white", margin: "5px 0" }}>
              Selected file: {videofile.name}
            </div>
          )}
        </div>
        <div className="ibox_div_vidupload">
          <input
            type="submit"
            onClick={uploadvideofile}
            value={"Upload"}
            className="ibox_vidupload btn_vidUpload"
          />
          <div className="loader ibox_div_vidupload">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              styles={buildStyles({
                rotation: 0.25,
                strokeLinecap: "butt",
                textSize: "20px",
                pathTransitionDuration: 0.5,
                pathColor: `rgba(255,255,255,${progress / 100})`,
                textColor: "#f88",
                trailColor: "#adff2f",
                backgroundColor: "#3e98c7",
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Videoupload;