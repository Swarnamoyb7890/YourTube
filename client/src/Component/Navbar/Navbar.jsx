import React, { useState, useEffect } from "react";
import logo from "./logo.ico";
import "./Navbar.css";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RiVideoAddLine } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { BiUserCircle } from "react-icons/bi";
import Searchbar from "./Searchbar/Searchbar";
import Auth from "../../Pages/Auth/Auth";
import axios from "axios";
import { login } from "../../action/auth";
import { useGoogleLogin, googleLogout } from "@react-oauth/google";
import { setcurrentuser } from "../../action/currentuser";
import { jwtDecode } from "jwt-decode"; // <-- Import as jwt_decode

const Navbar = ({ toggledrawer, seteditcreatechanelbtn }) => {
  const [authbtn, setauthbtn] = useState(false);
  const [user, setuser] = useState(null);
  const [profile, setprofile] = useState({});
  const [shownotification, setshownotification] = useState(false);

  const dispatch = useDispatch();
  const currentuser = useSelector((state) => state.currentuserreducer);

  const successlogin = () => {
    if (profile.email) {
      dispatch(login({ email: profile.email }));
    }
  };

  const google_login = useGoogleLogin({
    onSuccess: (tokenResponse) => setuser(tokenResponse),
    onError: (error) => console.log("Login Failed", error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setprofile(res.data);
          successlogin();
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const logout = () => {
    dispatch(setcurrentuser(null));
    googleLogout();
    localStorage.clear();
  };

  useEffect(() => {
    const token = currentuser?.token;
    if (token) {
      const decodedToken = jwtDecode(token); // <-- Use jwt_decode here, not jwtDecode
      if (decodedToken.exp * 1000 < new Date().getTime()) {
        logout();
      }
    }
    dispatch(setcurrentuser(JSON.parse(localStorage.getItem("Profile"))));
  }, [currentuser?.token, dispatch]);

  // Upload button handler
  const handleUploadClick = () => {
    seteditcreatechanelbtn(true);
  };

  // Notification toggle handler
  const handleNotificationClick = () => {
    setshownotification(!shownotification);
  };

  return (
    <>
      <div className="Container_Navbar">
        <div className="Burger_Logo_Navbar">
          <div className="burger" onClick={() => toggledrawer()}>
            <p></p>
            <p></p>
            <p></p>
          </div>
          <Link to={"/"} className="logo_div_Navbar">
            <img src={logo} alt="logo" />
            <p className="logo_title_navbar">Your-Tube</p>
          </Link>
        </div>

        <Searchbar />

        <RiVideoAddLine
          size={22}
          className="vid_bell_Navbar"
          onClick={handleUploadClick}
          title="Upload Video"
        />

        <div className="apps_Box">
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
          <p className="appBox"></p>
        </div>

        <IoMdNotificationsOutline
          size={22}
          className="vid_bell_Navbar"
          onClick={handleNotificationClick}
          title="Notifications"
        />

        <div className="Auth_cont_Navbar">
          {currentuser ? (
            <div className="Chanel_logo_App" onClick={() => setauthbtn(true)}>
              <p className="fstChar_logo_App">
                {currentuser?.result.name
                  ? currentuser.result.name.charAt(0).toUpperCase()
                  : currentuser?.result.email.charAt(0).toUpperCase()}
              </p>
            </div>
          ) : (
            <p className="Auth_Btn" onClick={() => google_login()}>
              <BiUserCircle size={22} />
              <b>Sign in</b>
            </p>
          )}
        </div>

        {shownotification && (
          <div className="notification-popup">
            <p>You uploaded a new video</p>
            <p>Someone liked your video</p>
            <p>You have 3 new views</p>
          </div>
        )}
      </div>

      {authbtn && (
        <Auth
          seteditcreatechanelbtn={seteditcreatechanelbtn}
          setauthbtn={setauthbtn}
          user={currentuser}
        />
      )}
    </>
  );
};

export default Navbar;
