import React from 'react';
import './Home.css';
import {useSelector} from 'react-redux';
import { NavLink } from 'react-router-dom';

function Home() {
    const user = useSelector(state => state.auth.user);

    return (
        <div className="dashboard-home">
            <h3 className="user-welcome">Welcome, {user.displayName}</h3>
            <NavLink to="/add_new_chat" className="add-chat-link">Add a new chat</NavLink>
        </div>
    );
}

export default Home;
