import React from 'react';
import './AboutUs.css';
import { Helmet } from 'react-helmet';
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";


const AboutUs = () => {

    return (
        <div>

            <Helmet>
                <title>About Us</title>
            </Helmet>

            <NavBar/>

            <div className="Header1-aboutus">

                <h1>Just for you</h1>
                <h3>Welcome To Natural Candles Shop</h3>
                <p>Our dreamy scents are inspired by nature and travel, moments and memories. We hand-pour our candles
                    in our Natural Candle shop using sustainable soy wax and phthalate-free perfume oils infused with
                    essential oils.</p>

            </div>

            <div className="Header2-aboutus">

                <div className="image1-aboutus">
                    <div>
                        <img src="/images/AboutUs/image1-aboutus.jpg" alt={"img"}/>
                    </div>
                </div>

                <div className="content1-aboutus">
                    <h3>Who We Are</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>

            </div>

            <div className="Header3-aboutus">

                <div className="content2-aboutus">
                    <h3>How We Work</h3>
                    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                </div>

                <div className="image2-aboutus">
                    <div>
                        <img src="/images/AboutUs/image1-aboutus.jpg" alt={"img"}/>
                    </div>
                </div>

            </div>

            <Footer/>

        </div>

    );
};

export default AboutUs;