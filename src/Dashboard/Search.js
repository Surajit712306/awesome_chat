import React, { useState, useEffect } from 'react';
import './Search.css';
import {NavLink} from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { db } from '../firebase';
import {useSelector} from 'react-redux';
import Error from '../components/Error';
import Loading from '../components/Loading';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const SearchedUser = React.memo(({user, searchAction, groupUsers, group}) => {
    const [value, setValue] = useState(() => {
        if(groupUsers)
        {
            return  groupUsers.findIndex(groupUser => groupUser.uid === user.uid) >= 0;
        }
        else 
        {
            return false;
        }
    });

    const handleChange = () => {
        setValue(prevValue => !prevValue);
    }

    useEffect(() => {
        if(group)
        {
            const setGroupUsers = searchAction;
            if(value)
            {
                setGroupUsers(prevGroupUsers => {
                    if(prevGroupUsers.findIndex(prevGroupUser => prevGroupUser.uid === user.uid) < 0)
                    {
                        return [...prevGroupUsers, user];
                    }
                    else 
                    {
                        return prevGroupUsers;
                    }
                });
            }
            else 
            {
                setGroupUsers(prevGroupUsers => prevGroupUsers.filter(prevGroupUser => prevGroupUser.uid !== user.uid));
            }
        }
    }, [value, group]);

    const handleClick = e => {
        if(group)
        {
            handleChange();
        }
        else 
        {
            searchAction(user);
        }
    }



    if(group)
    {
        return (
            <div className="searched-user" onClick={handleClick}>
                {group && <input type="checkbox" checked={value} onChange={handleChange} onClick={handleChange} className="search-user__checkbox" />}
                {user.photoURL ? 
                    <img src={user.photoURL} alt="Photo" title="Photo" className="searched-user__photo" />
                    :
                    <div className="searched-user__photo">
                        <AccountCircleIcon />
                    </div>    
                }
                <div className="searched-user__display-name">
                    {user.displayName}
                </div>
            </div>
        );
    }

    return (
        <div className="searched-user" onClick={handleClick}>
            {user.photoURL ? 
                <img src={user.photoURL} alt="Photo" title="Photo" className="searched-user__photo" />
                :
                <div className="searched-user__photo">
                    <AccountCircleIcon />
                </div>    
            }
            <div className="searched-user__display-name">
                {user.displayName}
            </div>
        </div>
    );
});

function Search({searchAction, groupUsers, group}) {

    const [searchInput, setSearchInput] = useState('');
    const user = useSelector(state => state.auth.user);
    const [users, setUsers] = useState([]);
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const filterUsers = (users, value) => {
        const valueChSet = new Set(value.toString().toLowerCase().split(''));
        const storeSearchedUsers = users.filter(userElem => {
            const userElemDisplayNameChSet = new Set(userElem.displayName.toString().toLowerCase().split(''));
            const intersection = [...valueChSet].filter(ch => userElemDisplayNameChSet.has(ch));

            return  userElem.uid !== user.uid && intersection.length === [...valueChSet].length;      
        }); 
        setSearchedUsers(storeSearchedUsers);
    }

    const handleChange = async e => {
        let value = e.target.value;
        if(value === ' ')
        {
            return;
        }

        if(value === '')
        {
            setSearchInput(value);
            setSearchedUsers([]);
            return;
        }

        setError(null);
        setLoading(true);
        try 
        {
            if(users.length === 0)
            {
                const storeUsers = [];
                const querySnapshot = await db.collection('users').get();
                querySnapshot.docs.forEach(doc => {
                    storeUsers.push({
                        uid: doc.id,
                        ...doc.data()
                    });
                });
                setUsers(storeUsers);
                filterUsers(storeUsers, value);
            }
            else 
            {
                filterUsers(users, value);
            }
        }
        catch(err)
        {
            setError(err.message);
        }
        finally
        {
            setLoading(false);
        }
        setSearchInput(value);
    }

    return (
        <div className="search">
            <div className="search-header">
                <NavLink to="/" className="search-navbar__link">
                    <ArrowBackIcon />
                </NavLink>
                <div className="search-input-group">
                    <input type="search" value={searchInput} onChange={handleChange} className="search-input" name="searchInput" id="searchInput" placeholder="Search user by name to add in chat" autoComplete="off" autoFocus />
                    {error && <Error error={error} />}
                </div>
            </div>
            {loading && <Loading />}
            <div className="search-result">
                {searchedUsers.map((searchedUser, index) => {
                        if(group)
                        {
                           return <SearchedUser key={index} user={searchedUser} searchAction={searchAction} groupUsers={groupUsers} group />
                        }
                        else 
                        {
                           return  <SearchedUser key={index} user={searchedUser} searchAction={searchAction} />
                        }
     
                    })}
            </div>
        </div>
    );
}

export default Search;
