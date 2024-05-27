import React, {useState} from 'react';
import './FAQs.css';
import { Helmet } from 'react-helmet';
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";

const Faqs = () => {

    const [openIndex, setOpenIndex] = useState(null);

    const handleClick = (index) => {
      setOpenIndex(openIndex === index ? null : index);
    };


    const items = [
        {
            title: 'How can I pay for my order ?',
            content: 'Contenu de la section 1...',
        },
        {
            title: 'Can I return an item ?',
            content: 'Contenu de la section 2...',
        },
        {
            title: 'How long my order will take to be delivered ?',
            content: 'Contenu de la section 3...',
        },
        {
            title: 'How can I change something in my order ?',
            content: 'Contenu de la section 3...',
        },
    ];

    return (
        <div>

            <Helmet>
                <title>FAQs</title>
            </Helmet>

            <NavBar/>

            <div className="Header1-Shop">

                <div className="image1-shop">
                    <img src="/images/FAQs/image1-faqs.jpg" alt="Logo"/>
                </div>
                <div className="content1-shop">
                    <h3>Frequently Asked Questions</h3>
                </div>

            </div>


            <div className="Header1-Faqs">

                {items.map((item, index) => (
                    <div key={index}>
                        <div className="item-title" onClick={() => handleClick(index)}>
                            <strong>{item.title}</strong>
                        </div>
                        {openIndex === index &&
                            <div className="item-content">{item.content}</div>}
                    </div>
                ))}

            </div>

            <Footer/>

        </div>

    );
};

export default Faqs;