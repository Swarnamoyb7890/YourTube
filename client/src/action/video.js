import * as api from "../Api";

export const uploadvideo = (videodata) => async (dispatch) => {
    try {
        const { filedata, fileoption } = videodata;
        // Log the FormData contents
        for (let pair of filedata.entries()) {
            console.log('FormData content:', pair[0], pair[1]);
        }
        console.log('File options:', fileoption);

        const { data } = await api.uploadvideo(filedata, fileoption);
        dispatch({ type: 'POST_VIDEO', data });
        dispatch(getallvideo());
    } catch (error) {
        console.error('Upload error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        throw new Error(error.response?.data?.message || 'Error uploading video');
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