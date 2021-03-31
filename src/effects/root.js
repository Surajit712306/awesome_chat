import { all, fork } from 'redux-saga/effects';
import * as roomSagas from './room'; 


export default function* rootSaga()
{
    yield all([
        ...Object.values(roomSagas)
    ].map(fork));
}