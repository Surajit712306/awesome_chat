import React, { useRef } from 'react';
import './Hamburger.css';
import MenuIcon from '@material-ui/icons/Menu';

const Hamburger = e => {
    const hamburgerRef = useRef();

    const handleClick = e => {
        const sidebarElem = document.querySelector('.sidebar');
        if(sidebarElem)
        {
            sidebarElem.classList.toggle('active');
        }        
    }


    return (<div className="hamburger" onClick={handleClick} ref={hamburgerRef} >
                <MenuIcon />
            </div>);
}

export default Hamburger;