import React from 'react'
import "./Showvideogrid.css"
import Showvideo from '../Showvideo/Showvideo'
const Showvideogrid = ({vid, showDeleteButton = false}) => {
  return (
    <div className="Container_ShowVideoGrid">
        {
            vid?.reverse().map(vi=>{
                return(
                    <div  key={vi._id} className="video_box_app">
                        <Showvideo vid={vi} showDeleteButton={showDeleteButton}/>
                    </div>
                )
            })
        }
    </div>
  )
}

export default Showvideogrid


