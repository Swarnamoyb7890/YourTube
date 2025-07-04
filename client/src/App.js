import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from "react"
import Navbar from './Component/Navbar/Navbar';
import { useDispatch } from 'react-redux';
import Allroutes from "../src/Allroutes"
import { BrowserRouter as Router } from 'react-router-dom';
import Drawersliderbar from '../src/Component/Leftsidebar/Drawersliderbar'
import Createeditchannel from './Pages/Channel/Createeditchannel';
import Videoupload from './Pages/Videoupload/Videoupload';
import { fetchallchannel } from './action/channeluser';
import { getallvideo } from './action/video';
import { getallcomment } from './action/comment';
import { getallhistory } from './action/history';
import { getalllikedvideo } from './action/likedvideo';
import { getallwatchlater } from './action/watchlater';
import { getGroups } from './action/groups';
import { useTheme } from './ThemeContext';

function App() {
  const { theme } = useTheme();
  const [toggledrawersidebar, settogledrawersidebar] = useState({
    display: "none"
  });
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchallchannel())
    dispatch(getallvideo())
    dispatch(getallcomment())
    dispatch(getallhistory())
    dispatch(getGroups())
    dispatch(getalllikedvideo())
    dispatch(getallwatchlater())
    dispatch(getGroups())
  }, [dispatch])

  const toggledrawer = () => {
    if (toggledrawersidebar.display === "none") {
      settogledrawersidebar({
        display: "flex",
      });
    } else {
      settogledrawersidebar({
        display: "none",
      });
    }
  }
  const [editcreatechanelbtn, seteditcreatechanelbtn] = useState(false);
  const [videouploadpage, setvideouploadpage] = useState(false);
  return (
    <div className={theme === 'white' ? 'theme-white' : 'theme-dark'}>
      <Router>
        {
          videouploadpage && <Videoupload setvideouploadpage={setvideouploadpage} />
        }
        {editcreatechanelbtn && (
          <Createeditchannel seteditcreatechanelbtn={seteditcreatechanelbtn} />
        )}
        <Navbar seteditcreatechanelbtn={seteditcreatechanelbtn} toggledrawer={toggledrawer} />
        <Drawersliderbar toggledraw={toggledrawer} toggledrawersidebar={toggledrawersidebar} />
        <Allroutes seteditcreatechanelbtn={seteditcreatechanelbtn} setvideouploadpage={setvideouploadpage} />
      </Router>
    </div>
  );
}

export default App;
