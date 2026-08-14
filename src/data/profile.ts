export const profile = {
  name: 'Alex Louderback',
  headline: "The Developer's Developer",
  role: 'Salesforce DevOps Engineer',
  company: 'National Philanthropic Trust',
  location: 'Dover, PA',
  email: 'alex@alouderback.com',
  github: 'https://github.com/alouderback',
  githubHandle: 'alouderback',
  linkedin: 'https://www.linkedin.com/in/alexlouderback/',
  // Phone is on the PDF resume but deliberately left off the public site to
  // keep it away from scrapers. Add it here if you want it shown.
  // phone: '(443) 686-2297',
  resumePdf: '/Alex-Louderback-Resume.pdf',

  summary:
    'I build the delivery pipelines that Salesforce teams ship through. At National Philanthropic Trust I run CI/CD for the CRM team, where release cadence doubled after the pipeline went in. Before that I was a Salesforce developer at Deloitte writing Lightning Web Components for federal clients, which is why I tend to design tooling from the developer seat rather than from the process diagram.',

  photo: {
    src: '/photo/alex-eagles.jpg',
    alt: 'Alex Louderback in Eagles face paint and a kelly green jacket at a tailgate, with his wife in a number 88 jersey',
    caption: 'Tailgating in Philadelphia. The face paint is not negotiable.',
  },

  /** Headline numbers, all drawn from the resume. */
  stats: [
    { value: '150+', label: 'releases orchestrated in 2025', context: 'CRM team, NPT' },
    { value: '2x', label: 'the prior release cadence', context: 'after the Gearset pipeline' },
    { value: '1st', label: 'IT Delivery Center of Excellence', context: 'helped found it at NPT' },
    { value: '2', label: 'conference talks in the last year', context: 'London and virtual' },
  ],
} as const;

/**
 * Kelly green is the site's colour for a reason. This is the note that goes
 * with it.
 */
export const eagles = {
  title: 'Go Birds',
  lines: [
    'I am a Philadelphia Eagles fan in the way that shows up on a calendar. Sundays are blocked out from September to January, the kelly green throwbacks are the correct uniform and I will argue about it, and the face paint goes on before the drive up to the Linc.',
    'The kelly green running through this site is the 1954 to 1995 colour, the one they brought back for the throwbacks. It seemed like the right accent for a personal site.',
    'If a deploy window ever lands on a Sunday at one, I am going to ask about moving it.',
  ],
};
