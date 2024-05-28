import React from 'react';
import './TotalCard.css';

const TotalCard = ({ title, value, description, iconClassName }) => {
    return (
        <div className="total-card">
            <div className="total-card-header">
                <h4>{title}</h4>
            </div>
            <div className="total-card-body">
                <div className="total-card-value">
                    <span>{value}</span>
                </div>
                <div className="total-card-description">
                    <p>{description}</p>
                </div>
                <div className="total-card-icon">
                    <i className={iconClassName}></i>
                </div>
            </div>
        </div>
    );
};

export default TotalCard;
