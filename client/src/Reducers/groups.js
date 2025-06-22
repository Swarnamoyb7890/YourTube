const groupsReducer = (state = { data: null }, action) => {
    switch (action.type) {
        case 'FETCH_GROUPS':
            return { ...state, data: action.payload };
        case 'ADD_GROUP':
            return { ...state, data: state.data ? [...state.data, action.payload] : [action.payload] };
        case 'UPDATE_GROUP':
            return {
                ...state,
                data: state.data.map(group =>
                    group._id === action.payload._id ? action.payload : group
                )
            };
        case 'DELETE_GROUP':
            return { ...state, data: state.data.filter(group => group._id !== action.payload) };
        default:
            return state;
    }
};

export default groupsReducer;