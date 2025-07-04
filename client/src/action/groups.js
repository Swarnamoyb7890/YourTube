import * as api from '../Api'; // Make sure this import is at the top

// Action creators for group management
export const setGroups = (groups) => ({
    type: 'SET_GROUPS',
    payload: groups
});

export const addGroup = (group) => ({
    type: 'ADD_GROUP',
    payload: group
});

export const updateGroup = (group) => ({
    type: 'UPDATE_GROUP',
    payload: group
});

// Helper to get groups from localStorage
const getGroupsFromLocalStorage = () => {
    const groups = localStorage.getItem('mockGroups');
    return groups ? JSON.parse(groups) : [];
};

// Helper to save groups to localStorage
const saveGroupsToLocalStorage = (groups) => {
    localStorage.setItem('mockGroups', JSON.stringify(groups));
};

// Thunk action to fetch all groups from localStorage
export const getGroups = () => async (dispatch) => {
    try {
        const { data } = await api.getGroups();
        dispatch({ type: 'FETCH_GROUPS', payload: data });
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
};

// Thunk action to create a new group in localStorage
export const createGroup = (groupData) => async (dispatch) => {
    try {
        const { data } = await api.createGroup(groupData);
        dispatch({ type: 'ADD_GROUP', payload: data });
        dispatch(getGroups()); // Optionally re-fetch all groups
        return data;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

// Thunk action to update a group in localStorage
export const updateGroupData = (groupData) => (dispatch, getState) => {
    try {
        const groups = getGroupsFromLocalStorage();
        const updatedGroups = groups.map(group =>
            group._id === groupData._id ? groupData : group
        );
        saveGroupsToLocalStorage(updatedGroups);
        dispatch(updateGroup(groupData));
        return groupData;
    } catch (error) {
        console.error('Error updating group in localStorage:', error);
        throw error;
    }
};

// Thunk action to delete a group from localStorage
export const deleteGroup = (id) => (dispatch) => {
    try {
        const groups = getGroupsFromLocalStorage();
        const updatedGroups = groups.filter(group => group._id !== id);
        saveGroupsToLocalStorage(updatedGroups);
        dispatch({ type: 'DELETE_GROUP', payload: id });
        dispatch(getGroups()); // Re-fetch all groups to update the state
    } catch (error) {
        console.error('Error deleting group from localStorage:', error);
        throw error;
    }
};

// Helper to get messages from localStorage
const getMessagesFromLocalStorage = (groupId) => {
    const groupMessages = JSON.parse(localStorage.getItem(`messages_${groupId}`) || '[]');
    return groupMessages;
};

// Helper to save messages to localStorage
const saveMessagesToLocalStorage = (groupId, messages) => {
    localStorage.setItem(`messages_${groupId}`, JSON.stringify(messages));
};

// Thunk action to fetch messages for a group
export const getMessages = (groupId) => async (dispatch) => {
    try {
        const messages = getMessagesFromLocalStorage(groupId);
        dispatch({ type: 'FETCH_MESSAGES', payload: messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

// Thunk action to send a message to a group
export const sendMessage = (groupId, message) => async (dispatch) => {
    try {
        const messages = getMessagesFromLocalStorage(groupId);
        const newMessage = {
            id: Date.now(),
            text: message,
            timestamp: new Date().toISOString()
        };
        const updatedMessages = [...messages, newMessage];
        saveMessagesToLocalStorage(groupId, updatedMessages);
        dispatch(getMessages(groupId));
        return newMessage;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}; 