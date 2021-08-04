import React from 'react';

const Timeline = ({data}) => {
  let isLeft = false;
  let cards = data.map((exp) => {
    isLeft = !isLeft;
    return (
      <div className={`timeline-card ${isLeft ? 'left-show-on-scroll': 'right-show-on-scroll'}`}>
        <em>{exp.years}</em>
        <h4>{exp.title} <span>at {exp.company}</span></h4>
        <p>
          {exp.description}
        </p>
      </div>
    );
  });

  return (
    <div className="timeline-wrapper">
      <h1>Timeline</h1>
      <div className="timeline-container">
        {cards}
      </div>
    </div>
  );
};

export default Timeline;
