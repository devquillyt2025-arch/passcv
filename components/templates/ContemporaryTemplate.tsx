import makeTemplate from './baseRenderer';

// Modern sans-serif, left-bordered headings, skill chips. ATS-friendly.
export default makeTemplate({
  accent: '#7c3aed',
  fontFamily: 'Helvetica',
  header: 'plain',
  heading: 'leftborder',
  nameSize: 23,
  skills: 'chips',
});
