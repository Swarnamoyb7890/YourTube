import * as api from '../Api';

export const fetchMessages = (groupId) => async (dispatch) => {
    try {
        const { data } = await api.getMessages(groupId);
        dispatch({ type: 'FETCH_MESSAGES', payload: data });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

export const sendMessage = (messageData) => async (dispatch) => {
    try {
        const { data } = await api.postMessage(messageData);
        dispatch({ type: 'SEND_MESSAGE', payload: data });
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

export const editMessage = (id, content) => async (dispatch) => {
    try {
        const { data } = await api.editMessage(id, content);
        dispatch({ type: 'EDIT_MESSAGE', payload: data });
    } catch (error) {
        console.error('Error editing message:', error);
    }
};

export const deleteMessage = (id) => async (dispatch) => {
    try {
        await api.deleteMessage(id);
        dispatch({ type: 'DELETE_MESSAGE', payload: id });
    } catch (error) {
        console.error('Error deleting message:', error);
    }
}; 