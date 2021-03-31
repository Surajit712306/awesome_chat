import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import {NavLink} from 'react-router-dom';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import {useSelector} from 'react-redux';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '../components/Menu';
import { useHistory } from 'react-router-dom';
import {auth} from '../firebase'
import {useDispatch} from 'react-redux';
import authActionTypes from '../action_types/auth';
import Loading from '../components/Loading';
import Error from '../components/Error';
import {db} from '../firebase';
import roomsActionTypes from '../action_types/rooms';
import GroupIcon from '@material-ui/icons/Group';
import { formatTime } from '../util';

const closeSidebar = () => {
    const sidebarElem = document.querySelector('.sidebar');
    if(sidebarElem)
    {
        sidebarElem.classList.remove('active');
    }
}

const Room = ({room}) => {

    const handleClick = e => {
        closeSidebar();
    }

    return (
        <NavLink to={`/rooms/${room.id}`} onClick={handleClick} className="room">
                {room.photoURL ? 
                    <img src={room.photoURL} alt="Photo" title="Photo" className="room-photo" />
                    :
                    <div  className="room-photo" >
                        {room.group ? <GroupIcon/> : <AccountCircleIcon />}
                    </div>
                }
            <div className="room-details">
                <div className="room-display-name">{ room.displayName}</div>
                {room.lastMessage && (room.lastMessage.content.file ? 
                    <div className="last-message">
                        <div className="last-message__content">{room.lastMessage.content.file.name}</div>
                        <div className="last-message__time">{room.lastMessage.timestamp ? formatTime(room.lastMessage.timestamp.toDate()) : ''}</div>
                    </div>
                    :
                    <div className="last-message">
                        <div className="last-message__content">{room.lastMessage.content.text}</div>
                        <div className="last-message__time">{room.lastMessage.timestamp ? formatTime(room.lastMessage.timestamp.toDate()) : ''}</div>
                    </div>)
                }
            </div>
        </NavLink>
    );
}

