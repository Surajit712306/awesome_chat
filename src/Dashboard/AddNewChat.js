import React, {useCallback, useState} from 'react';
import './AddNewChat.css';
import Search from './Search';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { db } from '../firebase';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import firebase from 'firebase/app';

function AddNewChat() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useSelector(state => state.auth.user);
    const history = useHistory();

    const getUser = useCallback(async otherUser => {

        setLoading(true);
        try 
        {
                let querySnapshot = await db.collection('rooms').get();
                if(querySnapshot.docs.length === 0)
                {
                    const roomRef = await db.collection('rooms').add({
                        users: [user.uid, otherUser.uid],
                        initiators: [user.uid],
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    history.push(`/rooms/${roomRef.id}`)
                }
                else 
                {
                    const doc = querySnapshot.docs.find(doc => {
                        const room = {
                            id: doc.id,
                            ...doc.data()
                        };
                        if(!room.group)
                        {
                            const userSet = new Set(room.users);
                            if(userSet.has(user.uid) && userSet.has(otherUser.uid))
                            {
                                return true;
                            }
                        }
                        return false;
                    });

                    if(doc)
                    {
                        const room = {
                            id: doc.id,
                            ...doc.data()
                        };
                        querySnapshot = await db.collection('rooms').doc(room.id).collection('messages').get();
                        if(querySnapshot.docs.length === 0)
                        {
                            if(!room.initiators.includes(user.uid))
                            {
                                await db.collection('rooms').doc(room.id).update({
                                    initiators: [...room.initiators, user.uid]
                                });
                            }
                        }

                        history.push(`/rooms/${room.id}`)
                    }
                    else 
                    {
                        const roomRef = await db.collection('rooms').add({
                            users: [user.uid, otherUser.uid],
                            initiators: [user.uid],
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        history.push(`/rooms/${roomRef.id}`)
                    }
                }
        }
        catch(err)
        {
            setError(err.message);
        }
    }, []);

    return (
        <div className="add-new-chat">
            <div className="add-new-chat__header">
               <h4 className="add-new-chat__heading">Add a new chat</h4>
               <div className="add-new-chat__loading">
                    {loading && <Loading />}
               </div>
            </div>
            {error && <Error error={error} />}
            <Search searchAction={getUser}  /> 
        </div>
    );
}

export default AddNewChat;
