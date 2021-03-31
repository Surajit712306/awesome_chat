import { combineReducers } from 'redux';
import authReducer from '../reducers/auth';
import roomReducer from './rooms';

const rootReducer = combineReducers({
    auth: authReducer,
    rooms: roomReducer
}); 

export default rootReducer;
