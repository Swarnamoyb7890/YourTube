import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Videopage.css";
import moment from "moment";
import Likewatchlatersavebtns from "./Likewatchlatersavebtns";
import { useParams, Link, useNavigate } from "react-router-dom";
import Comment from "../../Component/Comment/Comment";
// import vidd from "../../Component/Video/vid.mp4"
import { viewvideo, deleteVideo } from "../../action/video";
import { addtohistory } from "../../action/history";
import { useSelector, useDispatch } from "react-redux";
import { getVideoUrl } from "../../utils/videoUtils";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaTrash } from 'react-icons/fa';
import { BiSkipPrevious, BiSkipNext } from 'react-icons/bi';

const Videopage = () => {
  const { vid } = useParams();
  const dispatch = useDispatch();
  const vids = useSelector((state) => state.videoreducer);
  // const vids = [
  //     {
  //         _id: 1,
  //         video_src: vidd,
  //         chanel: "wvjwenfj3njfwef",
  //         title: "video 1",
  //         uploader: "abc",
  //         description: "description of video 1"
  //     },
  //     {
  //         _id: 1,
  //         video_src: vidd,
  //         chanel: "wvjwenfj3njfwef",
  //         title: "video 1",
  //         uploader: "abc",
  //         description: "description of video 1"
  //     },
  //     {
  //         _id: 2,
  //         video_src: vidd,
  //         chanel: "wvjwenfj3njfwef",
  //         title: "video 2",
  //         uploader: "abc",
  //         description: "description of video 2"
  //     },
  //     {
  //         _id: 3,
  //         video_src: vidd,
  //         chanel: "wvjwenfj3njfwef",
  //         title: "video 3",
  //         uploader: "abc",
  //         description: "description of video 3"
  //     },
  //     {
  //         _id: 4,
  //         video_src: vidd,
  //         chanel: "wvjwenfj3njfwef",
  //         title: "video 4",
  //         uploader: "abc",
  //         description: "description of video 4"
  //     },
  // ]
  // console.log( vids)
  const vv = (vids?.data || []).filter((q) => q._id === vid)[0];

  const currentuser = useSelector((state) => state.currentuserreducer);

  const handleviews = useCallback(() => {
    dispatch(viewvideo({ id: vid }));
  }, [dispatch, vid]);

  const handlehistory = useCallback(() => {
    if (currentuser?.result?._id) {
      dispatch(
        addtohistory({
          videoid: vid,
          viewer: currentuser?.result?._id,
        })
      );
    }
  }, [dispatch, vid, currentuser?.result?._id]);

  useEffect(() => {
    if (currentuser) {
      handlehistory();
    }
    handleviews();
  }, [currentuser, handlehistory, handleviews]);

  const [showLimitPopup, setShowLimitPopup] = React.useState(false);

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);

  // Plan time limits in minutes
  const planLimits = {
    free: 5,
    bronze: 7,
    silver: 10,
    gold: null // unlimited
  };

  useEffect(() => {
    setShowLimitPopup(false); // Reset popup on video/plan change
  }, [currentuser?.result?.plan, vv?.filepath]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentuser?.result?.plan) return;
    const plan = (currentuser.result.plan || 'free').toLowerCase();
    const limit = planLimits[plan];

    // Handler to enforce plan limit
    const enforcePlanLimit = () => {
      if (limit && video.currentTime >= limit * 60) {
        video.currentTime = limit * 60;
        video.pause();
        setShowLimitPopup(true);
      }
    };

    video.addEventListener('timeupdate', enforcePlanLimit);
    video.addEventListener('seeked', enforcePlanLimit);
    video.addEventListener('play', enforcePlanLimit);

    return () => {
      video.removeEventListener('timeupdate', enforcePlanLimit);
      video.removeEventListener('seeked', enforcePlanLimit);
      video.removeEventListener('play', enforcePlanLimit);
    };
  }, [currentuser?.result?.plan, videoRef, vv?.filepath]);

  const skipSeconds = (seconds) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + seconds;
      if (newTime < 0) newTime = 0;
      if (videoRef.current.duration && newTime > videoRef.current.duration) newTime = videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  };

  // Video control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekTime = (clickX / width) * duration;
      videoRef.current.currentTime = seekTime;
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume;
        setIsMuted(false);
      } else {
        videoRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (videoContainerRef.current) {
      if (!isFullscreen) {
        if (videoContainerRef.current.requestFullscreen) {
          videoContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Reset video state when video or vid changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowControls(true);
    setIsMuted(false);
    setVolume(1);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [vid, vv?.filepath]);

  // Only render controls if duration is valid
  const controlsEnabled = duration > 0 && !isNaN(duration);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('play', () => setIsPlaying(true));
      video.addEventListener('pause', () => setIsPlaying(false));
      video.addEventListener('ended', () => setIsPlaying(false));
    }
    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('play', () => setIsPlaying(true));
        video.removeEventListener('pause', () => setIsPlaying(false));
        video.removeEventListener('ended', () => setIsPlaying(false));
        video.pause(); // Pause video on unmount
      }
    };
  }, [vid, vv?.filepath]);

  const navigate = useNavigate();

  // Check if current user is the video owner
  const isVideoOwner = currentuser?.result?._id === vv?.videochanel;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await dispatch(deleteVideo(vv._id));
      navigate('/'); // Redirect to home page after deletion
    } catch (error) {
      alert('Failed to delete video. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!vv) {
    return <div className="container_videoPage">Video not found</div>;
  }

  return (
    <>
      <div className="container_videoPage">
        <div className="container2_videoPage">
          <div className="video_display_screen_videoPage" style={{ position: 'relative' }}>
            <div 
              ref={videoContainerRef}
              className="video-container"
              style={{ position: 'relative', width: '100%' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                if (isPlaying) {
                  setShowControls(false);
                }
              }}
            >
              <video
                ref={videoRef}
                src={getVideoUrl(vv.filepath)}
                className="video_ShowVideo_videoPage"
                preload="metadata"
                crossOrigin="anonymous"
                style={{ width: '100%', maxWidth: '100%' }}
              ></video>

              {/* YouTube-like skip buttons and play/pause overlay */}
              {/* Play/Pause overlay button */}
              <div
                onClick={togglePlay}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: showControls ? 1 : 0,
                  zIndex: 15,
                  pointerEvents: showControls ? 'auto' : 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                  e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
              >
                {isPlaying ? <FaPause size={32} /> : <FaPlay size={32} />}
              </div>

              {/* Skip Back 10s */}
              <button
                onClick={() => skipSeconds(-10)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 'calc(50% - 110px)',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease',
                  display: showControls ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 16
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                  e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
                title="Skip Back 10s"
              >
                <BiSkipPrevious size={32} />
              </button>

              {/* Skip Forward 10s */}
              <button
                onClick={() => skipSeconds(10)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 'calc(50% + 110px)',
                  transform: 'translate(-50%, -50%)',
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                  transition: 'all 0.2s ease',
                  display: showControls ? 'flex' : 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 16
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.9)';
                  e.target.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.target.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
                title="Skip Forward 10s"
              >
                <BiSkipNext size={32} />
              </button>

              {/* Custom video controls */}
              {controlsEnabled && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                    padding: '20px',
                    opacity: showControls ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 10
                  }}
                >
                  {/* Progress bar (draggable) */}
                  <div
                    style={{
                      width: '100%',
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: '2px',
                      cursor: 'pointer',
                      marginBottom: '10px',
                      position: 'relative',
                      userSelect: 'none'
                    }}
                    onMouseDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const width = rect.width;
                      const seek = (clientX) => {
                        const clickX = clientX - rect.left;
                        let seekTime = (clickX / width) * duration;
                        if (seekTime < 0) seekTime = 0;
                        if (seekTime > duration) seekTime = duration;
                        if (videoRef.current) {
                          videoRef.current.currentTime = seekTime;
                        }
                      };
                      seek(e.clientX);
                      const onMove = (moveEvent) => {
                        seek(moveEvent.clientX);
                      };
                      const onUp = () => {
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                      };
                      window.addEventListener('mousemove', onMove);
                      window.addEventListener('mouseup', onUp);
                    }}
                  >
                    <div
                      style={{
                        width: `${(currentTime / duration) * 100}%`,
                        height: '100%',
                        background: '#ff0000',
                        borderRadius: '2px',
                        transition: 'width 0.1s ease'
                      }}
                    />
                    {/* Progress handle */}
                    <div
                      style={{
                        position: 'absolute',
                        left: `calc(${(currentTime / duration) * 100}% - 7px)`,
                        top: '-4px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: '#fff',
                        border: '2px solid #ff0000',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        pointerEvents: 'none',
                        transition: 'left 0.1s ease'
                      }}
                    />
                  </div>

                  {/* Controls row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Play/Pause button */}
                    <button
                      onClick={togglePlay}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        padding: '5px'
                      }}
                    >
                      {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                    </button>

                    {/* Volume control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={toggleMute}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#fff',
                          fontSize: '1rem',
                          cursor: 'pointer',
                          padding: '5px'
                        }}
                      >
                        {isMuted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        style={{
                          width: '60px',
                          height: '4px',
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '2px',
                          outline: 'none'
                        }}
                      />
                    </div>

                    {/* Time display */}
                    <span style={{ color: '#fff', fontSize: '0.9rem', marginLeft: 'auto' }}>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Fullscreen button */}
                    <button
                      onClick={toggleFullscreen}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        padding: '5px'
                      }}
                    >
                      {isFullscreen ? <FaCompress size={16} /> : <FaExpand size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {showLimitPopup && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <h2>Upgrade your plan to continue watching!</h2>
                  <button
                    style={{
                      marginTop: '2rem',
                      padding: '1rem 2rem',
                      fontSize: '1.2rem',
                      background: 'linear-gradient(135deg, #00b09b, #96c93d)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate('/upgrade', { state: { from: `/videopage/${vid}` } })}
                  >
                    Upgrade Plan
                  </button>
                  <button
                    style={{
                      marginTop: '1rem',
                      padding: '0.8rem 2rem',
                      fontSize: '1.1rem',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      border: '1px solid #fff',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setShowLimitPopup(false);
                      if (videoRef.current) {
                        const plan = (currentuser?.result?.plan || 'free').toLowerCase();
                        const limit = planLimits[plan];
                        if (limit && videoRef.current.currentTime >= limit * 60) {
                          videoRef.current.currentTime = limit * 60 - 0.1;
                        }
                        videoRef.current.pause();
                      }
                    }}
                  >
                    No Thanks
                  </button>
                </div>
              )}
            </div>

            <div className="video_details_videoPage">
              <div className="video_btns_title_VideoPage_cont">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <p className="video_title_VideoPage">{vv?.videotitle}</p>
                  {isVideoOwner && (
                    <button
                      onClick={handleDeleteClick}
                      title="Delete video"
                      style={{
                        background: 'rgba(255, 0, 0, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(255, 0, 0, 1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(255, 0, 0, 0.8)';
                      }}
                    >
                      <FaTrash size={14} />
                      Delete
                    </button>
                  )}
                </div>
                <div className="views_date_btns_VideoPage">
                  <div className="views_videoPage">
                    {vv?.views} views <div className="dot"></div>{" "}
                    {moment(vv?.createdat).fromNow()}
                  </div>
                  <Likewatchlatersavebtns vv={vv} vid={vid} />
                </div>
              </div>
              <Link to={"/"} className="chanel_details_videoPage">
                <b className="chanel_logo_videoPage">
                  <p>{vv?.uploader.charAt(0).toUpperCase()}</p>
                </b>
                <p className="chanel_name_videoPage">{vv.uploader}</p>
              </Link>
              <div className="comments_VideoPage">
                <h2>
                  <u>Comments</u>
                </h2>
                <Comment videoid={vv._id} />
              </div>
            </div>
          </div>
          <div className="moreVideoBar">More videos</div>
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
            <p>Are you sure you want to delete "{vv?.videotitle}"?</p>
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

export default Videopage;
