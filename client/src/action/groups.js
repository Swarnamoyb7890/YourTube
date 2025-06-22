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

// Thunk action to load groups from localStorage
export const loadGroups = () => (dispatch) => {
    try {
        const groups = JSON.parse(localStorage.getItem('mockGroups') || '[]');
        dispatch(setGroups(groups));
    } catch (error) {
        console.error('Error loading groups:', error);
        dispatch(setGroups([]));
    }
};

// Thunk action to create a new group
export const createGroup = (groupData) => (dispatch, getState) => {
    try {
        const groups = getState().groups.data;
        const newGroups = [...groups, groupData];
        localStorage.setItem('mockGroups', JSON.stringify(newGroups));
        dispatch(addGroup(groupData));
        return groupData;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

// Thunk action to update a group
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