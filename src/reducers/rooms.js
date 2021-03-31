import roomsInitialState from '../initial_states/rooms';
import roomsActionTypes from '../action_types/rooms';

function reducer(state=roomsInitialState, action)
{
    switch(action.type)
    {
        case roomsActionTypes.setInitialState:
            return roomsInitialState;
        case roomsActionTypes.setRooms:
            return ({
                ...state,
                data: action.payload
            });
        default:
            return state;
    }
}

export default reducer;