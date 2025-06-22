import * as api from '../Api';

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

// Thunk action to fetch all groups from the server
export const getGroups = () => async (dispatch) => {
    try {
        const { data } = await api.getGroups();
        dispatch({ type: 'FETCH_GROUPS', payload: data });
    } catch (error) {
        console.error('Error fetching groups:', error);
    }
};

// Thunk action to create a new group on the server
export const createGroup = (groupData) => async (dispatch) => {
    try {
        const { data } = await api.createGroup(groupData);
        dispatch({ type: 'ADD_GROUP', payload: data });
        dispatch(getGroups()); // Re-fetch all groups to update the state
        return data;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

// Thunk action to update a group on the server
export const updateGroupData = (groupData) => (dispatch, getState) => {
    try {
        const groups = getState().groups.data.map(group =>
            group._id === groupData._id ? groupData : group
        );
        localStorage.setItem('mockGroups', JSON.stringify(groups));
        dispatch(updateGroup(groupData));
        return groupData;
    } catch (error) {
        console.error('Error updating group:', error);
        throw error;
    }
};

// Thunk action to delete a group from the server
export const deleteGroup = (id) => async (dispatch) => {
    try {
        await api.deleteGroup(id);
        dispatch({ type: 'DELETE_GROUP', payload: id });
        dispatch(getGroups()); // Re-fetch all groups to update the state
    } catch (error) {
        console.error('Error deleting group:', error);
        throw error;
    }
}; 