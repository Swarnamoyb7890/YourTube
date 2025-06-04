import * as api from "../Api";

export const uploadvideo = (videodata) => async (dispatch) => {
    try {
        const { filedata, fileoption } = videodata;

        // Log the FormData contents
        console.log('Starting video upload...');
        for (let pair of filedata.entries()) {
            console.log('FormData field:', pair[0], 'Value:', pair[1]);
        }
        console.log('Upload options:', fileoption);

        const { data } = await api.uploadvideo(filedata, fileoption);
        console.log('Upload response:', data);

        dispatch({ type: 'POST_VIDEO', data });
        dispatch(getallvideo());
        return data; // Return the response data
    } catch (error) {
        console.error('Full upload error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });

        // Throw a more informative error
        if (error.response?.data?.message) {
            throw new Error(`Server error: ${error.response.data.message}`);
        } else if (error.response?.status === 413) {
            throw new Error('File is too large. Please try a smaller video file.');
        } else if (error.response?.status === 400) {
            throw new Error('Invalid request. Please check file format and try again.');
        } else if (error.response?.status === 401) {
            throw new Error('Please login again to upload videos.');
        } else {
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
}

export const getallvideo = () => async (dispatch) => {
    try {
        const { data } = await api.getvideos()
        dispatch({ type: 'FETCH_ALL_VIDEOS', payload: data })
    } catch (error) {
        console.log(error)
    }
}

export const likevideo = (likedata) => async (dispatch) => {
    try {
        const { id, Like } = likedata;
        console.log(likedata)
        const { data } = await api.likevideo(id, Like);
        dispatch({ type: "POST_LIKE", payload: data })
        dispatch(getallvideo())
    } catch (error) {
        console.log(error)
    }
}

export const viewvideo = (viewdata) => async (dispatch) => {
    try {
        const { id } = viewdata;
        console.log(id)
        const { data } = await api.viewsvideo(id)
        dispatch({ type: "POST_VIEWS", data })
        dispatch(getallvideo())
    } catch (error) {
        console.log(error)
    }
}