function Sidebar() {
    const [showMenu, setShowMenu] = useState(false); 
    const user = useSelector(state => state.auth.user);
    const history = useHistory();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [roomsDetails, setRoomsDetails] = useState([]);
    const [searchedRooms, setSearchedRooms] = useState([]);

    useEffect(() => {
        let messagesUnsubscribes = []; 

        const unsubscribe = db.collection('rooms').orderBy('timestamp', 'desc').onSnapshot(async snapshot => {
                    let rooms = [];
                    snapshot.docs.forEach(doc => {
                        const room = {
                            id: doc.id,
                            ...doc.data()
                        };
                        if(room.users.includes(user.uid))
                        {
                            rooms.push(room);
                        }
                    });

                    try 
                    {
                        setLoading(true);
                        
                        const _rooms = {};
                        const _roomsDetails = {};
                        for(const index in rooms)
                        {
                            if(!rooms[index].group)
                            {
                                const _users = [];
                                for(const uid of rooms[index].users)
                                {
                                    const doc = await db.collection('users').doc(uid).get();
                                    _users.push({
                                        uid: doc.id,
                                        ...doc.data()
                                    }); 
                                }

                                rooms[index] = {
                                    ...rooms[index],
                                    users: _users
                                };
                            }

                            const messagesUnsubscribe =  db.collection('rooms').doc(rooms[index].id).collection('messages').orderBy('timestamp', 'desc').onSnapshot(snapshot => {
                                        if(snapshot.docs.length === 0)
                                        {
                                            rooms[index] = {
                                                ...rooms[index],
                                                lastMessage: null
                                            };
                                        }
                                        else 
                                        {   
                                            const doc = snapshot.docs[0];
                                                rooms[index] = {
                                                ...rooms[index],
                                                lastMessage: {
                                                    id: doc.id,
                                                    ...doc.data()
                                                }
                                            };
                                        }
                                        
                                        const room = rooms[index];
                                        if(!room.group)
                                        {
                                            if(!room.lastMessage) // use unread message rather than last message
                                            {
                                                if(room.initiators.findIndex(initiator => initiator === user.uid) < 0)
                                                {
                                                    return;
                                                }
                                            }
                                        }

           
                                        if(room.group)
                                        {
                                            const roomDetails = {
                                                id: room.id,
                                                group: true,
                                                displayName: room.displayName,
                                                photoURL: room.photoURL,
                                                lastMessage: room.lastMessage
                                            };
                                            _roomsDetails[room.id] = roomDetails;
                                        }
                                        else 
                                        {
                                            room.users.forEach(_user => {
                                                if(_user.uid !== user.uid)
                                                {
                                                    const roomDetails = {
                                                                id: room.id,
                                                                displayName: _user.displayName,
                                                                photoURL: _user.photoURL,
                                                                lastMessage: room.lastMessage
                                                    };
                                                    _roomsDetails[room.id] = roomDetails;
                                                }
                                            });
                                        }
                                        _rooms[room.id] = rooms[index];

                                        setRoomsDetails(Object.values(_roomsDetails));
                                        dispatch({
                                            type: roomsActionTypes.setRooms,
                                            payload: Object.values(_rooms)
                                        });            
                                },
                                err => {
                                    setError(err.message);
                                });
                                messagesUnsubscribes.push(messagesUnsubscribe);
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
                });

        return () => {
            if(unsubscribe)
            {
                unsubscribe();
            }
            messagesUnsubscribes.forEach(messagesUnsubscribe => {
                messagesUnsubscribe();
            });
        }
    }, []);

    useEffect(() => {
        setSearchedRooms(roomsDetails);

    }, [roomsDetails]);
    
    const logOut = async () => {
        try 
        {
            await auth.signOut();
            dispatch({
                type: authActionTypes.setInitialState
            });
            history.push('/');
        }
        catch(err)
        {
            alert(err.message);
        }
    }

    const items =[
        {
            title: "Home",
            onClick: e => {
                closeSidebar();
                history.push('/');
            }
        },
        {
            title: "Add a new chat",
            onClick: e => {
                closeSidebar();
                history.push('/add_new_chat');
            }
        },
        {
            title: "Create a new group",
            onClick: e => {
                closeSidebar();
                history.push('/add_new_group')
            }
        },
        {
            title: "Log Out",
            onClick: e => {
                logOut();
            }
        }
    ];

    const handleSearch = e => {
        const value = e.target.value;

        if(value === ' ')
        {
            return;
        }

        if(value === '')
        {
            setSearchInput(value);
            setSearchedRooms(roomsDetails);
            return;
        }

        const _searchedRooms = roomsDetails.filter(room => {
            const roomDisplayNameSet = new Set(room.displayName.toLowerCase().split(''));
            const valueSet = new Set(value.toLowerCase().split(''));
            const intersection = [...valueSet].filter(ch => roomDisplayNameSet.has(ch));
            return intersection.length > 0;
        });

        setSearchedRooms(_searchedRooms)
        setSearchInput(value);
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                {user.photoURL ? 
                    <img src={user.photoURL} alt="Photo" title="Photo" className="user-photo" />
                    :
                    <div  className="user-photo" >
                        <AccountCircleIcon />
                    </div>
                }
                <div className="user-display-name-and-actions">
                    <div className="user-display-name">
                        {user.displayName}
                    </div>
                    <div className="user-actions dropdown-btn" onClick={e => {
                        
                        e.currentTarget.classList.add('active');
                        setShowMenu(true);
                    }}>
                        <MoreVertIcon />
                        {showMenu && <Menu setShowMenu={setShowMenu} items={items} />}
                    </div>
                </div>
            </div>
            <div className="search-chat">
                <input type="search" placeholder="Search chat" value={searchInput} onChange={handleSearch} className="search-chat__input" />
            </div>
            <div className="rooms">
                {loading && <Loading />}
                {error && <Error error={error} />}
               {searchedRooms.sort((searchedRoom1, searchedRoom2) => {
                   return searchedRoom2.lastMessage?.timestamp - searchedRoom1.lastMessage?.timestamp
               }).map((room, index) => {
                   return (<Room key={index} room={room}  />)
               })}
            </div>
        </div>
    );
}

export default Sidebar
