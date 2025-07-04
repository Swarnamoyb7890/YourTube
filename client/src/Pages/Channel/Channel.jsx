import React, { useEffect } from 'react'
import Describechannel from './Describechannel'
import Leftsidebar from '../../Component/Leftsidebar/Leftsidebar'
import Showvideogrid from '../../Component/Showvideogrid/Showvideogrid'
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getallvideo } from '../../action/video';
import { fetchallchannel } from '../../action/channeluser';

const Channel = ({seteditcreatechanelbtn,setvideouploadpage}) => {
  const {cid} = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getallvideo());
    dispatch(fetchallchannel());
  }, [dispatch]);

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
          <Showvideogrid vid={vids} showDeleteButton={true}/>
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