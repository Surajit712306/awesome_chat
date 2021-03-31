import React, {useState} from 'react';
import './Auth.css';
import {googleAuthProvider, auth} from './firebase';
import { useDispatch } from 'react-redux';
import authActionTypes from './action_types/auth';
import Error from './components/Error';
import Loading from './components/Loading';
import {db} from './firebase';

function Auth() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleLogIn = e => {
        setError(null);
        setLoading(true);
        auth.signInWithPopup(googleAuthProvider).then(userCredential => {
            const user = userCredential.user;

            const docRef = db.collection('users').doc(user.uid);
            docRef.get().then(doc => {

                if(!doc.exists)
                {
                    docRef.set({
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    });
                }
                else 
                {
                    docRef.update({
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    });
                }


                dispatch({
                    type: authActionTypes.setUser,
                    payload: {
                        uid: user.uid, 
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    }
                });        
            }).catch(err => {
                setError(err.message);
            });
            
        }).catch(err => {
           setError(err.message);

        }).finally(() => {
            setLoading(false);
        });
        
    }

    return (
        <div className="auth">
            <div className="sign-in">
                <h3 className="sign-in__brand">Awesome chat</h3>
                <button className="sign-in__btn" onClick={handleLogIn}>Log In</button>
                {loading && <Loading />}
                {error && <Error error={error} />}
            </div> 
        </div>
    );
}

export default Auth;
