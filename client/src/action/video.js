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

        // Check server connectivity
        try {
            console.log('Testing server connection...');
            await api.getvideos();
            console.log('Server connection successful');
        } catch (error) {
            console.error('Server connection test failed:', error);
            if (error.message.includes('Network Error')) {
                throw new Error('Cannot connect to server. Please check your internet connection and try again.');
            } else {
                throw new Error('Server is currently unavailable. Please try again later.');
            }
        }

        // Attempt upload with retry logic
        let retryCount = 0;
        const maxRetries = 3;
        let lastError = null;

        while (retryCount < maxRetries) {
            try {
                console.log(`Upload attempt ${retryCount + 1}/${maxRetries}`);
                const { data } = await api.uploadvideo(filedata, fileoption);
                console.log('Upload successful:', data);

                dispatch({ type: 'POST_VIDEO', payload: data });
                dispatch(getallvideo());
                return data;
            } catch (error) {
                lastError = error;
                retryCount++;

                if (error.response?.status === 413) {
                    throw new Error('File is too large. Please try a smaller video file.');
                }

                // Check if we have a detailed error message from the server
                const errorMessage = error.response?.data?.message || error.message;

                if (errorMessage.includes('Missing required fields')) {
                    throw new Error('Please fill in all required fields.');
                }

                if (retryCount < maxRetries && !errorMessage.includes('Only MP4')) {
                    console.log(`Upload failed, retrying... (${retryCount}/${maxRetries}`);
                    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * (2 ** retryCount), 10000)));
                } else {
                    throw new Error(errorMessage || 'Error uploading video. Please try again.');
                }
            }
        }

        throw new Error(`Upload failed after ${maxRetries} attempts. Please try again later.`);
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
};

export const getallvideo = () => async (dispatch) => {
    try {
        const { data } = await api.getvideos();
        dispatch({ type: 'FETCH_ALL_VIDEOS', payload: data });
    } catch (error) {
        console.error('Error fetching videos:', error);
    }
};

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