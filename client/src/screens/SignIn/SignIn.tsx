import styles from "./signin.module.css";
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { login as loginService, LoginData } from "../../service/authService";
import Logo from "../../../public/banner-sign.svg";
import { ToastContainer, toast } from "react-toastify";


import EmailIcon from "../../../public/email-icon.svg";
import PasswordIcon from "../../../public/password-icon.svg";


function SignIn() {
    const { login } = useAuth();
    const [formData, setFormData] = useState<LoginData>({
        email: "",
        password: ""
    });

    const [errorMessage, setErrorMessage] = useState<string>("");
    const navigate = useNavigate();

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const data = await loginService(formData);
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log(data.token);

            login(data.user, data.token);

            toast.success("Login realizado com sucesso!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
    
            setTimeout(() => {
                navigate("/home");
            }, 2000);
        } catch (error) {
            toast.error((error as Error).message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark"
            });
        }
    };

    return (
        <div className={styles.containerSignin}>
            <div className={styles.contentSectionForm}>
                <div className={styles.sectionBanner}>
                    <img src={Logo} alt="Logo" className={styles.Banner} /> {/* Usando a imagem SVG */}
                </div>
                <div className={styles.sectionForm}>
                    <h2 className={styles.formTitle}>Sign In</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <img src={EmailIcon} alt="Email icon" className={styles.iconsForm}/>
                            <input
                                id="signin-email"
                                type="text"
                                name="email"
                                placeholder="E-mail"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <img src={PasswordIcon} alt="Password icon" className={styles.iconsForm}/>
                            <input
                                id="signin-password"
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className={styles.submitButton}>Enter</button>
                    </form>
                    
                    <ToastContainer />
                    <div className={styles.sectionActionAccount}>
                        <p>Don't have an account? <a href="/signup" className={styles.signUpLink}>Sign Up</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;
