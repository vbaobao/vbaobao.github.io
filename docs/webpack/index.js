import React from 'react';
import ReactDOM from 'react-dom';
import Card from './components/Card';
import EmailModal from './components/EmailModal';
import Timeline from './components/Timeline';
import ProjectData from '../assets/js/Projects.js';
import HistoryData from '../assets/js/History.js';

function Projects ({ data }) {
  const cards = data.map((project) => <Card data={project} key={project.title.toString(2)} />);

  return <ul>{cards}</ul>;
};

ReactDOM.render(<Projects data={ProjectData} />, document.getElementById('projects'));

ReactDOM.render(<EmailModal/>, document.getElementById('email-modal'));

ReactDOM.render(<Timeline data={HistoryData}/>, document.getElementById('timeline'));