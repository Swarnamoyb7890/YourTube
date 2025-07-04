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
import OtpModal from './OtpModal';
import { sendLoginOtp, sendSmsOtpByEmail } from '../../Api';
import { useTheme } from '../../ThemeContext';
import MobileOtpModal from './MobileOtpModal';

const southernStates = [
  'tamil nadu', 'kerala', 'karnataka', 'andhra pradesh', 'telangana'
];

const Navbar = ({ toggledrawer, seteditcreatechanelbtn }) => {
  const [authbtn, setauthbtn] = useState(false);
  const [user, setuser] = useState(null);
  const [profile, setprofile] = useState({});
  const [shownotification, setshownotification] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [pendingProfile, setPendingProfile] = useState(null);
  const { setTheme } = useTheme();
  const [showMobileOtpModal, setShowMobileOtpModal] = useState(false);
  const [mobileOtpSuccess, setMobileOtpSuccess] = useState(false);

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
        .then(async (res) => {
          setprofile(res.data);
          setPendingProfile(res.data);

          // Fetch user location
          try {
            const geoRes = await fetch('https://ipapi.co/json/');
            const geoData = await geoRes.json();
            const userState = (geoData.region || '').toLowerCase();

            if (southernStates.includes(userState)) {
              // Southern: Email OTP
              setOtpEmail(res.data.email);
              await sendLoginOtp(res.data.email);
              setShowOtpModal(true);
            } else {
              // Non-southern: always show mobile OTP modal (prompt for mobile)
              setShowMobileOtpModal(true);
            }
          } catch (err) {
            // Fallback: default to email OTP
            setOtpEmail(res.data.email);
            await sendLoginOtp(res.data.email);
            setShowOtpModal(true);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [user]);

  const handleOtpSuccess = async (verifiedUser) => {
    setShowOtpModal(false);
    setPendingProfile(null);
    setOtpEmail('');
    // Detect location and set theme
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      const userState = (geoData.region || '').toLowerCase();
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 10 && hour < 12 && southernStates.includes(userState)) {
        setTheme('white');
      } else {
        setTheme('dark');
      }
      // OTP channel logic
      if (southernStates.includes(userState)) {
        // Already verified via email OTP
        if (verifiedUser && verifiedUser.email) {
          setprofile(verifiedUser);
          dispatch(login({ email: verifiedUser.email }));
        } else if (pendingProfile && pendingProfile.email) {
          setprofile(pendingProfile);
          dispatch(login({ email: pendingProfile.email }));
        }
      } else {
        // Show mobile OTP modal for non-southern states
        setShowMobileOtpModal(true);
      }
    } catch (err) {
      setTheme('dark'); // fallback
    }
  };

  const handleMobileOtpSuccess = (mobile) => {
    setShowMobileOtpModal(false);
    setMobileOtpSuccess(true);
    // Complete login after SMS OTP
    if (pendingProfile && pendingProfile.email) {
      setprofile(pendingProfile);
      dispatch(login({ email: pendingProfile.email }));
    }
  };

  const logout = () => {
    dispatch(setcurrentuser(null));
    googleLogout();
    localStorage.clear();
  };

  useEffect(() => {
    const token = currentuser?.token;
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Check if token will expire in the next minute
        if (decodedToken.exp * 1000 < new Date().getTime() + 60000) {
          console.log('Token expired or about to expire, logging out...');
          logout();
          return;
        }
      } catch (error) {
        console.error('Token decode error:', error);
        logout();
        return;
      }
    }
    // Only update currentuser from localStorage if we don't already have one
    if (!currentuser) {
      const storedProfile = localStorage.getItem('Profile');
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          dispatch(setcurrentuser(parsedProfile));
        } catch (error) {
          console.error('Error parsing stored profile:', error);
          localStorage.clear();
        }
      }
    }
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

      <OtpModal
        open={showOtpModal}
        email={otpEmail}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpSuccess}
      />
      <MobileOtpModal
        open={showMobileOtpModal}
        onClose={() => setShowMobileOtpModal(false)}
        onSuccess={handleMobileOtpSuccess}
        registeredMobile={null}
        sendSmsOtpByEmail={sendSmsOtpByEmail}
        email={profile.email}
      />
    </>
  );
};

export default Navbar;
