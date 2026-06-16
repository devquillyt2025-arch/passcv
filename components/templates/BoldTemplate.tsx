import makeTemplate from './baseRenderer';

// Uppercase name with accent-filled heading bars. Strong, visual variety.
export default makeTemplate({
  accent: '#0f766e',
  fontFamily: 'Helvetica',
  header: 'plain',
  heading: 'filled',
  nameSize: 24,
  nameUppercase: true,
  skills: 'chips',
});
