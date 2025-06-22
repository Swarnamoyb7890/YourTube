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
        const maxRetries = 3;
        let currentAttempt = 0;

        const attemptUpload = async () => {
            try {
                console.log(`Upload attempt ${currentAttempt + 1}/${maxRetries}`);
                const { data } = await api.uploadvideo(filedata, fileoption);
                console.log('Upload successful:', data);

                // dispatch({ type: 'POST_VIDEO', payload: data });
                dispatch(getallvideo());
                return data;
            } catch (error) {
                // Check for specific error conditions that should not be retried
                if (error.response?.status === 413) {
                    throw new Error('File is too large. Please try a smaller video file.');
                }

                const errorMessage = error.response?.data?.message || error.message;

                if (errorMessage.includes('Missing required fields')) {
                    throw new Error('Please fill in all required fields.');
                }

                if (currentAttempt < maxRetries - 1 && !errorMessage.includes('Only MP4')) {
                    currentAttempt++;
                    console.log(`Upload failed, retrying... (${currentAttempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, Math.min(1000 * (2 ** currentAttempt), 10000)));
                    return attemptUpload();
                }

                throw new Error(errorMessage || 'Error uploading video. Please try again.');
            }
        };

        return await attemptUpload();
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