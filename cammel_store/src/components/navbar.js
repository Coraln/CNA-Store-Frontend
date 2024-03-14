import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faSearch, faUser } from '@fortawesome/free-solid-svg-icons';
import '../styles/navbar.css';
import { useAuth } from './CheckAuth';
import { useSearch } from './SearchContext';
import { useCart } from './CartContext'; // Ensure you import useCart from your CartContext
import camelLogo from '../camelImages/camellogo-transformed-removebg-preview.png'
//import camelText from '../camelImages/cooltext453914258362390.png'

const Navbar = () => {
    const { user, logout, login } = useAuth();
    const { setSearchTerm } = useSearch();
    const { cartItems, updateQuantity } = useCart();
    const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const hideDropdownTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [attemptsRemaining, setAttemptsRemaining] = useState(6);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isLoginFormVisible) {
                const dropdown = document.querySelector('.login-dropdown');
                if (dropdown && !dropdown.contains(event.target)) {
                    setIsLoginFormVisible(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => document.removeEventListener('click', handleClickOutside);
    }, [isLoginFormVisible]);

    useEffect(() => {
        return () => {
            if (hideDropdownTimeoutRef.current) {
                clearTimeout(hideDropdownTimeoutRef.current);
            }
        };
    }, []);

    const handleDropdownClick = (event) => {
        event.stopPropagation();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = { username, password };

        fetch(`${process.env.REACT_APP_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
            .then(response => {
                if (!response.ok) {
                    setAttemptsRemaining(prevAttempts => prevAttempts - 1);
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(data => {
                login(username);
                localStorage.setItem('jwt', data.token);
                setIsLoginFormVisible(false);
                navigate('/store');
            })
            .catch(error => {
                setMessage('Wrong username or password');
            });
    };

    const showDropdown = () => {
        clearTimeout(hideDropdownTimeoutRef.current);
        setShowCartDropdown(true);
    };
    const totalItemsInCart = () => {
        return cartItems.reduce((total, item) => total + item.quantity, 0);
      };
      
    const calculateTotalCost = () => {
        return cartItems.reduce((total, item) => total + item.price, 0).toFixed(2);
      };

    const hideDropdown = () => {
        hideDropdownTimeoutRef.current = setTimeout(() => {
            setShowCartDropdown(false);
        }, 5000); // Adjust this delay as needed
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                <img src={camelLogo} id="camelLogo" alt="Camel Logo" />
                  <h3 id="camelStoreLogoText">Camel Store</h3>  
                </Link>
                <div className="search-bar">
                    <input type="text" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
                    <button type="submit"><FontAwesomeIcon icon={faSearch} /></button>
                </div>
                <ul className="navbar-menu">
                    {user ? (
                        <>
                            <li className="navbar-item">
                                <div className="navbar-links">
                                    <span className="login-text" onClick={logout}>
                                        Logout
                                    </span>
                                </div>
                            </li>
                            <li className="navbar-item">
                                <Link to="/profile" className="navbar-links">
                                    <FontAwesomeIcon icon={faUser} className="icon-spacing" />
                                    | Profile
                                </Link>
                            </li>
                        </>
                    ) : (
                        <li className="navbar-item">
                            <div className="navbar-links">
                                <FontAwesomeIcon icon={faUser} className="icon-spacing" />
                                <span className="login-text" onClick={() => setIsLoginFormVisible(!isLoginFormVisible)}>
                                    | Login
                                </span>
                                <Link to="/myOrders" className="register">My orders</Link>
                                {isLoginFormVisible && (
                                    <div className="login-dropdown" onClick={handleDropdownClick}>
                                        <form onSubmit={handleSubmit}>
                                            <label htmlFor="username">Username:</label>
                                            <input type="text" id="username" name="username" required value={username} onChange={e => setUsername(e.target.value)} />
                                            <label htmlFor="password">Password:</label>
                                            <input type="password" id="password" name="password" required value={password} onChange={e => setPassword(e.target.value)} />
                                            {message && <p className="error-message">{message} Attempts remaining: {attemptsRemaining}</p>}
                                            <button type="submit">Login</button>
                                        </form>
                                        <Link to="/register" className="register">Register</Link>
                                    </div>
                                )}
                            </div>
                        </li>
                    )}
                    <li className="navbar-item" onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
                    <Link to="/cart" className="navbar-links" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
  {totalItemsInCart() > 0 && (
    <span className="cart-item-count">{totalItemsInCart()}</span>
  )}
  <FontAwesomeIcon icon={faShoppingCart} className="icon-spacing" />
  | Cart
</Link>



    {showCartDropdown && (
        <div className="cart-dropdown">
            {cartItems.length > 0 ? (
                <>
                    {cartItems.map((item) => (
                        <div key={item.id} className="cart-item-dropdown">
                            <div className="cart-item-controls">
                                <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>-</button>
                                <span className="item-quantity">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                            </div>
                            <span>{item.name} | {item.price.toFixed(2)}€</span>
                        </div>
                    ))}
                    <div className="cart-total">
                        Total: {calculateTotalCost()}€
                    </div>
                </>
            ) : (
                <span>Your cart is empty.</span>
            )}
            <div className={`cart-dropdown-actions ${cartItems.length > 0 ? 'no-top-border' : ''}`}>
                <button className="checkout-button" onClick={() => navigate('/cart')}>Proceed to Checkout →</button>
        </div>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;