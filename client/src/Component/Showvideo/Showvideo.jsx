import React, { useState } from "react";
import "./Showvideo.css";
import { Link } from "react-router-dom";
import moment from "moment";
import { getVideoUrl } from "../../utils/videoUtils";
import { useSelector, useDispatch } from "react-redux";
import { deleteVideo } from "../../action/video";
import { FaTrash } from "react-icons/fa";

const Showvideo = ({ vid, showDeleteButton = false }) => {
  const [videoError, setVideoError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dispatch = useDispatch();
  const currentuser = useSelector((state) => state.currentuserreducer);

  const handleVideoError = (e) => {
    console.error("Video loading error:", e);
    console.error("Video element:", e.target);
    console.error("Video src:", e.target.src);
    setVideoError(true);
  };

  const videoUrl = getVideoUrl(vid.filepath);

  // Check if current user is the video owner
  const isVideoOwner = currentuser?.result?._id === vid?.videochanel;

  const handleDeleteClick = (e) => {
    e.preventDefault(); // Prevent navigation to video page
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteVideo(vid._id));
      setShowDeleteConfirm(false);
    } catch (error) {
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="video-container" style={{ position: 'relative' }}>
        <Link to={`/videopage/${vid._id}`}>
          <video
            src={videoUrl}
            className="video_ShowVideo"
            preload="metadata"
            crossOrigin="anonymous"
            onError={handleVideoError}
          />
          {videoError && (
            <div className="video-error-overlay">
              Unable to load video
            </div>
          )}
        </Link>
        
        {/* Delete button - only show for video owner AND when showDeleteButton is true */}
        {isVideoOwner && showDeleteButton && (
          <button
            onClick={handleDeleteClick}
            className="delete-video-btn"
            title="Delete video"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255, 0, 0, 0.8)',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '35px',
              height: '35px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              zIndex: 10,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 0, 0, 1)';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 0, 0, 0.8)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            <FaTrash />
          </button>
        )}
      </div>

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

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCancelDelete}
        >
          <div 
            style={{
              background: '#2c2c2c',
              padding: '2rem',
              borderRadius: '10px',
              maxWidth: '400px',
              textAlign: 'center',
              color: 'white'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete Video</h3>
            <p>Are you sure you want to delete "{vid?.videotitle}"?</p>
            <p style={{ fontSize: '0.9rem', color: '#ccc' }}>
              This action cannot be undone.
            </p>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#555',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  opacity: isDeleting ? 0.6 : 1
                }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Showvideo;
