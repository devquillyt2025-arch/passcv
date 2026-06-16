import makeTemplate from './baseRenderer';

// Conservative serif, left-bordered headings, inline skills. ATS-friendly.
export default makeTemplate({
  accent: '#1e3a8a',
  fontFamily: 'Times-Roman',
  header: 'plain',
  heading: 'leftborder',
  nameSize: 22,
  skills: 'inline',
  italicCompany: true,
});
