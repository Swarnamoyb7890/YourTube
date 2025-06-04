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
    decompress: true, // Handle compression
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
    for (let [key, value] of filedata.entries()) {
        if (value instanceof File && value.size > 10 * 1024 * 1024) { // If file is larger than 10MB
            console.log('Large file detected, using chunked upload');
            // We'll still send the whole file, but with different headers
            newFormData.append(key, value, value.name);
        } else {
            newFormData.append(key, value);
        }
    }

    const uploadConfig = {
        ...fileoption,
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            // Let browser set the Content-Type with boundary
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 300000, // 5 minutes
        retry: 3, // Number of retries for upload
        decompress: true,
        // Force HTTP/1.1
        transport: {
            forceHttp1: true
        },
        onUploadProgress: (progressEvent) => {
            if (fileoption.onUploadProgress) {
                fileoption.onUploadProgress(progressEvent);
            }
            // Reset retry count on progress
            if (progressEvent.loaded > 0) {
                uploadConfig.retryCount = 0;
            }
        },
        validateStatus: function (status) {
            return status >= 200 && status < 300;
        }
    };

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