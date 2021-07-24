import React, { useState } from 'react';

function ProjectCard ({ data }) {
  const [image, setImage] = useState('thumbnail');

  const imageOnHover = () => {
    setImage('altThumbnail');
  };

  const imageNotOnHover = () => {
    setImage('thumbnail');
  };

  const cards = data.map((project) => {
    return (
      <li>
        <a href={project.url}>
          <h2>{project.title || 'Not title yet!'}</h2>
          <img src={project[image] || ''} alt={project.title} onMouseEnter={imageOnHover} onMouseLeave={imageNotOnHover}/>
          <p>{project.desc || 'No description.'}</p>
          <p><b>Tags</b> {project.tags.join(', ') || 'No tags'}</p>
        </a>
      </li>
    );
  });

  return <ul>{cards}</ul>;
};

export default ProjectCard;