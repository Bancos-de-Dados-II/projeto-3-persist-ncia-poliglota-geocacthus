import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./header.css";
import ModalCreateLocation from "../Modal/ModalCreateLocation/ModalCreateLocation";


function Header() {
    const { logout } = useAuth();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userToken = localStorage.getItem("authToken");
        setIsLoggedIn(!!userToken);
    }, []);

    const handleLogout = () => {    
        logout();
        setIsLoggedIn(false);
        navigate("/home");
    };

    const isActivate = (path: string) => location.pathname === path;

    return (
        <header className="main-header">
            <div className="header-logo">
                <Link to="/home">
                    {isLoggedIn ? (
                        <h1>GeoCacthus</h1>
                    ) : (
                        <h1>GeoCacthus</h1>
                    )}
                </Link>
            </div>
            <nav className="header-nav">
                <ul>
                    <li>
                        <Link to="/home" className={isActivate("/home") ? "active-link" : ""}>Home</Link>
                    </li>
                    {isLoggedIn ? (
                        <>
                            <li onClick={() => setIsModalOpen(true)}>
                                Create Tourist Location
                            </li>
                            <li>
                                <Link to="/profile" className={isActivate("/profile") ? "active-link" : ""}>Profile</Link>
                            </li>
                            <li onClick={handleLogout} className="logout-link">
                                Logout
                            </li>
                        </>
                    ) : (
                        <li>
                            <Link to="/signin" className={isActivate("/signin") ? "active-link" : ""}>Login</Link>
                        </li>
                    )}
                </ul>
            </nav>

            <ModalCreateLocation isOpen={isModalOpen} onClose={setIsModalOpen} />
            {/* <ModalCreateLocation isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
        </header>
    );
}

export default Header;
