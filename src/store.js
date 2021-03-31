import {applyMiddleware, createStore} from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer from './reducers/root';
import rootSaga from './effects/root';
import authInitailState from './initial_states/auth';

const INITIAL_STATE = {
    auth: authInitailState
};

const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer, INITIAL_STATE, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(rootSaga);

export default store;