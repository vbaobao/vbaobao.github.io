import React from 'react';
import ReactDOM from 'react-dom';
import ProjectCard from './components/ProjectCard';
import Projects from '../assets/js/Projects.js';

ReactDOM.render(<ProjectCard data={Projects} />, document.getElementById('projects'));
