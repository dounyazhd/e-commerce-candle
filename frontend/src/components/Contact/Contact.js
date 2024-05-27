import React from 'react';
import './Contact.css';
import {Link} from "react-router-dom";
import { Helmet } from 'react-helmet';
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";


const Contact = () => {

    return (
        <div>

            <Helmet>
                <title>Contact</title>
            </Helmet>

            <NavBar/>

            <div className="Header1-contact">

                <div className="image1-contact">
                    <div>
                        <img src="/images/Contact/image1-contact.jpg" alt={"img"}/>
                    </div>
                </div>

                <div className="content1-contact">
                    <h1>Contact</h1>
                    <p>For more information you can contact us, On:</p>
                    <h3>Phone : </h3>
                    <h6>(+212) 60000000</h6>
                    <h3>Email : </h3>
                    <h6>contact.candle@gmail.com</h6>
                    <h3>Follow Us : </h3>

                    <div className="icons-contact">
                        <ul className="icons">
                            <li>
                                <Link to="/">
                                    <i className="fab fa-instagram"></i>
                                </Link>
                            </li>
                            <li>
                                <Link to="/">
                                    <i className="fab fa-whatsapp"></i>
                                </Link>
                            </li>
                            <li>
                                <Link to="/">
                                    <i className="fab fa-facebook"></i>
                                </Link>
                            </li>
                        </ul>
                    </div>

                </div>

            </div>

            <Footer/>

        </div>

    );
};

export default Contact;