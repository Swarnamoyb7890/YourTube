import * as api from "../Api";

export const uploadvideo = (videodata) => async (dispatch) => {
    try {
        const { filedata, fileoption } = videodata;

        console.log('Starting video upload...');
        for (let pair of filedata.entries()) {
            const value = pair[1] instanceof File
                ? `File: ${pair[1].name} (${pair[1].size} bytes)`
                : pair[1];
            console.log('FormData field:', pair[0], 'Value:', value);
        }

        // First, check if we can connect to the server
        try {
            await api.getvideos();
        } catch (error) {
            console.error('Server connection test failed:', error);
            throw new Error('Cannot connect to server. Please try again later.');
        }

        // Now attempt the upload
        console.log('Attempting upload...');
        const { data } = await api.uploadvideo(filedata, fileoption);
        console.log('Upload response:', data);

        dispatch({ type: 'POST_VIDEO', data });
        dispatch(getallvideo());
        return data;
    } catch (error) {
        console.error('Full upload error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });

        // Handle specific error cases
        if (error.message.includes('Network Error')) {
            throw new Error('Network connection error. Please check your internet connection and try again.');
        } else if (error.response?.status === 413) {
            throw new Error('File is too large. Please try a smaller video file.');
        } else if (error.response?.status === 400) {
            throw new Error(error.response.data.message || 'Invalid request. Please check file format and try again.');
        } else if (error.response?.status === 401) {
            throw new Error('Please login again to upload videos.');
        } else {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
}

export const getallvideo = () => async (dispatch) => {
    try {
        const { data } = await api.getvideos();
        dispatch({ type: 'FETCH_ALL_VIDEOS', payload: data });
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
}

export const likevideo = (likedata) => async (dispatch) => {
    try {
        const { id, Like } = likedata;
        const { data } = await api.likevideo(id, Like);
        dispatch({ type: "POST_LIKE", payload: data });
        dispatch(getallvideo());
    } catch (error) {
        console.error('Error liking video:', error);
    }
}

export const viewvideo = (viewdata) => async (dispatch) => {
    try {
        const { id } = viewdata;
        const { data } = await api.viewsvideo(id);
        dispatch({ type: "POST_VIEWS", data });
        dispatch(getallvideo());
    } catch (error) {
        console.error('Error updating views:', error);
    }
}