import React, {useEffect, useCallback} from 'react';
import './Menu.css';

const MenuItem = ({item, closeMenu}) => {

    const handleClick = e => {
        item.onClick();
        closeMenu();
    }

    return (
        <div className="menu__item" onClick={handleClick}>{item.title}</div>
    );
}

function Menu({setShowMenu, items}) {

    const closeMenu = useCallback(() => {
        setShowMenu(false);
        document.querySelector('.dropdown-btn.active')?.classList.remove('active');
    }, []);

    useEffect(() => {
        const handleClick = e => {
            closeMenu();
        }
        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        }

    }, []);

    return (
            <div className="menu">
                <div className="menu__items">
                    {items.map((item, index) => (
                        <MenuItem key={index} item={item} closeMenu={closeMenu} />
                    ))}
                </div>
            </div>
    );
}

export default Menu;
