import React, { useState} from 'react';
import './AddNewGroup.css';
import Search from './Search';
import Loading from '../components/Loading';
import Error from '../components/Error';
import { db } from '../firebase';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import firebase from 'firebase/app';

function AddNewGroup() {
    const [groupUsers, setGroupUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useSelector(state => state.auth.user);
    const history = useHistory();

    const handleClick = async e => {
        let displayName = window.prompt("Enter group name: ");
        
        if(!displayName)
            return;

        /*  we can get group photoURL also */

        const userIds = groupUsers.map(groupUser => groupUser.uid);
        try 
        {
            setLoading(true);
            const roomRef = await db.collection('rooms').add({
                group: true,
                displayName,
                users: [user.uid, ...userIds],
                admins: [user.uid],
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            history.push(`/rooms/${roomRef.id}`);
        }
        catch(err)
        {
            setError(err.message);
        }
        finally 
        {
            setLoading(false);
        }
    }

    return (
        <div className="add-new-group">
            <div className="add-new-group__header">
               <h4 className="add-new-group__heading">Create a new group</h4>
               {groupUsers.length > 0 && <button className="add-new-group__btn" onClick={handleClick}>Create</button>}
               <div className="add-new-group__loading">
                    {loading && <Loading />}
               </div>
            </div>
            {error && <Error error={error} />}
            <Search searchAction={setGroupUsers} groupUsers={groupUsers} group />
        </div>
    );
}

export default AddNewGroup;
