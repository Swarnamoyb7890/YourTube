import React from 'react'
import "./Leftsidebar.css"
import "./Drawersliderbar.css"
import { AiFillPlaySquare, AiOutlineHome, AiFillLike, AiOutlinePlus } from 'react-icons/ai'
import { MdOutlineExplore, MdOutlineVideoLibrary, MdSubscriptions, MdOutlineWatchLater, MdGroups } from "react-icons/md"
import { FaHistory } from 'react-icons/fa'
import shorts from "./shorts.png"
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { IoPeopleOutline } from "react-icons/io5"

const Drawersliderbar = ({ toggledraw, toggledrawersidebar }) => {
  const groups = useSelector(state => state.groups.data);
  const currentUser = useSelector(state => state.currentuserreducer);

  // Correctly filter groups where the current user is a member
  const userGroups = groups?.filter(group => 
    group.members.some(member => member._id === currentUser?.result?._id)
  );

  return (
    <div className="container_DrawaerLeftSidebar" style={toggledrawersidebar}>
      <div className="container2_DrawaerLeftSidebar">
        <div className="Drawer_leftsidebar">
          <NavLink to={'/'} className="icon_sidebar_div">
            <div className="icon_wrapper">
              <AiOutlineHome size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Home</div>
            </div>
          </NavLink>
          <div className="icon_sidebar_div">
            <div className="icon_wrapper">
              <MdOutlineExplore size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Explore</div>
            </div>
          </div>
          <div className="icon_sidebar_div">
            <div className="icon_wrapper">
              <img src={shorts} width={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Shorts</div>
            </div>
          </div>

          <div className="icon_sidebar_div">
            <div className="icon_wrapper">
              <MdSubscriptions size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Subscriptions</div>
            </div>
          </div>
        </div>
        <div className="libraryBtn_Drawerleftsidebar">
          <NavLink to={'/Library'} className="icon_sidebar_div">
            <div className="icon_wrapper">
              <MdOutlineVideoLibrary size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Library</div>
            </div>
          </NavLink>
          <NavLink to={'/Watchhistory'} className="icon_sidebar_div">
            <div className="icon_wrapper">
              <FaHistory size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">History</div>
            </div>
          </NavLink>
          <NavLink to={'/Yourvideo'} className="icon_sidebar_div">
            <div className="icon_wrapper">
              <AiFillPlaySquare size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Your Videos</div>
            </div>
          </NavLink>
          <NavLink to={'/Watchlater'} className="icon_sidebar_div">
            <div className="icon_wrapper">
              <MdOutlineWatchLater
                size={22}
                className={"icon_sidebar"}
                style={{ margin: "auto 0.7rem" }}
              />
              <div className="text_sidebar_icon">Watch Later</div>
            </div>
          </NavLink>
          <NavLink to={'/Likedvideo'} className="icon_sidebar_div">
            <div className="icon_wrapper">
              <AiFillLike size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
              <div className="text_sidebar_icon">Liked Videos</div>
            </div>
          </NavLink>
          <div className="section_divider"></div>
          <div className="groups_sidebar_section">
            <h3 className="groups_sidebar_title">Groups</h3>
            {currentUser && (
              <>
                <NavLink to={'/group/create'} className="icon_sidebar_div create_group_btn">
                  <div className="icon_wrapper">
                    <AiOutlinePlus size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
                    <div className="text_sidebar_icon">Create Group</div>
                  </div>
                </NavLink>
                {userGroups && userGroups.map(group => (
                  <NavLink key={group._id} to={`/group/${group._id}`} className="icon_sidebar_div group_link">
                    <div className="icon_wrapper">
                      <MdGroups size={22} className='icon_sidebar' style={{ margin: "auto 0.7rem" }} />
                      <div className="text_sidebar_icon">{group.name}</div>
                    </div>
                  </NavLink>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="subScriptions_lsdbar">
          <h3>Your Subscription</h3>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
          <div className="chanel_lsdbar">
            <p>C</p>
            <div>Chanel</div>
          </div>
        </div>
      </div>
      <div className="container3_DrawaerLeftSidebar" onClick={() => toggledraw()}></div>
    </div>
  )
}

export default Drawersliderbar