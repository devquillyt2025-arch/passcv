import makeTemplate from './baseRenderer';

// Accent-colored header band with left-bordered headings. Visual variety.
export default makeTemplate({
  accent: '#db2777',
  fontFamily: 'Helvetica',
  header: 'band',
  heading: 'leftborder',
  nameSize: 24,
  skills: 'chips',
});
