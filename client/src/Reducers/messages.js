const initialState = {
    data: [],
    loading: false,
    error: null
};

const messages = (state = initialState, action) => {
    switch (action.type) {
        case 'FETCH_MESSAGES':
            return { ...state, data: action.payload, loading: false, error: null };
        case 'SEND_MESSAGE':
            return { ...state, data: [...state.data, action.payload] };
        case 'EDIT_MESSAGE':
            return {
                ...state,
                data: state.data.map(msg =>
                    msg._id === action.payload._id ? action.payload : msg
                )
            };
        case 'DELETE_MESSAGE':
            return {
                ...state,
                data: state.data.filter(msg => msg._id !== action.payload)
            };
        default:
            return state;
    }
};

export default messages; 