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

const API = axios.create({
    baseURL: `https://yourtube-atxv.onrender.com`,
    headers: {
        'Accept': 'application/json',
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 300000, // 5 minutes
    retry: 3, // Number of retries
    retryDelay: 1000, // Initial retry delay in ms
    // Use HTTP/1.1
    httpAgent: new (require('http').Agent)({ keepAlive: true }),
    httpsAgent: new (require('https').Agent)({ keepAlive: true }),
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
    const uploadConfig = {
        ...fileoption,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000, // 5 minutes
        retry: 3, // Number of retries for upload
        onUploadProgress: (progressEvent) => {
            if (fileoption.onUploadProgress) {
                fileoption.onUploadProgress(progressEvent);
            }
            // Reset retry count on progress
            if (progressEvent.loaded > 0) {
                uploadConfig.retryCount = 0;
            }
        },
        // Additional error handling
        validateStatus: function (status) {
            return status >= 200 && status < 300;
        }
    };
    return API.post("/video/uploadvideo", filedata, uploadConfig);
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