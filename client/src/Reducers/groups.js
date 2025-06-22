const groupsReducer = (state = { data: [] }, action) => {
    switch (action.type) {
        case 'SET_GROUPS':
            return { ...state, data: action.payload };
        case 'ADD_GROUP':
            return { ...state, data: [...state.data, action.payload] };
        case 'UPDATE_GROUP':
            return {
                ...state,
                data: state.data.map(group =>
                    group._id === action.payload._id ? action.payload : group
                )
            };
        default:
            return state;
    }
};

export default groupsReducer;