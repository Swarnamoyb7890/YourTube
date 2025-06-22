import React from 'react'
import Showvideolist from '../Showvideolist/Showvideolist'

const WHLvideolist = ({ page, currentuser, videolist }) => {
    // Early return if no videolist or no data
    if (!videolist?.data || !currentuser) {
        return (
            <div className="whl_list_container">
                <h2 style={{ color: "white" }}>No videos in {page}</h2>
            </div>
        );
    }

    const filteredVideos = videolist.data
        .filter(q => q?.viewer === currentuser)
        .reverse();

    return (
        <div className="whl_list_container">
            {filteredVideos.length > 0 ? (
                filteredVideos.map(m => (
                    <Showvideolist 
                        videoid={m?.videoid} 
                        key={m?._id || m?.videoid} 
                    />
                ))
            ) : (
                <h2 style={{ color: "white" }}>No videos in {page}</h2>
            )}
        </div>
    );
}

export default WHLvideolist