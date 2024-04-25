import React from 'react';
import './AspectContainer.css';

const AspectContainer = ({ aspectData }) => {
  return (
    <div className="aspect-container">
      {aspectData.map((aspect, index) => (
        <div key={index} className="aspect-item">
          <h3 className="aspect-header">{aspect.name}</h3>
          <ul className="aspect-list">
            {aspect.fields && Object.entries(aspect.fields).map(([field, value], idx) => (
              <li key={idx} className="aspect-field">
                <span className="field-label">{field}</span>
                <span className="field-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AspectContainer;




  