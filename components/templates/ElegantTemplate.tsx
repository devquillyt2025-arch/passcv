import makeTemplate from './baseRenderer';

// Centered serif name with hairline-rule headings. Refined, ATS-friendly.
export default makeTemplate({
  accent: '#334155',
  fontFamily: 'Times-Roman',
  header: 'centered',
  heading: 'rule',
  nameSize: 24,
  skills: 'inline',
  italicCompany: true,
});
