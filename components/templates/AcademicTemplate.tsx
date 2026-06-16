import makeTemplate from './baseRenderer';

// Centered serif with underlined headings, tuned for publications/education. ATS-friendly.
export default makeTemplate({
  accent: '#7c2d12',
  fontFamily: 'Times-Roman',
  header: 'centered',
  heading: 'underline',
  nameSize: 23,
  skills: 'inline',
  italicCompany: true,
});
