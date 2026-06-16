import makeTemplate from './baseRenderer';

// Corporate single-column, full-width underlined headings. ATS-friendly.
export default makeTemplate({
  accent: '#1d4ed8',
  fontFamily: 'Helvetica',
  header: 'plain',
  heading: 'underline',
  nameSize: 22,
  skills: 'chips',
});
