import React from 'react';
import './App.css';
import {BrowserRouter} from 'react-router-dom';
import {Provider} from 'react-redux';
import store from './store';
import {useSelector, useDispatch} from 'react-redux';
import Auth from './Auth';
import Dashboard from './Dashboard';

const ChatApp = props => {
  const user = useSelector(state => state.auth.user);

  return (user.isAuthenticated ? 
          <Dashboard />
          :
          <Auth />);
}

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Provider store={store}>
          <ChatApp />
        </Provider>
      </BrowserRouter>
    </div>
  );
}

export default App;
