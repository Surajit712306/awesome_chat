import React from 'react';
import './Dashboard.css';
import Sidebar from './Dashboard/Sidebar';
import ChatRoom from './Dashboard/ChatRoom';
import AddNewChat from './Dashboard/AddNewChat';
import AddNewGroup from './Dashboard/AddNewGroup';
import { Switch, Route} from 'react-router-dom';
import Home from './Dashboard/Home';
import Hamburger from './Dashboard/Hamburger';

function Dashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard__group">
                <Sidebar />
                <Hamburger />
                <div className="dashboard__right">
                    <Switch>
                        <Route path="/add_new_chat">
                            <AddNewChat />
                        </Route>
                        <Route path="/add_new_group">
                            <AddNewGroup />
                        </Route>
                        <Route path="/rooms/:roomId">
                            <ChatRoom />
                        </Route>
                        <Route path="/">
                            <Home />
                        </Route>
                    </Switch>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
