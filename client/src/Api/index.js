import axios from "axios"

// Create axios retry interceptor
const createAxiosRetryInterceptor = (instance, maxRetries = 3) => {
    instance.interceptors.response.use(null, async (error) => {
        const { config } = error;
        if (!config || !config.retry) {
            return Promise.reject(error);
        }
        config.retryCount = config.retryCount || 0;
        if (config.retryCount >= config.retry) {
            return Promise.reject(error);
        }
        config.retryCount += 1;
        console.log(`Retrying request (${config.retryCount}/${config.retry})...`);
        // Delay before retrying (exponential backoff)
        const delay = Math.min(1000 * (2 ** config.retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return instance(config);
    });
};

// Get base URL from environment or default to localhost for development
const getBaseURL = () => {
    return process.env.REACT_APP_API_BASE_URL || 'https://yourtube-atxv.onrender.com';
};

export const API = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 300000, // 5 minutes
    retry: 3, // Number of retries
    retryDelay: 1000, // Initial retry delay in ms
    decompress: true, // Handle compression
    withCredentials: true, // Important for CORS
    // Disable HTTP/2 to avoid protocol errors
    transport: {
        maxRedirects: 5,
        forceHttp1: true
    }
});

// Add retry interceptor
createAxiosRetryInterceptor(API);

API.interceptors.request.use((req) => {
    if (localStorage.getItem("Profile")) {
        req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem("Profile")).token}`;
    }
    // Don't set Content-Type for FormData
    if (req.data instanceof FormData) {
        delete req.headers['Content-Type'];
    }
    return req;
});

// For video upload, we'll use specific config
export const uploadvideo = (filedata, fileoption) => {
    // Create a new FormData with chunks if the file is large
    const newFormData = new FormData();

    // Log what we're about to upload
    console.log('Preparing upload data...');

    for (let [key, value] of filedata.entries()) {
        if (value instanceof File) {
            console.log(`Adding file: ${value.name} (${value.size} bytes, type: ${value.type})`);
            newFormData.append(key, value, value.name);
        } else {
            console.log(`Adding field: ${key} = ${value}`);
            newFormData.append(key, value);
        }
    }

    // Get the auth token
    const token = localStorage.getItem("Profile") ? JSON.parse(localStorage.getItem("Profile")).token : null;

    if (!token) {
        console.error('No authentication token found');
        throw new Error('Please login to upload videos');
    }

    const uploadConfig = {
        ...fileoption,
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': `Bearer ${token}`
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000, // 5 minutes
        retry: 3, // Number of retries for upload
        decompress: true,
        withCredentials: true,
        // Force HTTP/1.1
        transport: {
            forceHttp1: true
        },
        onUploadProgress: (progressEvent) => {
            if (fileoption.onUploadProgress) {
                fileoption.onUploadProgress(progressEvent);
            }
            // Log progress
            if (progressEvent.loaded > 0) {
                console.log(`Upload progress: ${Math.round((progressEvent.loaded * 100) / progressEvent.total)}%`);
            }
        },
        validateStatus: function (status) {
            return status >= 200 && status < 300;
        }
    };

    // Log the request we're about to make
    console.log('Making upload request with config:', {
        url: '/video/uploadvideo',
        headers: {
            ...uploadConfig.headers,
            'Authorization': 'Bearer [HIDDEN]' // Don't log the actual token
        },
        formDataFields: Array.from(newFormData.entries()).map(([key, value]) => ({
            key,
            type: value instanceof File ? 'File' : 'Field',
            value: value instanceof File ? `${value.name} (${value.size} bytes)` : value
        }))
    });

    return API.post("/video/uploadvideo", newFormData, uploadConfig);
};

export const login = (authdata) => API.post("/user/login", authdata);
export const updatechaneldata = (id, updatedata) => API.patch(`/user/update/${id}`, updatedata);
export const fetchallchannel = () => API.get("/user/getallchannel");
export const getvideos = () => API.get("/video/getvideos");
export const likevideo = (id, Like) => API.patch(`/video/like/${id}`, { Like });
export const viewsvideo = (id) => API.patch(`/video/view/${id}`);

export const postcomment = (commentdata) => API.post('/comment/post', commentdata);
export const deletecomment = (id) => API.delete(`/comment/delete/${id}`);
export const editcomment = (id, commentbody) => API.patch(`/comment/edit/${id}`, { commentbody });
export const getallcomment = () => API.get('/comment/get');

export const addtohistory = (historydata) => API.post("/video/history", historydata);
export const getallhistory = () => API.get('/video/getallhistory');
export const deletehistory = (userid) => API.delete(`/video/deletehistory/${userid}`);

export const addtolikevideo = (likedvideodata) => API.post('/video/likevideo', likedvideodata);
export const getalllikedvideo = () => API.get('/video/getalllikevide');
export const deletelikedvideo = (videoid, viewer) => API.delete(`/video/deletelikevideo/${videoid}/${viewer}`);

export const addtowatchlater = (watchlaterdata) => API.post('/video/watchlater', watchlaterdata);
export const getallwatchlater = () => API.get('/video/getallwatchlater');
export const deletewatchlater = (videoid, viewer) => API.delete(`/video/deletewatchlater/${videoid}/${viewer}`);

export const deleteVideo = (id) => API.delete(`/video/${id}`);

// Group Actions
export const createGroup = (groupData) => API.post('/groups', groupData);
export const getGroups = () => API.get('/groups');
export const updateGroup = (id, groupData) => API.patch(`/groups/${id}`, groupData);
export const deleteGroup = (id) => API.delete(`/groups/${id}`);
export const regenerateInviteLink = (groupId, userId) => API.post(`/groups/${groupId}/regenerate-invite`, { userId });

export const postMessage = (messageData) => API.post('/messages', messageData);
export const getMessages = (groupId) => API.get(`/messages/${groupId}`);
export const editMessage = (id, content) => API.put(`/messages/${id}`, { content });
export const deleteMessage = (id) => API.delete(`/messages/${id}`);

export const upgradeUserPlan = (userId, plan) => API.post(`/user/upgrade-plan/${userId}`, { plan });

// Razorpay Payment APIs
export const createRazorpayOrder = (orderData) => API.post('/api/razorpay/order', orderData);
export const verifyPayment = (paymentData) => API.post('/api/razorpay/verify', paymentData);

export const sendLoginOtp = (email) => API.post('/user/send-login-otp', { email });
export const verifyLoginOtp = (email, otp) => API.post('/user/verify-login-otp', { email, otp });

export const sendSmsOtp = (mobile) => API.post('/user/send-sms-otp', { mobile });
export const verifySmsOtp = (mobile, otp) => API.post('/user/verify-sms-otp', { mobile, otp });
export const sendSmsOtpByEmail = (email) => API.post('/user/send-sms-otp-by-email', { email });