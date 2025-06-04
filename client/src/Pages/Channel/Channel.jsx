import React from 'react'
import Describechannel from './Describechannel'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import Showvideogrid from '../../Component/Showvideogrid/Showvideogrid'
import vid from "../../Component/Video/vid.mp4";
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Channel = ({seteditcreatechanelbtn,setvideouploadpage}) => {
  const {cid} = useParams();
  const vids = useSelector(state => state.videoreducer)?.data?.filter(q => q?.videochanel === cid).reverse();
  const currentuser = useSelector(state => state.currentuserreducer);

  return (
    <div className="container_Pages_App">
      <Leftsidebar/>
      <div className="container2_Pages_App">
        <Describechannel 
          cid={cid} 
          setvideouploadpage={setvideouploadpage} 
          seteditcreatechanelbtn={seteditcreatechanelbtn}
        />
        {vids && vids.length > 0 ? (
          <Showvideogrid vids={vids}/>
        ) : (
          <div style={{ color: 'white', textAlign: 'center', marginTop: '2rem' }}>
            {currentuser?.result?._id === cid ? (
              "You haven't uploaded any videos yet. Click the upload button to add your first video!"
            ) : (
              "This channel hasn't uploaded any videos yet."
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Channel