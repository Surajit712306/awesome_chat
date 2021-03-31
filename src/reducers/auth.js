import INITIAL_STATE from '../initial_states/auth';
import actionTypes from '../action_types/auth';

function reducer(state=INITIAL_STATE, action)
{
    switch(action.type)
    {
        case actionTypes.setInitialState:
            return INITIAL_STATE;
        case actionTypes.setUser:
            return ({
                ...state,
                user: {
                    isAuthenticated: true,
                    ...action.payload
                }
            });
        default:
            return state;
    }
}

export default reducer;