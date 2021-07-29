import React from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import ProjectData from '../assets/js/Projects.js';

function Projects ({ data }) {
  const cards = data.map((project) => <Card data={project} key={project.title.toString(2)} />);

  return <ul>{cards}</ul>;
};

ReactDOM.render(<Projects data={ProjectData} />, document.getElementById('projects'));
