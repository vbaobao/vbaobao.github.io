import React, { useState } from 'react';

const Card = ({data}) => {
  const [details, setDetails] = useState(false);

  const onHover = (e) => {
    setDetails(true);
  };

  const offHover = (e) => {
    setDetails(false);
  };

  return (
    <li className="card" onMouseEnter={onHover} onMouseLeave={offHover}>
      <a href={data.url}>
        {
          details
            ? (<div><p>{data.desc || 'No description.'}</p><p><b>Tags</b> {data.tags.join(', ') || 'No tags'}</p></div>)
            : (<div><h2>{data.title || 'Not title yet!'}</h2><img src={data.thumbnail || ''} alt={data.title} /></div>)
        }
      </a>
    </li>
  );
};

export default Card;