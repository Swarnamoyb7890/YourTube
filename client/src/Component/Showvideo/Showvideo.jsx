import React from "react";
import "./Showvideo.css";
import { Link } from "react-router-dom";
import moment from "moment";

const Showvideo = ({ vid }) => {
  const getVideoUrl = (filepath) => {
    if (!filepath) return '';
    // Make sure the URL is properly formatted
    const baseUrl = 'https://yourtube-atxv.onrender.com';
    const path = filepath.startsWith('/') ? filepath : `/${filepath}`;
    return `${baseUrl}${path}`;
  };

  return (
    <>
      <Link to={`/videopage/${vid._id}`}>
        <video
          src={getVideoUrl(vid.filepath)}
          className="video_ShowVideo"
          preload="metadata"
          crossOrigin="anonymous"
        />
      </Link>
      <div className="video_description">
        <div className="Chanel_logo_App">
          <div className="fstChar_logo_App">
            <>{vid?.uploader?.charAt(0).toUpperCase()}</>
          </div>
        </div>

        <div className="video_details">
          <p className="title_vid_ShowVideo">{vid?.videotitle}</p>
          <pre className="vid_views_UploadTime">{vid?.uploader}</pre>
          <pre className="vid_views_UploadTime">
            {vid?.views} views <div className="dot"></div>
            {moment(vid?.createdat).fromNow()}
          </pre>
        </div>
      </div>
    </>
  );
};

export default Showvideo;
