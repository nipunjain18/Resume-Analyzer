/**
 * analyzer.js — Resume NLP Analysis Engine v2
 * Complete rewrite: skill extraction, keyword matching, ATS scoring,
 * experience relevance, keyword optimization, rejection risk, insights & suggestions.
 *
 * Public API (window globals):
 *   normalizeAnalysisText, normalizeSkill, extractSkills,
 *   capitalizeSkill, formatSkillName
 *
 * Main entry:
 *   analyzeResume(resumeTxt, jobDescTxt) → results object
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1  SKILL DISPLAY NAMES
// ═══════════════════════════════════════════════════════════════════════════════

const SKILL_DISPLAY_NAMES = {
  // ── Programming ──
  javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
  java: 'Java', php: 'PHP', ruby: 'Ruby', go: 'Go', rust: 'Rust',
  kotlin: 'Kotlin', swift: 'Swift', scala: 'Scala', dart: 'Dart',
  r: 'R', matlab: 'MATLAB', perl: 'Perl', haskell: 'Haskell', lua: 'Lua',
  groovy: 'Groovy', bash: 'Bash', shell: 'Shell', powershell: 'PowerShell',
  assembly: 'Assembly', cplusplus: 'C++', c: 'C', csharp: 'C#',
  dotnet: '.NET', objectivec: 'Objective-C',

  // ── Web ──
  html: 'HTML', css: 'CSS', sass: 'Sass', less: 'Less',
  bootstrap: 'Bootstrap', tailwind: 'Tailwind CSS',
  materialui: 'Material UI', chakraui: 'Chakra UI', shadcn: 'shadcn',
  reactjs: 'React.js', reactnative: 'React Native', redux: 'Redux',
  tanstackquery: 'TanStack Query', angular: 'Angular', vuejs: 'Vue.js',
  svelte: 'Svelte', jquery: 'jQuery', nodejs: 'Node.js', express: 'Express',
  nestjs: 'NestJS', django: 'Django', flask: 'Flask', fastapi: 'FastAPI',
  spring: 'Spring', springboot: 'Spring Boot', laravel: 'Laravel',
  rails: 'Rails', nextjs: 'Next.js', nuxt: 'Nuxt', gatsby: 'Gatsby',
  remix: 'Remix', astro: 'Astro', graphql: 'GraphQL', restapi: 'REST API',
  microservices: 'Microservices', json: 'JSON', xml: 'XML', yaml: 'YAML',
  webpack: 'Webpack', vite: 'Vite', babel: 'Babel',
  socketio: 'Socket.io', websocket: 'WebSocket',
  jwt: 'JWT', oauth: 'OAuth', axios: 'Axios',

  // ── Data & AI ──
  machinelearning: 'Machine Learning', deeplearning: 'Deep Learning',
  neuralnetwork: 'Neural Network', nlp: 'NLP',
  computervision: 'Computer Vision', tensorflow: 'TensorFlow',
  pytorch: 'PyTorch', keras: 'Keras', scikitlearn: 'Scikit-Learn',
  pandas: 'Pandas', numpy: 'NumPy', matplotlib: 'Matplotlib',
  seaborn: 'Seaborn', tableau: 'Tableau', powerbi: 'Power BI',
  dataanalysis: 'Data Analysis', datascience: 'Data Science',
  statistics: 'Statistics', opencv: 'OpenCV',
  huggingface: 'Hugging Face', transformers: 'Transformers',
  bert: 'BERT', gpt: 'GPT', llm: 'LLM', ai: 'AI',
  featureengineering: 'Feature Engineering',
  modeldeployment: 'Model Deployment', mlops: 'MLOps',
  datavisualization: 'Data Visualization',
  dataengineering: 'Data Engineering', etl: 'ETL',
  datapipeline: 'Data Pipeline', spark: 'Spark', hadoop: 'Hadoop',
  airflow: 'Airflow', xgboost: 'XGBoost', lightgbm: 'LightGBM',
  pyspark: 'PySpark',

  // ── Database ──
  sql: 'SQL', sqlserver: 'SQL Server', mysql: 'MySQL',
  postgresql: 'PostgreSQL', mongodb: 'MongoDB', redis: 'Redis',
  elasticsearch: 'Elasticsearch', oracle: 'Oracle', sqlite: 'SQLite',
  cassandra: 'Cassandra', dynamodb: 'DynamoDB', firebase: 'Firebase',
  neo4j: 'Neo4j', mariadb: 'MariaDB', nosql: 'NoSQL',
  databasedesign: 'Database Design', queryoptimization: 'Query Optimization',
  indexing: 'Indexing', supabase: 'Supabase', prisma: 'Prisma',
  mongoose: 'Mongoose', sequelize: 'Sequelize', typeorm: 'TypeORM',

  // ── Cloud & DevOps ──
  aws: 'AWS', azure: 'Azure', gcp: 'GCP', docker: 'Docker',
  kubernetes: 'Kubernetes', terraform: 'Terraform', jenkins: 'Jenkins',
  cicd: 'CI/CD', devops: 'DevOps', ansible: 'Ansible',
  git: 'Git', github: 'GitHub', gitlab: 'GitLab', bitbucket: 'Bitbucket',
  linux: 'Linux', unix: 'Unix', serverless: 'Serverless',
  lambda: 'Lambda', ec2: 'EC2', s3: 'S3',
  cloudcomputing: 'Cloud Computing', infrastructure: 'Infrastructure',
  nginx: 'Nginx', apache: 'Apache', vercel: 'Vercel', netlify: 'Netlify',
  heroku: 'Heroku', digitalocean: 'DigitalOcean',
  githubactions: 'GitHub Actions', circleci: 'CircleCI',
  prometheus: 'Prometheus', grafana: 'Grafana',

  // ── Compound / Job terms ──
  backend: 'Backend', frontend: 'Frontend', fullstack: 'Full Stack',
  api: 'API', database: 'Database',

  // ── Soft Skills ──
  communication: 'Communication', leadership: 'Leadership',
  teamwork: 'Teamwork', problemsolving: 'Problem Solving',
  agile: 'Agile', scrum: 'Scrum',
  projectmanagement: 'Project Management', collaboration: 'Collaboration',
  criticalthinking: 'Critical Thinking', timemanagement: 'Time Management',
  analytical: 'Analytical', creative: 'Creative',
  presentation: 'Presentation', negotiation: 'Negotiation',
  mentoring: 'Mentoring', stakeholdermanagement: 'Stakeholder Management',
  crossfunctional: 'Cross-Functional',

  // ── Tools ──
  jira: 'Jira', confluence: 'Confluence', slack: 'Slack', figma: 'Figma',
  adobe: 'Adobe', photoshop: 'Photoshop', excel: 'Excel', word: 'Word',
  powerpoint: 'PowerPoint', notion: 'Notion', trello: 'Trello',
  asana: 'Asana', vscode: 'VS Code', intellij: 'IntelliJ',
  jupyter: 'Jupyter', postman: 'Postman', selenium: 'Selenium',
  jest: 'Jest', pytest: 'Pytest', mocha: 'Mocha', cypress: 'Cypress',
  playwright: 'Playwright', storybook: 'Storybook', swagger: 'Swagger',
  datadog: 'Datadog', newrelic: 'New Relic', sentry: 'Sentry',
  eslint: 'ESLint', prettier: 'Prettier',
};


// ═══════════════════════════════════════════════════════════════════════════════
// §2  TEXT NORMALIZATION (PRE-STRIP, COMPOUND, SYNONYM RULES)
// ═══════════════════════════════════════════════════════════════════════════════

// Phase 1: tech names with special chars → ASCII keys BEFORE punctuation is stripped
const PRE_STRIP_RULES = [
  [/c\+\+/gi,    'cplusplus'],
  [/c#/gi,       'csharp'],
  [/\.net\b/gi,  'dotnet'],
];

// Phase 2: merge compound terms AFTER punctuation is removed
const COMPOUND_RULES = [
  // Framework suffixes
  [/\breact\s+js\b/g,   'reactjs'],
  [/\bnode\s+js\b/g,    'nodejs'],
  [/\bvue\s+js\b/g,     'vuejs'],
  [/\bnext\s+js\b/g,    'nextjs'],
  [/\bnuxt\s+js\b/g,    'nuxt'],
  [/\bnest\s+js\b/g,    'nestjs'],
  [/\bexpress\s+js\b/g, 'express'],
  [/\bexpressjs\b/g,    'express'],
  [/\bsocket\s+io\b/g,  'socketio'],
  // Compound tech names
  [/\bmongo\s+db\b/g,         'mongodb'],
  [/\btailwind\s*css\b/g,     'tailwind'],
  [/\breact\s+native\b/g,     'reactnative'],
  [/\bspring\s+boot\b/g,      'springboot'],
  [/\bmaterial\s+ui\b/g,      'materialui'],
  [/\bchakra\s+ui\b/g,        'chakraui'],
  [/\bobjective\s+c\b/g,      'objectivec'],
  [/\bpower\s+bi\b/g,         'powerbi'],
  [/\bnew\s+relic\b/g,        'newrelic'],
  [/\bvs\s+code\b/g,          'vscode'],
  // Multi-word concepts
  [/\brest(?:ful)?\s+api\b/g,            'restapi'],
  [/\bmachine\s+learning\b/g,            'machinelearning'],
  [/\bdeep\s+learning\b/g,              'deeplearning'],
  [/\bneural\s+networks?\b/g,           'neuralnetwork'],
  [/\bcomputer\s+vision\b/g,            'computervision'],
  [/\bdata\s+analysis\b/g,              'dataanalysis'],
  [/\bdata\s+science\b/g,               'datascience'],
  [/\bdata\s+engineering\b/g,           'dataengineering'],
  [/\bdata\s+visualization\b/g,         'datavisualization'],
  [/\bdata\s+pipeline\b/g,              'datapipeline'],
  [/\bscikit\s+learn\b/g,               'scikitlearn'],
  [/\bhugging\s+face\b/g,               'huggingface'],
  [/\bsql\s+server\b/g,                 'sqlserver'],
  [/\bgithub\s+actions\b/g,             'githubactions'],
  [/\btanstack\s+(?:react\s+)?query\b/g,'tanstackquery'],
  [/\breact\s+query\b/g,                'tanstackquery'],
  [/\bamazon\s+web\s+services\b/g,      'aws'],
  [/\bgoogle\s+cloud(?:\s+platform)?\b/g,'gcp'],
  [/\bmicrosoft\s+azure\b/g,            'azure'],
  [/\bci\s*cd\b/g,                      'cicd'],
  [/\bdot\s+net\b/g,                    'dotnet'],
  [/\bproblem\s+solving\b/g,            'problemsolving'],
  [/\bproject\s+management\b/g,         'projectmanagement'],
  [/\bstakeholder\s+management\b/g,     'stakeholdermanagement'],
  [/\btime\s+management\b/g,            'timemanagement'],
  [/\bcritical\s+thinking\b/g,          'criticalthinking'],
  [/\bcross\s+functional\b/g,           'crossfunctional'],
  [/\bfeature\s+engineering\b/g,        'featureengineering'],
  [/\bmodel\s+deployment\b/g,           'modeldeployment'],
  [/\bdatabase\s+design\b/g,            'databasedesign'],
  [/\bquery\s+optimization\b/g,         'queryoptimization'],
  [/\bcloud\s+computing\b/g,            'cloudcomputing'],
  [/\bfull\s+stack\b/g,                 'fullstack'],
  [/\bback\s+end\b/g,                   'backend'],
  [/\bfront\s+end\b/g,                  'frontend'],
];

// Single-word synonyms → canonical key
const SKILL_SYNONYMS = {
  js: 'javascript', ts: 'typescript', py: 'python',
  golang: 'go', cpp: 'cplusplus',
  react: 'reactjs', node: 'nodejs', vue: 'vuejs',
  mongo: 'mongodb', postgres: 'postgresql', pg: 'postgresql',
  k8s: 'kubernetes', mssql: 'sqlserver',
  sklearn: 'scikitlearn', tf: 'tensorflow',
  ml: 'machinelearning', dl: 'deeplearning',
  tailwindcss: 'tailwind', expressjs: 'express',
};

// ── Skill relationship implications ──────────────────────────────────────────
// Key: detected canonical skill  →  Value: array of implied canonical skills.
// When a resume contains the key skill, all listed implied skills are also
// credited automatically (prevents false "missing" reports for related skills).
const SKILL_IMPLICATIONS = {
  // ── Version Control ──────────────────────────────────────────────────────
  github:         ['git'],
  gitlab:         ['git'],
  bitbucket:      ['git'],
  githubactions:  ['cicd', 'github', 'git'],

  // ── JavaScript Ecosystem ─────────────────────────────────────────────────
  typescript:     ['javascript'],
  reactjs:        ['javascript'],
  vuejs:          ['javascript'],
  angular:        ['javascript', 'typescript'],
  svelte:         ['javascript'],
  jquery:         ['javascript'],
  nodejs:         ['javascript'],
  express:        ['nodejs', 'javascript'],
  nestjs:         ['nodejs', 'typescript', 'javascript'],
  nextjs:         ['reactjs', 'javascript'],
  nuxt:           ['vuejs', 'javascript'],
  remix:          ['reactjs', 'javascript'],
  reactnative:    ['reactjs', 'javascript'],
  redux:          ['javascript'],
  tanstackquery:  ['javascript'],

  // ── CSS / Styling ─────────────────────────────────────────────────────────
  sass:           ['css'],
  less:           ['css'],
  tailwind:       ['css'],
  bootstrap:      ['css', 'html'],
  materialui:     ['css', 'javascript'],
  chakraui:       ['css', 'javascript'],

  // ── Python Ecosystem ──────────────────────────────────────────────────────
  django:         ['python'],
  flask:          ['python'],
  fastapi:        ['python'],
  tensorflow:     ['machinelearning', 'ai', 'python'],
  pytorch:        ['deeplearning', 'machinelearning', 'ai', 'python'],
  keras:          ['deeplearning', 'machinelearning'],
  scikitlearn:    ['machinelearning', 'python'],
  pandas:         ['python', 'dataanalysis'],
  numpy:          ['python'],
  matplotlib:     ['python', 'datavisualization'],
  seaborn:        ['python', 'datavisualization'],
  opencv:         ['computervision', 'python'],
  pyspark:        ['spark', 'python'],
  xgboost:        ['machinelearning', 'python'],
  lightgbm:       ['machinelearning', 'python'],
  airflow:        ['python', 'datapipeline'],

  // ── ML / AI Hierarchy ─────────────────────────────────────────────────────
  deeplearning:   ['machinelearning', 'ai'],
  neuralnetwork:  ['machinelearning', 'ai'],
  computervision: ['machinelearning', 'ai'],
  nlp:            ['machinelearning', 'ai'],
  huggingface:    ['nlp', 'machinelearning', 'transformers'],
  transformers:   ['nlp', 'machinelearning'],
  bert:           ['nlp', 'transformers', 'machinelearning'],
  gpt:            ['llm', 'nlp', 'ai'],
  llm:            ['ai', 'nlp'],
  mlops:          ['machinelearning', 'devops'],

  // ── Java Ecosystem ────────────────────────────────────────────────────────
  spring:         ['java'],
  springboot:     ['spring', 'java'],
  kotlin:         ['java'],

  // ── Other Frameworks → Language ───────────────────────────────────────────
  rails:          ['ruby'],
  laravel:        ['php'],

  // ── SQL Databases ─────────────────────────────────────────────────────────
  postgresql:     ['sql'],
  mysql:          ['sql'],
  sqlserver:      ['sql'],
  sqlite:         ['sql'],
  mariadb:        ['sql'],
  supabase:       ['postgresql', 'sql'],
  prisma:         ['sql'],
  sequelize:      ['sql', 'nodejs', 'javascript'],
  typeorm:        ['sql', 'typescript', 'javascript'],

  // ── NoSQL Databases ───────────────────────────────────────────────────────
  mongodb:        ['nosql'],
  redis:          ['nosql'],
  cassandra:      ['nosql'],
  dynamodb:       ['nosql'],
  neo4j:          ['nosql'],
  firebase:       ['nosql'],
  elasticsearch:  ['nosql'],
  mongoose:       ['mongodb', 'nodejs'],

  // ── Cloud & DevOps ────────────────────────────────────────────────────────
  kubernetes:     ['docker'],
  jenkins:        ['cicd'],
};


// ═══════════════════════════════════════════════════════════════════════════════
// §3  CORE TEXT HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Normalize text for analysis:
 *  lowercase → NFKD strip accents → pre-strip rules → normalize separators →
 *  remove punctuation → collapse spaces → compound rules
 */
function normalizeAnalysisText(text) {
  let t = String(text || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // Strip zero-width / invisible chars
  t = t.replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '');

  for (const [rx, rep] of PRE_STRIP_RULES) t = t.replace(rx, rep);

  // Normalize common separators to spaces before stripping punctuation
  t = t.replace(/[|/\\•●▪►,;:–—·→⇒\-]/g, ' ');

  t = t.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const [rx, rep] of COMPOUND_RULES) t = t.replace(rx, rep);

  return t;
}

/** Normalize a single skill token to its canonical key */
function normalizeSkill(raw) {
  const cleaned = normalizeAnalysisText(raw);
  return SKILL_SYNONYMS[cleaned] || cleaned;
}

/** Human-readable label for a skill key */
function formatSkillName(skill) {
  const key = normalizeSkill(skill);
  if (SKILL_DISPLAY_NAMES[key]) return SKILL_DISPLAY_NAMES[key];
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/** Alias expected by script.js */
function capitalizeSkill(skill) {
  return formatSkillName(skill);
}

/**
 * Clean raw resume/JD text before analysis:
 *  strip zero-width chars, normalize quotes/dashes, handle bullet chars,
 *  collapse whitespace, remove trailing sentence punctuation,
 *  de-duplicate consecutive identical words
 */
function cleanText(text) {
  return text
    .replace(/[\u200B-\u200D\uFEFF\u00AD]/g, '')
    .replace(/[\u2018\u2019\u2032]/g, "'")
    .replace(/[\u201C\u201D\u2033]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[•●▪►·→⇒]/g, ' ')
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/[.,;:!?]+$/g, ''))
    .filter(Boolean)
    .filter((w, i, arr) => i === 0 || w.toLowerCase() !== arr[i - 1].toLowerCase())
    .join(' ')
    .trim();
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}


// ═══════════════════════════════════════════════════════════════════════════════
// §4  SKILL DATABASE
// ═══════════════════════════════════════════════════════════════════════════════

const SKILL_CATEGORIES = {
  programming: [
    'python', 'javascript', 'typescript', 'java', 'c', 'cplusplus', 'csharp', 'go',
    'rust', 'kotlin', 'swift', 'php', 'ruby', 'r', 'matlab', 'scala', 'dart',
    'bash', 'shell', 'powershell', 'perl', 'haskell', 'lua', 'groovy', 'objectivec',
    'assembly', 'dotnet',
  ],
  web: [
    'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'materialui', 'chakraui',
    'shadcn', 'reactjs', 'reactnative', 'redux', 'tanstackquery', 'angular', 'vuejs',
    'svelte', 'jquery', 'nodejs', 'express', 'nestjs', 'django', 'flask', 'fastapi',
    'spring', 'springboot', 'laravel', 'rails', 'nextjs', 'nuxt', 'gatsby', 'remix',
    'astro', 'graphql', 'restapi', 'microservices', 'json', 'xml', 'yaml', 'webpack',
    'vite', 'babel', 'socketio', 'websocket', 'jwt', 'oauth', 'axios',
  ],
  data: [
    'machinelearning', 'deeplearning', 'neuralnetwork', 'nlp', 'computervision',
    'tensorflow', 'pytorch', 'keras', 'scikitlearn', 'pandas', 'numpy', 'matplotlib',
    'seaborn', 'tableau', 'powerbi', 'dataanalysis', 'datascience', 'statistics',
    'opencv', 'huggingface', 'transformers', 'bert', 'gpt', 'llm', 'ai',
    'featureengineering', 'modeldeployment', 'mlops', 'datavisualization',
    'dataengineering', 'etl', 'datapipeline', 'spark', 'hadoop', 'airflow',
    'xgboost', 'lightgbm', 'pyspark',
  ],
  database: [
    'sql', 'sqlserver', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'oracle', 'sqlite', 'cassandra', 'dynamodb', 'firebase', 'neo4j', 'mariadb',
    'nosql', 'databasedesign', 'queryoptimization', 'indexing', 'supabase',
    'prisma', 'mongoose', 'sequelize', 'typeorm',
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins', 'cicd',
    'devops', 'ansible', 'git', 'github', 'gitlab', 'bitbucket', 'linux', 'unix',
    'serverless', 'lambda', 'ec2', 's3', 'cloudcomputing', 'infrastructure',
    'nginx', 'apache', 'vercel', 'netlify', 'heroku', 'digitalocean',
    'githubactions', 'circleci', 'prometheus', 'grafana',
  ],
  soft: [
    'communication', 'leadership', 'teamwork', 'problemsolving', 'agile',
    'scrum', 'projectmanagement', 'collaboration', 'criticalthinking',
    'timemanagement', 'analytical', 'creative', 'presentation', 'negotiation',
    'mentoring', 'stakeholdermanagement', 'crossfunctional',
  ],
  tools: [
    'jira', 'confluence', 'slack', 'figma', 'adobe', 'photoshop', 'excel', 'word',
    'powerpoint', 'notion', 'trello', 'asana', 'vscode', 'intellij', 'jupyter',
    'postman', 'selenium', 'jest', 'pytest', 'mocha', 'cypress', 'playwright',
    'storybook', 'swagger', 'datadog', 'newrelic', 'sentry', 'eslint', 'prettier',
  ],
};

// Flat array of every canonical skill key
const SKILL_DATABASE = [...new Set(Object.values(SKILL_CATEGORIES).flat())];

// Reverse lookup: token → canonical skill key (includes both DB skills and synonyms)
const SKILL_TOKEN_MAP = (() => {
  const map = new Map();
  for (const sk of SKILL_DATABASE) map.set(sk, sk);
  for (const [synonym, canonical] of Object.entries(SKILL_SYNONYMS)) {
    map.set(synonym, canonical);
  }
  return map;
})();

// Pre-built lookup entries with regex for robust word-boundary matching.
// Short tokens (≤2 chars) use space-padded matching; longer ones use \b.
const NORMALIZED_SKILL_ENTRIES = (() => {
  const allTokens = new Map(); // token → canonical key

  for (const sk of SKILL_DATABASE) allTokens.set(sk, sk);
  for (const [synonym, canonical] of Object.entries(SKILL_SYNONYMS)) {
    if (!allTokens.has(synonym)) allTokens.set(synonym, canonical);
  }

  const entries = [];
  for (const [token, key] of allTokens) {
    if (token.length <= 2) {
      // Short tokens: use padded-space matching (avoid false positives)
      entries.push({ key, needle: ` ${token} `, regex: null });
    } else {
      // Longer tokens: use word-boundary regex
      entries.push({ key, needle: null, regex: new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`) });
    }
  }

  // Longer entries first → greedy matching prevents partial collisions
  entries.sort((a, b) => (b.needle || b.regex.source).length - (a.needle || a.regex.source).length);
  return entries;
})();


// ═══════════════════════════════════════════════════════════════════════════════
// §5  STOP WORDS & NOISE FILTERS
// ═══════════════════════════════════════════════════════════════════════════════

const STOP_WORDS = new Set([
  // Determiners / conjunctions / prepositions
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that',
  'these', 'those', 'their', 'they', 'our', 'we', 'you', 'your', 'its',
  'it', 'he', 'she', 'his', 'her', 'who', 'which', 'when', 'where',
  'what', 'how', 'not', 'no', 'any', 'all', 'more', 'also', 'than',
  'then', 'so', 'if', 'about', 'into', 'through', 'during', 'over',
  'under', 'after', 'before', 'between', 'out', 'up', 'down', 'very',
  'well', 'just', 'such', 'both', 'each', 'new', 'other', 'same',
  // Resume/JD generic filler
  'work', 'working', 'year', 'years', 'experience', 'ability', 'skills',
  'good', 'great', 'strong', 'excellent', 'plus', 'including', 'required',
  'skill', 'software', 'high', 'low', 'level', 'levels',
  'looking', 'candidate', 'candidates', 'modern', 'job', 'role', 'position',
  'developer', 'engineer', 'company', 'team', 'responsible', 'responsibilities',
  'manage', 'ensure', 'provide', 'apply', 'join', 'must', 'need', 'needs',
  'knowledge', 'understanding', 'help', 'like', 'based', 'using',
  'qualification', 'qualifications', 'description', 'prefer', 'preferred',
  'ideal', 'opportunity', 'dynamic', 'fast', 'paced', 'environment',
  'proven', 'track', 'record', 'minimum', 'proficient', 'proficiency',
  'familiar', 'familiarity', 'expertise', 'solid', 'hands', 'within',
  'across', 'related', 'relevant', 'able', 'etc', 'per', 'via', 'day',
  'want', 'wanted', 'seeking', 'offer', 'offers', 'benefit', 'benefits',
  'salary', 'paid', 'time', 'full', 'part', 'contract', 'remote', 'onsite',
  'hybrid', 'office', 'location', 'city', 'state', 'country',
  'comfortable', 'entire',
]);

// Extra blocklist for the "other keywords" fallback bucket
const KEYWORD_NOISE_WORDS = new Set([
  'along', 'closely', 'practical', 'motivated', 'scalable',
  'software', 'high', 'low', 'level', 'levels',
  'application', 'applications', 'technology', 'technologies',
  'building', 'built', 'developer', 'engineer', 'role',
  'ability', 'skills', 'experience', 'years', 'year',
  'responsible', 'responsibilities', 'requirements', 'required',
  'preferred', 'prefer', 'plus', 'including', 'within', 'across',
  'strong', 'good', 'great', 'excellent', 'familiar', 'familiarity',
  'proficient', 'proficiency', 'hands', 'hands on', 'detail', 'details',
]);

// Recognized tech-token set (for boosting weight of "other" keywords that are tech)
const TECH_KEYWORDS = new Set([...SKILL_DATABASE, 'backend', 'frontend', 'fullstack', 'api', 'database']);


// ═══════════════════════════════════════════════════════════════════════════════
// §6  TOKENIZATION & STEMMING
// ═══════════════════════════════════════════════════════════════════════════════

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[./ ]+|[./ ]+$/g, ''))
    .filter(w => w.length > 1 && !STOP_WORDS.has(w));
}

function stemToken(t) {
  if (!t || t.length <= 3) return t;
  if (t.endsWith('ization')) return t.slice(0, -7) + 'ize';
  if (t.endsWith('ational')) return t.slice(0, -7) + 'ate';
  if (t.endsWith('fulness')) return t.slice(0, -7) + 'ful';
  if (t.endsWith('iness'))  return t.slice(0, -5) + 'y';
  if (t.endsWith('ing') && t.length > 5) return t.slice(0, -3);
  if (t.endsWith('ed')  && t.length > 4) return t.slice(0, -2);
  if (t.endsWith('es')  && t.length > 4) return t.slice(0, -2);
  if (t.endsWith('s')   && t.length > 4) return t.slice(0, -1);
  return t;
}

function canonicalizeToken(tok) {
  return stemToken(normalizeSkill(tok));
}

/** Tokenize + canonicalize for similarity comparisons */
function tokenizeForSimilarity(text) {
  return normalizeAnalysisText(text)
    .split(' ')
    .map(canonicalizeToken)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function buildNgrams(tokens, n) {
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
}

function getFrequencyMap(tokens) {
  const freq = new Map();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return freq;
}


// ═══════════════════════════════════════════════════════════════════════════════
// §7  SIMILARITY
// ═══════════════════════════════════════════════════════════════════════════════

function diceSimilarity(a, b) {
  if (!a.length || !b.length) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let shared = 0;
  for (const t of setA) if (setB.has(t)) shared++;
  return (2 * shared) / (setA.size + setB.size);
}

function semanticSimilarity(a, b) {
  const aT = tokenizeForSimilarity(a);
  const bT = tokenizeForSimilarity(b);
  return Math.max(0, Math.min(1,
    diceSimilarity(aT, bT) * 0.72 +
    diceSimilarity(buildNgrams(aT, 2), buildNgrams(bT, 2)) * 0.28
  ));
}


// ═══════════════════════════════════════════════════════════════════════════════
// §8  SKILL EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

// ── Fuzzy regex patterns ──────────────────────────────────────────────────────
// Each entry maps a canonical skill key to a regex that matches every common
// format variant of that technology (camelCase, dot-separated, hyphenated,
// spaced, version-suffixed, etc.).  Tested against the *raw* source text so no
// pre-normalization is required — results feed into extractSkills() as Pass 0.
const FUZZY_SKILL_PATTERNS = new Map([
  // ── Languages ─────────────────────────────────────────────────────────────
  // "JavaScript" / "java script" / "java-script"
  ['javascript',    /\bjava[\s\-_]?script\b/i],
  // "TypeScript" / "type script" / "type-script"
  ['typescript',    /\btype[\s\-_]?script\b/i],
  // "Python2" / "Python3" / "Python"
  ['python',        /\bpython\s*[23]?(?:\.\d+)?\b/i],
  // "C++" / "CPP" / "c plus plus"
  ['cplusplus',     /\bc\s*\+\s*\+|\bcpp\b|\bc\s+plus\s+plus\b/i],
  // "C#" / "csharp" / "c sharp"
  ['csharp',        /\bc\s*#|\bcsharp\b|\bc\s+sharp\b/i],
  // ".NET" / "dot net" / "dotnet"
  ['dotnet',        /\.net\b|\bdot[\s\-]?net\b/i],

  // ── Web Front-end ──────────────────────────────────────────────────────────
  // "HTML" / "HTML5" / "HTML 5"
  ['html',          /\bhtml\s*[45]?\b/i],
  // "CSS" / "CSS3" / "CSS 3"
  ['css',           /\bcss\s*[23]?\b/i],
  // "Sass" / "SCSS"
  ['sass',          /\bs[ac]ss\b/i],
  // "React" / "React.js" / "ReactJS" / "React-JS"
  ['reactjs',       /\breact(?:\.js|[\s\-_]?js)?\b/i],
  // "React Native" / "ReactNative"
  ['reactnative',   /\breact[\s\-_]native\b/i],
  // "Vue" / "Vue.js" / "VueJS" / "Vue-JS"
  ['vuejs',         /\bvue(?:\.js|[\s\-_]?js)?\b/i],
  // "Angular" / "AngularJS" / "Angular 2+" (any version)
  ['angular',       /\bangular(?:js|[\s\-_]?js|\s*\d+)?\b/i],
  // "Next.js" / "NextJS" / "Next-JS"
  ['nextjs',        /\bnext(?:\.js|[\s\-_]?js)\b/i],
  // "Nuxt" / "Nuxt.js" / "NuxtJS"
  ['nuxt',          /\bnuxt(?:\.js|[\s\-_]?js)?\b/i],
  // "Svelte" / "Svelte.js" / "SvelteJS"
  ['svelte',        /\bsvelte(?:\.js|[\s\-_]?js)?\b/i],
  // "jQuery" / "jquery" / "JQuery"
  ['jquery',        /\bjquery\b/i],
  // "Tailwind" / "Tailwind CSS" / "TailwindCSS"
  ['tailwind',      /\btailwind(?:[\s\-_]?css)?\b/i],
  // "Bootstrap" (versions: Bootstrap 5, Bootstrap5)
  ['bootstrap',     /\bbootstrap\s*\d?\b/i],

  // ── Back-end / Runtime ─────────────────────────────────────────────────────
  // "Node.js" / "NodeJS" / "Node JS" / "Node-JS" / "node-js"
  ['nodejs',        /\bnode(?:\.js|[\s\-_]?js)\b/i],
  // "Express" / "Express.js" / "ExpressJS"
  ['express',       /\bexpress(?:\.js|[\s\-_]?js)?\b/i],
  // "NestJS" / "Nest.js" / "Nest JS"
  ['nestjs',        /\bnest(?:\.js|[\s\-_]?js)\b/i],
  // "Next.js" already covered above (nextjs)
  // "Django"
  ['django',        /\bdjango\b/i],
  // "FastAPI" / "Fast API"
  ['fastapi',       /\bfast[\s\-_]?api\b/i],
  // "Flask"
  ['flask',         /\bflask\b/i],
  // "Spring Boot" / "SpringBoot" / "Spring"
  ['springboot',    /\bspring[\s\-_]?boot\b/i],
  ['spring',        /\bspring\b(?![\s\-_]?boot)/i],
  // "Laravel"
  ['laravel',       /\blaravel\b/i],

  // ── Databases ──────────────────────────────────────────────────────────────
  // "MongoDB" / "Mongo DB" / "Mongo-DB" / "Mongo"
  ['mongodb',       /\bmongo(?:[\s\-_]?db)?\b/i],
  // "PostgreSQL" / "Postgres" / "pg"
  ['postgresql',    /\bpostgre(?:s(?:ql)?)?\b|\bpg\b/i],
  // "MySQL" / "My SQL" / "my-sql"
  ['mysql',         /\bmy[\s\-_]?sql\b/i],
  // "SQL Server" / "SQLServer" / "MSSQL"
  ['sqlserver',     /\bsql[\s\-_]?server\b|\bmssql\b/i],
  // "SQLite"
  ['sqlite',        /\bsqlite\b/i],
  // "Redis"
  ['redis',         /\bredis\b/i],
  // "Elasticsearch" / "Elastic Search" / "Elastic"
  ['elasticsearch', /\belastic(?:[\s\-_]?search)?\b/i],
  // "Firebase"
  ['firebase',      /\bfirebase\b/i],
  // "DynamoDB" / "Dynamo DB"
  ['dynamodb',      /\bdynamo[\s\-_]?db\b/i],
  // "Cassandra"
  ['cassandra',     /\bcassandra\b/i],

  // ── AI / ML ────────────────────────────────────────────────────────────────
  // "TensorFlow" / "Tensor Flow" / "TensorFlow 2"
  ['tensorflow',    /\btensor[\s\-_]?flow\b/i],
  // "PyTorch" / "Py Torch"
  ['pytorch',       /\bpy[\s\-_]?torch\b/i],
  // "Scikit-learn" / "scikitlearn" / "scikit learn" / "sklearn"
  ['scikitlearn',   /\bscikit[\s\-_]learn\b|\bsklearn\b/i],
  // "OpenCV" / "Open CV" / "open-cv"
  ['opencv',        /\bopen[\s\-_]?cv\b/i],
  // "Hugging Face" / "HuggingFace"
  ['huggingface',   /\bhugging[\s\-_]?face\b/i],
  // "Machine Learning" / "ML" (standalone)
  ['machinelearning', /\bmachine[\s\-_]?learning\b/i],
  // "Deep Learning" / "DL" (standalone)
  ['deeplearning',  /\bdeep[\s\-_]?learning\b/i],
  // "Natural Language Processing" / "NLP"
  ['nlp',           /\bnatural[\s\-_]language[\s\-_]processing\b|\bnlp\b/i],
  // "Computer Vision"
  ['computervision', /\bcomputer[\s\-_]?vision\b/i],

  // ── DevOps / Cloud ─────────────────────────────────────────────────────────
  // "GitHub" / "Git Hub" / "git-hub"  (checked before plain git)
  ['github',        /\bgit[\s\-_]?hub\b/i],
  // "GitLab" / "Git Lab"
  ['gitlab',        /\bgit[\s\-_]?lab\b/i],
  // "Bitbucket" / "Bit Bucket"
  ['bitbucket',     /\bbit[\s\-_]?bucket\b/i],
  // "Git" — standalone only; must not fire inside "GitHub" / "GitLab"
  ['git',           /\bgit\b(?![\s\-_.]?(?:hub|lab|bucket))/i],
  // "Docker"
  ['docker',        /\bdocker\b/i],
  // "Kubernetes" / "K8s" / "K 8 s"
  ['kubernetes',    /\bkubernetes\b|\bk8s\b/i],
  // "CI/CD" / "CICD" / "CI-CD"
  ['cicd',          /\bci[\s/\-_]?cd\b|\bcontinuous[\s\-_]?(?:integration|delivery|deployment)\b/i],
  // "AWS" / "Amazon Web Services"
  ['aws',           /\baws\b|\bamazon[\s\-_]?web[\s\-_]?services\b/i],
  // "GCP" / "Google Cloud"
  ['gcp',           /\bgcp\b|\bgoogle[\s\-_]?cloud(?:[\s\-_]?platform)?\b/i],
  // "Azure" / "Microsoft Azure"
  ['azure',         /\bazure\b|\bmicrosoft[\s\-_]?azure\b/i],
  // "Terraform"
  ['terraform',     /\bterraform\b/i],
  // "Ansible"
  ['ansible',       /\bansible\b/i],
  // "GitHub Actions" / "GithubActions"
  ['githubactions', /\bgit[\s\-_]?hub[\s\-_]?actions\b/i],

  // ── Tools ──────────────────────────────────────────────────────────────────
  // "VS Code" / "VSCode" / "Visual Studio Code"
  ['vscode',        /\bvs[\s\-_]?code\b|\bvisual[\s\-_]?studio[\s\-_]?code\b/i],
  // "GraphQL" / "Graph QL"
  ['graphql',       /\bgraph[\s\-_]?ql\b/i],
  // "REST API" / "RESTful" / "REST"
  ['restapi',       /\brest(?:ful)?[\s\-_]?api\b|\brestful\b/i],
  // "WebSocket" / "Web Socket" / "websockets"
  ['websocket',     /\bweb[\s\-_]?sockets?\b/i],
  // "Webpack" / "web pack"
  ['webpack',       /\bweb[\s\-_]?pack\b/i],
  // "Tailwind CSS" already covered above (tailwind)
  // "Postman"
  ['postman',       /\bpostman\b/i],
  // "Jest" / "Jest.js"
  ['jest',          /\bjest\b/i],
  // "Cypress"
  ['cypress',       /\bcypress\b/i],
  // "Pandas"
  ['pandas',        /\bpandas\b/i],
  // "NumPy" / "numpy" / "Num Py"
  ['numpy',         /\bnum[\s\-_]?py\b/i],
  // "Power BI" / "PowerBI"
  ['powerbi',       /\bpower[\s\-_]?bi\b/i],
  // "Socket.io" / "SocketIO" / "Socket io"
  ['socketio',      /\bsocket[\s\-_.]?io\b/i],
]);

/**
 * Run all FUZZY_SKILL_PATTERNS against raw (un-normalized) text.
 * Returns an array of matched canonical skill keys, deduplicated via Set.
 *
 * @param  {string} rawText  Original text before any normalization
 * @returns {string[]}       Canonical skill keys found via fuzzy matching
 */
function detectFuzzySkills(rawText) {
  const found = new Set();
  const text  = String(rawText || '');
  for (const [key, pattern] of FUZZY_SKILL_PATTERNS) {
    // Reset lastIndex for patterns with the global flag (none here, but safe)
    pattern.lastIndex = 0;
    if (pattern.test(text)) found.add(key);
  }
  return [...found];
}

/** Extract known skills from any text (resume or JD) */
function extractSkills(text) {
  // Pass 0: fuzzy regex patterns on raw text — catches format variants
  // (e.g. "NodeJS", "node-js", "Node.js", "TensorFlow") before normalization
  // strips the characters that distinguish them.
  const found = new Set(detectFuzzySkills(text));

  const normalized = normalizeAnalysisText(text);
  const padded = ` ${normalized} `;

  // Pass 1: regex / padded-needle matching against full normalized text
  for (const { key, needle, regex } of NORMALIZED_SKILL_ENTRIES) {
    if (found.has(key)) continue;
    if (regex) {
      if (regex.test(normalized)) found.add(key);
    } else {
      if (padded.includes(needle)) found.add(key);
    }
  }

  // Pass 2: token-set fallback — split text into words and look up each
  const words = normalized.split(/\s+/);
  for (const w of words) {
    if (!w) continue;
    const canonical = SKILL_TOKEN_MAP.get(w);
    if (canonical) found.add(canonical);
  }

  return [...found];
}

/**
 * Expand a detected-skills array using SKILL_IMPLICATIONS.
 * For every skill that has an entry in SKILL_IMPLICATIONS, the implied
 * skills are added to the result Set.  A second pass handles one level of
 * transitivity (e.g. express → nodejs → javascript).
 * Deduplication is guaranteed by the Set.
 *
 * @param  {string[]} skills  Canonicalized skill keys from extractSkills()
 * @returns {string[]}        Deduplicated, implications-expanded skill list
 */
function applySkillImplications(skills) {
  const result = new Set(skills);

  // Pass 1 — expand directly detected skills
  for (const skill of skills) {
    const implied = SKILL_IMPLICATIONS[skill];
    if (implied) {
      for (const imp of implied) result.add(imp);
    }
  }

  // Pass 2 — one level of transitivity for newly inferred skills
  // (e.g. express → nodejs is added in pass 1, then nodejs → javascript here)
  for (const skill of [...result]) {
    if (skills.includes(skill)) continue;           // already expanded above
    const implied = SKILL_IMPLICATIONS[skill];
    if (implied) {
      for (const imp of implied) result.add(imp);   // Set deduplicates automatically
    }
  }

  return [...result];
}

function getSkillCategory(skill) {
  const key = normalizeSkill(skill);
  for (const [cat, arr] of Object.entries(SKILL_CATEGORIES)) {
    if (arr.includes(key)) return cat;
  }
  return null;
}

// Maps the 7 internal SKILL_CATEGORIES keys → 3 user-facing display groups.
const GROUP_MAP = {
  programming: 'technical',
  web:         'technical',
  data:        'technical',
  database:    'technical',
  cloud:       'tools',
  tools:       'tools',
  soft:        'soft',
};

// Classifies an array of skill keys into { technical, tools, soft, other }.
function classifySkillsByGroup(skills) {
  const groups = { technical: [], tools: [], soft: [], other: [] };
  for (const skill of skills) {
    const cat   = getSkillCategory(skill);
    const group = (cat && GROUP_MAP[cat]) || 'other';
    groups[group].push(skill);
  }
  return groups;
}


// ═══════════════════════════════════════════════════════════════════════════════
// §9  SECTION DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

const RESUME_SECTIONS = {
  summary:    /\b(summary|objective|profile|about\s*me|professional\s*summary|career\s*objective)\b/i,
  skills:     /\b(skills|technical\s*skills|core\s*competencies|technologies|tech\s*stack)\b/i,
  experience: /\b(experience|work\s*experience|employment|work\s*history|professional\s*experience)\b/i,
  education:  /\b(education|academic|degree|university|college|certification|certifications)\b/i,
  projects:   /\b(projects|portfolio|personal\s*projects|key\s*projects|side\s*projects)\b/i,
};

function detectResumeSections(text) {
  const found = {};
  for (const [name, rx] of Object.entries(RESUME_SECTIONS)) found[name] = rx.test(text);
  return found;
}

/**
 * Analyse resume quality by detecting bullet points, quantified metrics,
 * and action verbs.  Returns per-indicator counts plus a composite
 * structure score in [0, 100].
 */
function analyzeResumeQuality(text) {
  // 1. Bullet points ─────────────────────────────────────────────────────────
  const bulletRx  = /(?:^|\n)\s*(?:[•●○◆▪▸\-*\u2022\u2023\u25E6\u2043\u2219]|\d+[.)\]]\s)/g;
  const bulletMatches = text.match(bulletRx) || [];
  const bulletCount   = bulletMatches.length;

  // 2. Numbers / metrics ("20%", "3 years", "50k users", "$1.2M") ────────────
  const metricsRx = /(?:\$\s?)?\b\d[\d,]*(?:\.\d+)?\s*(?:%|\+|x\b|k\b|m\b|bn?\b|percent|users?|clients?|customers?|projects?|years?|months?|team\s*members?|people|employees?|applications?|requests?|hrs?|hours?|days?|weeks?|minutes?)?/gi;
  const metricsMatches = text.match(metricsRx) || [];
  const metricsCount   = metricsMatches.length;

  // 3. Action verbs ──────────────────────────────────────────────────────────
  const QUALITY_ACTION_VERBS = [
    'built','developed','implemented','optimized','designed',
    'created','architected','deployed','integrated','automated',
    'managed','led','coordinated','delivered','improved',
    'reduced','increased','streamlined','resolved','analyzed',
    'engineered','spearheaded','launched','refactored','scaled',
    'mentored','established','maintained','configured','migrated',
  ];
  const verbRx      = new RegExp('\\b(' + QUALITY_ACTION_VERBS.join('|') + ')\\b', 'gi');
  const verbMatches = text.match(verbRx) || [];
  const verbCount   = verbMatches.length;

  // 4. Structure score (0–100) ───────────────────────────────────────────────
  //    Bullets:  5 pts each, max 30
  //    Metrics: 10 pts each, max 30
  //    Verbs:   8 pts each, max 40
  const bulletScore  = Math.min(bulletCount * 5, 30);
  const metricsScore = Math.min(metricsCount * 10, 30);
  const verbScore    = Math.min(verbCount * 8, 40);
  const structureScore = bulletScore + metricsScore + verbScore;

  return {
    hasBullets:     bulletCount > 0,
    bulletCount,
    hasMetrics:     metricsCount > 0,
    metricsCount,
    metricsExamples: [...new Set(metricsMatches.map(m => m.trim()))].slice(0, 5),
    hasActionVerbs: verbCount > 0,
    verbCount,
    verbsFound:     [...new Set(verbMatches.map(v => v.toLowerCase()))],
    structureScore,
    breakdown: { bullets: bulletScore, metrics: metricsScore, actionVerbs: verbScore },
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §10  JD KEYWORD EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

const ACTION_VERB_LEMMAS = [
  'architect', 'build', 'create', 'design', 'develop', 'deliver', 'implement',
  'optimize', 'improve', 'automate', 'maintain', 'manage', 'own', 'lead',
  'mentor', 'coordinate', 'collaborate', 'communicate', 'present', 'analyze',
  'research', 'debug', 'troubleshoot', 'test', 'validate', 'review',
  'refactor', 'integrate', 'deploy', 'monitor', 'secure', 'scale',
  'document', 'measure', 'define', 'plan', 'prioritize', 'estimate',
  'prototype', 'migrate', 'support', 'partner',
];

const ALWAYS_ALLOW_SHORT = new Set([
  'ai', 'ml', 'nlp', 'ui', 'ux', 'qa', 'api', 'sql', 'aws', 'gcp',
  'kpi', 'okr', 'sla', 'slo', 'etl', 'tdd', 'bdd', 'oop', 'soa',
  'sso', 'jwt', 'grpc',
]);

const INDUSTRY_KEYPHRASES = [
  'agile', 'scrum', 'kanban', 'sdlc', 'tdd', 'bdd', 'oop', 'soa',
  'microservices', 'distributed systems', 'event driven', 'observability',
  'logging', 'monitoring', 'alerting', 'on call', 'incident response',
  'code review', 'unit testing', 'integration testing', 'end to end testing',
  'api design', 'rest api', 'restful api', 'grpc', 'graphql',
  'authentication', 'authorization', 'sso', 'oauth', 'oauth2', 'jwt',
  'performance tuning', 'latency', 'throughput', 'scalability', 'availability',
  'reliability', 'sla', 'slo', 'slis', 'kpi', 'okr',
  'ci cd', 'continuous integration', 'continuous delivery',
  'data pipeline', 'etl', 'data warehouse', 'data lake',
];

const QUALIFICATION_PHRASES = [
  "bachelor's degree", 'bachelors degree', "master's degree", 'masters degree',
  'computer science', 'information technology', 'related field',
  'equivalent experience', 'years of experience',
];

const CERTIFICATION_PATTERNS = [
  /\baws\s+certified\b/ig,
  /\bazure\s+fundamentals\b/ig,
  /\bgcp\s+professional\b/ig,
  /\bpmp\b/g,
  /\b(itil|csm|psm|ccna|cissp|ceh)\b/ig,
  /\bsecurity\+\b/ig,
  /\bnetwork\+\b/ig,
  /\bcomptia\b/ig,
];

function formatKeywordDisplay(canonical) {
  const key = normalizeSkill(canonical);
  if (SKILL_DISPLAY_NAMES[key]) return SKILL_DISPLAY_NAMES[key];
  // Known acronyms
  const u = key.toUpperCase();
  if (['API', 'SLA', 'SLO', 'KPI', 'OKR', 'SQL', 'AWS', 'GCP', 'NLP', 'ETL', 'CI', 'CD'].includes(u)) return u;
  // Multi-word → title-case each word
  if (key.includes(' ')) {
    return key.split(' ')
      .map(w => w.length <= 3 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function extractAcronyms(text) {
  const matches = String(text || '').match(/\b[A-Z]{2,6}\b/g) || [];
  return [...new Set(matches.map(m => m.toUpperCase()))];
}

function extractCertifications(text) {
  const raw = String(text || '');
  const found = new Set();
  for (const rx of CERTIFICATION_PATTERNS) {
    for (const m of (raw.match(rx) || [])) found.add(m);
  }
  for (const m of (raw.match(/\bcertified\s+(?:in|as)\s+([A-Za-z0-9 .+#-]{2,40})/ig) || [])) {
    found.add(m);
  }
  return [...found].map(m => normalizeAnalysisText(m)).filter(Boolean);
}

function extractQualifications(text) {
  const norm = normalizeAnalysisText(text);
  const found = new Set();
  for (const phrase of QUALIFICATION_PHRASES) {
    const needle = normalizeAnalysisText(phrase);
    if (needle && norm.includes(needle)) found.add(needle);
  }
  for (const d of (String(text || '').match(/\b(BS|BA|MS|MA|MBA|PhD)\b/g) || [])) {
    found.add(d.toUpperCase());
  }
  return [...found];
}

function extractActionVerbs(text) {
  const verbs = new Set();
  const lines = String(text || '').replace(/[•●▪►]/g, '\n').split(/\n+/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const first = canonicalizeToken((line.split(/\s+/)[0] || ''));
    if (ACTION_VERB_LEMMAS.includes(first)) verbs.add(first);
  }
  const tokens = normalizeAnalysisText(text).split(' ').map(canonicalizeToken);
  for (const t of tokens) {
    if (ACTION_VERB_LEMMAS.includes(t)) verbs.add(t);
  }
  return [...verbs];
}

/**
 * Extract structured job responsibilities from JD text.
 * Used for experience-relevance scoring.
 */
function extractJobResponsibilities(jdText, rawJdText) {
  // Prefer raw text with line structure; fall back to cleaned text
  const source = rawJdText || jdText;
  const raw = String(source || '').replace(/[•●▪►·→⇒]/g, '\n');
  const lines = raw.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const duties = [];

  for (const line of lines) {
    const cleaned = line.replace(/^[-*\d.\s]+/, '').trim();
    if (cleaned.split(/\s+/).length < 4) continue;
    const first = canonicalizeToken(cleaned.split(/\s+/)[0]);
    if (ACTION_VERB_LEMMAS.includes(first) || /\b(responsibilit|you will|what you|duties|require|work|collaborat|partner|build|design|develop|implement|create)\b/i.test(cleaned)) {
      duties.push(cleaned);
    }
  }

  // Fallback: split on sentence boundaries
  if (duties.length === 0) {
    const sentences = raw.split(/[.!?]+\s+|\n+/).map(s => s.trim()).filter(Boolean);
    for (const s of sentences) {
      if (s.split(/\s+/).length >= 5) duties.push(s);
      if (duties.length >= 25) break;
    }
  }

  // Second fallback: split cleaned text on sentence-like boundaries
  if (duties.length === 0 && jdText) {
    const parts = String(jdText).split(/[.!?]+\s+/).map(s => s.trim()).filter(Boolean);
    for (const s of parts) {
      if (s.split(/\s+/).length >= 5) duties.push(s);
      if (duties.length >= 25) break;
    }
  }

  return duties.slice(0, 25);
}

/**
 * Master keyword extraction from a job description.
 * Returns { keywordObjects, responsibilities, jdSkills }.
 */
function extractJobKeywordObjects(jdText, maxOther = 60, rawJdText) {
  const normalized = normalizeAnalysisText(jdText);
  const tokens = normalized.split(' ').filter(Boolean);
  const freq = getFrequencyMap(tokens.filter(t => t.length > 1 && !STOP_WORDS.has(t)));

  const objects = [];
  const seen = new Set();

  const push = (canonical, type, weight) => {
    const canon = normalizeSkill(canonical);
    if (!canon || seen.has(canon)) return;
    seen.add(canon);
    objects.push({
      canonical: canon,
      display: formatKeywordDisplay(canon),
      type,
      weight,
      occurrences: freq.get(canon) || 1,
    });
  };

  // 1. DB skills
  const jdSkills = extractSkills(jdText);
  jdSkills.forEach(s => push(s, 'skill', getSkillCategory(s) === 'soft' ? 0.95 : 1.15));

  // 2. Industry keyphrases
  for (const phrase of INDUSTRY_KEYPHRASES) {
    const n = normalizeAnalysisText(phrase);
    if (n && normalized.includes(n)) push(n, 'industry', 1.05);
  }

  // 3. Action verbs
  extractActionVerbs(jdText).forEach(v => push(v, 'verb', 0.65));

  // 4. Certifications & qualifications
  extractCertifications(jdText).forEach(c => push(c, 'certification', 1.25));
  extractQualifications(jdText).forEach(q => push(q, 'qualification', 1.15));

  // 5. Acronyms
  extractAcronyms(jdText).forEach(a => push(a, 'industry', 0.9));

  // 6. Other meaningful tokens by frequency
  [...freq.entries()]
    .map(([t, c]) => [normalizeSkill(t), c])
    .filter(([t]) => t && !seen.has(t))
    .filter(([t]) => {
      if (t.length < 4 && !ALWAYS_ALLOW_SHORT.has(t.toLowerCase())) return false;
      if (KEYWORD_NOISE_WORDS.has(t) || STOP_WORDS.has(t)) return false;
      if (/^\d+$/.test(t)) return false;
      return true;
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxOther)
    .forEach(([t]) => push(t, 'keyword', TECH_KEYWORDS.has(t) ? 1.0 : 0.75));

  objects.sort((a, b) => (b.weight * b.occurrences) - (a.weight * a.occurrences));

  return {
    keywordObjects: objects,
    responsibilities: extractJobResponsibilities(jdText, rawJdText),
    jdSkills,
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §11  RESUME INDEX & KEYWORD MATCHING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a searchable index from resume text.
 * Expands synonym tokens into canonical forms so matching is generous.
 */
function buildResumeIndex(resumeTxt) {
  let expanded = normalizeAnalysisText(resumeTxt);

  // Synonym expansion: if resume says "React", inject "reactjs" too
  const expandedWords = new Set(expanded.split(/\s+/));
  for (const [synonym, canonical] of Object.entries(SKILL_SYNONYMS)) {
    if (expandedWords.has(synonym)) {
      expanded += ` ${canonical}`;
    }
  }

  const tokens = tokenizeForSimilarity(resumeTxt);
  return {
    normalizedPadded: ` ${expanded} `,
    tokenSet: new Set(tokens),
    bigrams: new Set(buildNgrams(tokens, 2)),
    trigrams: new Set(buildNgrams(tokens, 3)),
  };
}

/**
 * Match a single JD keyword object against the resume index.
 * Returns { matched, score, matchType, display }.
 */
function matchKeywordToResume(kwObj, idx) {
  const canonical = normalizeSkill(kwObj.canonical);
  const display = kwObj.display;
  const tokens = canonical.includes(' ')
    ? canonical.split(' ').map(canonicalizeToken).filter(Boolean)
    : [canonicalizeToken(canonical)];

  // 1. Exact / phrase match
  if (idx.normalizedPadded.includes(` ${canonical} `)) {
    return { matched: true, score: 1, matchType: 'exact', display };
  }

  // 2. N-gram match
  if (tokens.length === 2 && idx.bigrams.has(tokens.join(' '))) {
    return { matched: true, score: 0.95, matchType: 'ngram', display };
  }
  if (tokens.length === 3 && idx.trigrams.has(tokens.join(' '))) {
    return { matched: true, score: 0.95, matchType: 'ngram', display };
  }

  // 3. Token presence (single-word)
  if (tokens.length === 1 && idx.tokenSet.has(tokens[0])) {
    return { matched: true, score: 0.9, matchType: 'token', display };
  }

  // 4. Partial overlap for multi-word phrases
  if (tokens.length >= 2) {
    let overlap = 0;
    for (const t of tokens) if (idx.tokenSet.has(t)) overlap++;
    const ratio = overlap / tokens.length;
    if (ratio >= 0.6) {
      return { matched: true, score: Math.min(0.85, 0.55 + ratio * 0.4), matchType: 'partial', display };
    }
  }

  // 5. Soft semantic: stem-prefix match (with length guard to avoid java→javascript)
  if (tokens.length === 1) {
    const t = tokens[0];
    for (const rTok of idx.tokenSet) {
      if (rTok === t) continue;
      const shorter = Math.min(rTok.length, t.length);
      const longer  = Math.max(rTok.length, t.length);
      if (shorter < 5) continue;
      if (shorter / longer < 0.65) continue;   // length gap too large → skip
      if (rTok.startsWith(t) || t.startsWith(rTok)) {
        return { matched: true, score: 0.72, matchType: 'semantic', display };
      }
    }
  }

  return { matched: false, score: 0, matchType: 'none', display };
}

/**
 * ATS-style keyword matching — transparent count-based algorithm.
 *
 * Pipeline:
 *   1. Normalize both texts (lowercase, NFKD, compound rules, synonym collapse)
 *   2. Tokenize JD → remove stop words, noise words, pure numbers, ≤2-char tokens
 *      (except ALWAYS_ALLOW_SHORT acronyms like "ai", "sql", "aws")
 *   3. De-duplicate JD tokens into a candidate Set
 *   4. For each candidate: check padded-string inclusion OR tokenSet membership
 *      against the normalized resume
 *   5. score = (matched.length / total) × 100, capped at 100
 *
 * @param {string} jdText      Raw job description text
 * @param {string} resumeText  Raw resume text
 * @returns {{ score: number, total: number, matched: string[], missing: string[] }}
 */
function matchAtsKeywords(jdText, resumeText) {
  // ── Step 1: Normalize ─────────────────────────────────────────────────────
  const jdNorm     = normalizeAnalysisText(String(jdText    || ''));
  const resumeNorm = normalizeAnalysisText(String(resumeText || ''));

  // ── Step 2 & 3: Build de-duplicated JD keyword candidate set ─────────────
  // Apply synonym collapse so "React" and "reactjs" resolve to the same key.
  const jdCandidates = [...new Set(
    jdNorm
      .split(/\s+/)
      .filter(Boolean)
      .map(t => normalizeSkill(t))
      .filter(t => {
        if (!t)                    return false;
        if (/^\d+$/.test(t))       return false;           // pure number
        if (STOP_WORDS.has(t))     return false;           // stop word
        if (KEYWORD_NOISE_WORDS.has(t)) return false;      // resume filler
        // Allow short tech acronyms (ai, sql, aws…); block everything else ≤2 chars
        if (t.length <= 2 && !ALWAYS_ALLOW_SHORT.has(t)) return false;
        return true;
      }),
  )];

  if (jdCandidates.length === 0) {
    return { score: 0, total: 0, matched: [], missing: [] };
  }

  // ── Step 4: Build resume lookup structures ────────────────────────────────
  const resumePadded   = ` ${resumeNorm} `;
  const resumeTokenSet = new Set(
    resumeNorm.split(/\s+/).filter(Boolean).map(t => normalizeSkill(t)),
  );

  // ── Step 5: Match each JD keyword against resume ─────────────────────────
  const matched = [];
  const missing = [];

  for (const kw of jdCandidates) {
    const found = resumePadded.includes(` ${kw} `) || resumeTokenSet.has(kw);
    (found ? matched : missing).push(formatKeywordDisplay(kw));
  }

  // ── Step 6: Score = (matched / total) × 100 ──────────────────────────────
  const score = Math.min(
    Math.round((matched.length / jdCandidates.length) * 100),
    100,
  );

  return { score, total: jdCandidates.length, matched, missing };
}

/**
 * analyzeKeywords — public ATS keyword comparison API.
 *
 * Preprocessing pipeline (applied identically to both texts):
 *   1.  Lowercase  →  NFKD unicode normalisation
 *   2.  Compound-rule collapse  (Node.js → nodejs, React.js → reactjs …)
 *   3.  Punctuation / special-char removal
 *   4.  Synonym folding  (React → reactjs, K8s → kubernetes …)
 *   5.  Stop-word removal  (the, and, for, with …)
 *   6.  Noise-word removal  (experience, skills, required …)
 *   7.  Pure-number removal
 *   8.  Short-token guard: ≤2 chars dropped unless in ALWAYS_ALLOW_SHORT
 *       (ai, ml, aws, sql, nlp, ux …)
 *   9.  Set-deduplication  — every keyword counted exactly once
 *
 * Matching: padded whole-word inclusion OR canonical tokenSet membership.
 * Both checks use the same normalised+synonym-collapsed form so "ReactJS",
 * "React.js", and "react js" all match the JD keyword "reactjs".
 *
 * Missing-keyword ranking: the top 10 are ordered by their importance weight
 * inside the JD (skills > certifications > industry phrases > generic keywords)
 * so the most actionable gaps surface first.
 *
 * @param {string} resumeText      Raw resume text (any format)
 * @param {string} jobDescription  Raw job description text
 * @returns {{
 *   totalJDKeywords:    number,    // unique filtered JD keyword count
 *   matchedKeywords:    string[],  // display-formatted keywords found in resume
 *   missingKeywords:    string[],  // display-formatted keywords absent from resume
 *   keywordScore:       number,    // (matched / total) × 100, integer 0–100
 *   topMissingKeywords: string[],  // up to 10 highest-importance missing keywords
 * }}
 */
function analyzeKeywords(resumeText, jobDescription) {
  // ── Steps 1–9: normalize + filter + deduplicate (delegated to matchAtsKeywords)
  const { score, total, matched, missing } = matchAtsKeywords(jobDescription, resumeText);

  // ── Keyword score: (matched / total) × 100  ───────────────────────────────
  const keywordScore = score;  // already computed and capped at 100

  // ── Top 10 missing keywords ordered by JD importance  ────────────────────
  // Skills carry weight 1.15, certifications 1.25, industry phrases 1.05,
  // generic keywords 0.75.  Multiplied by occurrence count so frequently
  // repeated requirements rank higher.
  let topMissingKeywords;
  if (missing.length > 0) {
    const { keywordObjects } = extractJobKeywordObjects(jobDescription, 80);

    // Build display-label → composite importance score lookup
    const importanceMap = new Map();
    for (const obj of keywordObjects) {
      importanceMap.set(obj.display, obj.weight * (obj.occurrences || 1));
    }

    topMissingKeywords = [...missing]
      .sort((a, b) => (importanceMap.get(b) || 0) - (importanceMap.get(a) || 0))
      .slice(0, 10);
  } else {
    topMissingKeywords = [];
  }

  return {
    totalJDKeywords:    total,
    matchedKeywords:    matched,
    missingKeywords:    missing,
    keywordScore,
    topMissingKeywords,
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §12  EXPERIENCE RELEVANCE
// ═══════════════════════════════════════════════════════════════════════════════

// ── Experience indicator weights ──────────────────────────────────────────────
// Each entry: { pattern, weight, label }
//  pattern — regex tested against raw resume text (case-insensitive)
//  weight  — points added per unique pattern match (not per occurrence)
//  label   — human-readable category used for debugging
//
// Scoring tiers:
//   Tier A (15 pts) — formal employment proof (job titles, work history)
//   Tier B (12 pts) — internship / apprenticeship / co-op
//   Tier C (10 pts) — freelance / contract / consulting
//   Tier D ( 8 pts) — strong action-verb evidence of deliverables
//   Tier E ( 6 pts) — project / personal work indicators
//   Tier F ( 4 pts) — academic / volunteer / supporting evidence
//
// Cap: raw sum is normalised to 0–100 via a ceiling of 80 pts raw max → 100%.
const EXPERIENCE_INDICATORS = [
  // ── Tier A: Formal employment ───────────────────────────────────────────
  { pattern: /\b(?:work\s+experience|professional\s+experience|employment\s+history|work\s+history)\b/i, weight: 15, label: 'section:work-experience' },
  { pattern: /\b(?:full[\s\-]?time|part[\s\-]?time)\b/i,   weight: 12, label: 'employment-type' },
  { pattern: /\b(?:software\s+engineer|developer|analyst|architect|manager|lead|senior|junior)\b/i, weight: 10, label: 'job-title' },
  { pattern: /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b/i, weight: 8, label: 'date-range' },
  { pattern: /\b\d{4}\s*[–\-—to]+\s*(?:\d{4}|present|current|now)\b/i, weight: 8, label: 'year-range' },
  { pattern: /\b(?:responsibilities|achievements|accomplishments)\b/i, weight: 6, label: 'section:responsibilities' },

  // ── Tier B: Internship / apprenticeship ─────────────────────────────────
  { pattern: /\bintern(?:ship|ed)?\b/i,          weight: 12, label: 'internship' },
  { pattern: /\bapprentice(?:ship)?\b/i,          weight: 12, label: 'apprenticeship' },
  { pattern: /\bco[\s\-]?op\b/i,                 weight: 12, label: 'co-op' },
  { pattern: /\btrainee\b/i,                      weight: 10, label: 'trainee' },

  // ── Tier C: Freelance / contract / consulting ────────────────────────────
  { pattern: /\bfreelance[rd]?\b/i,               weight: 10, label: 'freelance' },
  { pattern: /\bcontract(?:or|ing)?\b/i,          weight: 10, label: 'contract' },
  { pattern: /\bconsult(?:ant|ing|ed)?\b/i,       weight: 10, label: 'consulting' },
  { pattern: /\bself[\s\-]?employed\b/i,          weight: 10, label: 'self-employed' },
  { pattern: /\bgig\b/i,                           weight: 8,  label: 'gig-work' },

  // ── Tier D: Action-verb deliverables ─────────────────────────────────────
  { pattern: /\b(?:built|build)\b/i,              weight: 8,  label: 'verb:built' },
  { pattern: /\b(?:developed|develop(?:ing)?)\b/i,weight: 8,  label: 'verb:developed' },
  { pattern: /\b(?:implemented|implement(?:ing)?)\b/i, weight: 8,  label: 'verb:implemented' },
  { pattern: /\b(?:created|create[ds]?)\b/i,      weight: 8,  label: 'verb:created' },
  { pattern: /\b(?:designed|design(?:ing|ed)?)\b/i,    weight: 8,  label: 'verb:designed' },
  { pattern: /\b(?:deployed|deploy(?:ing|ed)?)\b/i,    weight: 8,  label: 'verb:deployed' },
  { pattern: /\b(?:architected|architect(?:ing|ed)?)\b/i, weight: 8, label: 'verb:architected' },
  { pattern: /\b(?:optimized|optim(?:ize|ising|iz(?:ed|ing)))\b/i, weight: 8, label: 'verb:optimized' },
  { pattern: /\b(?:automated|automat(?:e|ing|ed))\b/i, weight: 8,  label: 'verb:automated' },
  { pattern: /\b(?:led|leading|managed|manage[ds]?)\b/i, weight: 8, label: 'verb:led-managed' },
  { pattern: /\b(?:collaborated|collaborat(?:e|ing|ed))\b/i, weight: 6, label: 'verb:collaborated' },
  { pattern: /\b(?:maintained|maintain(?:ing|ed)?)\b/i, weight: 6, label: 'verb:maintained' },
  { pattern: /\b(?:integrated|integrat(?:e|ing|ed))\b/i, weight: 6, label: 'verb:integrated' },
  { pattern: /\b(?:tested|test(?:ing|ed)?)\b/i,   weight: 6,  label: 'verb:tested' },
  { pattern: /\b(?:refactored|refactor(?:ing|ed)?)\b/i, weight: 6, label: 'verb:refactored' },

  // ── Tier E: Projects / personal work ─────────────────────────────────────
  { pattern: /\bproject[s]?\b/i,                  weight: 6,  label: 'projects' },
  { pattern: /\bpersonal\s+project[s]?\b/i,       weight: 8,  label: 'personal-projects' },
  { pattern: /\bopen[\s\-]?source\b/i,            weight: 8,  label: 'open-source' },
  { pattern: /\bgithub\.com\/\S+/i,               weight: 8,  label: 'github-url' },
  { pattern: /\bhttps?:\/\/\S+/i,                 weight: 4,  label: 'live-url' },
  { pattern: /\bside\s+project[s]?\b/i,           weight: 6,  label: 'side-projects' },
  { pattern: /\bhackathon[s]?\b/i,                weight: 6,  label: 'hackathon' },
  { pattern: /\bcapstone\b/i,                     weight: 6,  label: 'capstone' },
  { pattern: /\bportfolio\b/i,                    weight: 6,  label: 'portfolio' },

  // ── Tier F: Academic / leadership / supporting ───────────────────────────
  { pattern: /\b(?:research(?:er|ed)?|published|publication[s]?)\b/i, weight: 6, label: 'research' },
  { pattern: /\bvolunteer(?:ed|ing)?\b/i,         weight: 4,  label: 'volunteer' },
  { pattern: /\b(?:thesis|dissertation)\b/i,      weight: 4,  label: 'academic-project' },
  { pattern: /\b(?:club|society|association|team\s+lead)\b/i, weight: 4, label: 'leadership' },
  { pattern: /\b\d+\+?\s*(?:years?|months?)\b/i,  weight: 6,  label: 'duration-mention' },
  { pattern: /\b(?:reduced|improved|increased|saved|grew)\b.*\b\d+\s*%/i, weight: 10, label: 'quantified-impact' },
];

/**
 * Score resume text against EXPERIENCE_INDICATORS.
 *
 * Each pattern contributes its weight **once** (i.e. the test is boolean,
 * not a count), so a resume that uses "developed" 20 times scores the same
 * as one that uses it once — preventing keyword-stuffing inflation.
 *
 * The raw point total is normalised to 0–100 using a ceiling that represents
 * a "well-rounded" resume (Tier A + several action verbs + projects = ~80 pts).
 *
 * @param  {string} rawText  Original resume text (un-normalized)
 * @returns {{ score: number, breakdown: Array<{label, weight}> }}
 */
function scoreExperienceIndicators(rawText) {
  const text = String(rawText || '');
  let total = 0;
  const breakdown = [];

  for (const { pattern, weight, label } of EXPERIENCE_INDICATORS) {
    if (pattern.test(text)) {
      total += weight;
      breakdown.push({ label, weight });
    }
  }

  // Normalise: 80 raw pts → 100%.  Scores above 80 still cap at 100.
  const SCORE_CEILING = 80;
  const score = Math.min(Math.round((total / SCORE_CEILING) * 100), 100);
  return { score, breakdown };
}

/** Split resume into bullet-like fragments (≥3 words) */
function splitResumeFragments(text) {
  return text
    .replace(/[•●▪►·→⇒]/g, '\n')
    .replace(/\r\n|\r/g, '\n')
    .replace(/\t/g, ' ')
    .split(/\n+/)
    .map(f => f.trim().replace(/\s+/g, ' '))
    .filter(f => f.split(/\s+/).length >= 3)
    .slice(0, 60);
}

/**
 * Score how well resume experience aligns with JD responsibilities.
 * Falls back to raw token overlap when no structured responsibilities are found.
 *
 * The final percent is blended with the indicator-based score so that
 * internship / freelance / project-heavy resumes are not under-penalised
 * when their bullet language doesn't closely mirror the JD wording.
 */
function computeExperienceRelevance(responsibilities, bullets, jdTokenSet, resumeTokenSet, rawResumeText) {
  // ── Indicator-based floor (independent of JD content) ───────────────────
  const { score: indicatorScore } = scoreExperienceIndicators(rawResumeText || '');

  // ── JD-alignment signal ──────────────────────────────────────────────────
  let alignmentScore;

  // Fallback: token-overlap when responsibilities/bullets couldn't be extracted
  if (!responsibilities.length || !bullets.length) {
    if (jdTokenSet && resumeTokenSet && jdTokenSet.size > 0) {
      let shared = 0;
      for (const t of jdTokenSet) if (resumeTokenSet.has(t)) shared++;
      const ratio = shared / jdTokenSet.size;
      alignmentScore = Math.round(Math.min(ratio * 1.5, 1) * 100);
    } else {
      alignmentScore = 0;
    }
    // Blend: 55% indicator floor  +  45% alignment signal
    const blended = Math.round(indicatorScore * 0.55 + alignmentScore * 0.45);
    return { percent: Math.min(blended, 100), matches: [] };
  }

  const bestScores = [];
  const matches = [];

  for (const resp of responsibilities) {
    let best = { responsibility: resp, bestBullet: '', score: 0 };
    for (const bullet of bullets) {
      const s = semanticSimilarity(resp, bullet);
      if (s > best.score) best = { responsibility: resp, bestBullet: bullet, score: s };
    }
    bestScores.push(best.score);
    matches.push(best);
  }

  const avg      = bestScores.reduce((s, v) => s + v, 0) / bestScores.length;
  const coverage = bestScores.filter(s => s >= 0.12).length / bestScores.length;

  // Bullet-similarity signal
  let blended = avg * 0.55 + coverage * 0.45;

  // Token-overlap boost
  if (jdTokenSet && resumeTokenSet && jdTokenSet.size > 0) {
    let shared = 0;
    for (const t of jdTokenSet) if (resumeTokenSet.has(t)) shared++;
    const tokenOverlap = shared / jdTokenSet.size;
    blended = blended * 0.65 + tokenOverlap * 0.35;
  }

  alignmentScore = Math.round(Math.min(1, blended * 1.4) * 100);

  // ── Final blend ──────────────────────────────────────────────────────────
  // 40% indicator floor  +  60% JD-alignment signal
  // The indicator floor prevents projects/internships from scoring near 0
  // when JD language doesn't directly match resume bullet phrasing.
  const finalPercent = Math.min(
    Math.round(indicatorScore * 0.40 + alignmentScore * 0.60),
    100,
  );

  return {
    percent: finalPercent,
    matches: matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(m => ({ responsibility: m.responsibility, evidence: m.bestBullet, score: Math.round(m.score * 100) })),
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §13  PRIORITY TARGETS & REWRITE BLUEPRINTS
// ═══════════════════════════════════════════════════════════════════════════════

const ACTION_VERBS = ['Architected', 'Built', 'Optimized', 'Automated', 'Delivered', 'Implemented'];

function inferActionZone(term, type, category) {
  if (type === 'skill' && category === 'soft')  return 'Summary + Experience';
  if (type === 'skill' && category === 'tools') return 'Skills + Projects';
  if (type === 'skill' && category === 'cloud') return 'Projects + Experience';
  if (term.split(' ').length >= 3)              return 'Summary + Experience';
  return 'Experience Bullets';
}

function explainPriority(term, type, category) {
  if (type === 'skill' && category === 'cloud') return 'Infrastructure and deployment terms are strong ATS filters for engineering roles.';
  if (type === 'skill' && category === 'data')  return 'Data and ML skills usually appear in hard filter logic and recruiter keyword scans.';
  if (type === 'skill' && category === 'soft')  return 'This term improves recruiter perception when paired with a concrete delivery example.';
  if (term.split(' ').length >= 2)              return 'This multi-word phrase is likely used as a deliberate requirement in the job post.';
  return 'This is a direct job-description keyword that can lift ATS matching when stated naturally.';
}

function buildPriorityTargets(missingSkills, missingKeywords, jdText) {
  const normJD = normalizeAnalysisText(jdText);
  const seen = new Set();
  const candidates = [];

  const add = (term, type) => {
    // Normalize before the seen check so "sql" and "SQL" are treated as the same entry.
    const normKey = normalizeSkill(term);
    if (!normKey || seen.has(normKey)) return;
    seen.add(normKey);
    const key = normKey;
    const category = getSkillCategory(key);
    const occ = (normJD.match(new RegExp(escapeRegExp(key), 'g')) || []).length;
    const impact = Math.min(
      (type === 'skill' ? 18 : 8) +
      Math.min(occ * 10, 30) +
      (term.includes(' ') ? 9 : 0) +
      (category === 'cloud' || category === 'data' ? 10 : category ? 6 : 0) + 32,
      98,
    );
    candidates.push({ term: key, type, category, impact, actionZone: inferActionZone(key, type, category), rationale: explainPriority(key, type, category) });
  };

  missingSkills.forEach(s => add(s, 'skill'));
  missingKeywords.slice(0, 12).forEach(k => add(k, 'keyword'));

  return candidates.sort((a, b) => b.impact - a.impact).slice(0, 6);
}

function pickSupportingSkills(term, matched, resume) {
  const cat = getSkillCategory(term);
  const pool = matched.filter(s => getSkillCategory(s) === cat);
  const src = pool.length ? pool : matched.length ? matched : resume;
  return src.filter(s => s !== term).slice(0, 2);
}

function findBestFragment(fragments, term, supports) {
  const termRx = new RegExp(`(?:^|\\s)${escapeRegExp(normalizeSkill(term))}(?=\\s|$)`, 'i');
  let best = '', bestScore = -1;
  for (const f of fragments) {
    const nf = normalizeAnalysisText(f);
    let score = Math.min(f.length / 12, 12);
    if (termRx.test(nf)) score += 20;
    for (const s of supports) if (nf.includes(normalizeSkill(s))) score += 8;
    if (/\d/.test(f)) score += 4;
    if (score > bestScore) { bestScore = score; best = f; }
  }
  return best;
}

function buildRewriteBlueprints(resumeTxt, targets, matchedSkills, resumeSkills) {
  const frags = splitResumeFragments(resumeTxt);

  return targets.slice(0, 3).map((tgt, i) => {
    const supports = pickSupportingSkills(tgt.term, matchedSkills, resumeSkills);
    const evidence = findBestFragment(frags, tgt.term, supports);
    const supportPhrase = supports.length ? ` using ${supports.map(formatSkillName).join(' and ')}` : '';
    const metric = i % 2 === 0 ? 'improved [key metric] by [X]%' : 'reduced [time/cost/error rate] by [X]%';

    let template;
    if (tgt.category === 'soft') {
      template = `${ACTION_VERBS[i % ACTION_VERBS.length]} cross-functional initiatives that emphasized ${formatSkillName(tgt.term)}, aligned stakeholders around delivery goals, and ${metric}.`;
    } else if (tgt.category === 'tools') {
      template = `${ACTION_VERBS[i % ACTION_VERBS.length]} team workflows in ${formatSkillName(tgt.term)}${supportPhrase}, increased execution visibility, and ${metric}.`;
    } else {
      template = `${ACTION_VERBS[i % ACTION_VERBS.length]} [project, platform, or process] with focus on ${formatSkillName(tgt.term)}${supportPhrase}, and ${metric}.`;
    }

    return {
      title: `Inject ${formatSkillName(tgt.term)}`,
      targetTerm: tgt.term,
      section: tgt.actionZone,
      evidence: evidence || 'No strong evidence line detected. Add this to your strongest project or experience bullet.',
      template,
      reason: `This term carries an estimated ${tgt.impact}% impact because it appears central to the job requirements.`,
    };
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// §14  INSIGHTS & SUGGESTIONS GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

function generateInsights({ atsScore, missingSkills, missingKeywords, keywordMatchRatio,
                            skillMatchRatio, experienceRatio, resumeLength, detectedSections }) {
  const insights = [];

  if (missingKeywords.length > 5) {
    insights.push({
      type: 'warn', icon: '🔑',
      title: 'Missing Important Keywords',
      desc: `Your resume is missing ${missingKeywords.length} key terms from the job description. Incorporating terms like "${missingKeywords.slice(0, 3).join('", "')}" could significantly improve your ATS score.`,
    });
  }

  if (skillMatchRatio < 0.5) {
    insights.push({
      type: 'error', icon: '⚡',
      title: 'Skills Mismatch Detected',
      desc: `Only ${Math.round(skillMatchRatio * 100)}% of required skills are present in your resume. This is a major red flag for ATS systems and recruiters.`,
    });
  }

  if (experienceRatio < 0.3) {
    insights.push({
      type: 'error', icon: '◉',
      title: 'Weak Experience Alignment',
      desc: `Your resume content has low overlap (${Math.round(experienceRatio * 100)}%) with the job description. Consider rewording your experience to mirror the language used in the posting.`,
    });
  }

  if (resumeLength < 250) {
    insights.push({
      type: 'info', icon: '📄',
      title: 'Resume Appears Short',
      desc: 'ATS systems may score a short resume lower due to insufficient content. Aim for 400–600 words with detailed descriptions.',
    });
  }

  if (detectedSections) {
    const missing = Object.entries(detectedSections).filter(([, v]) => !v).map(([k]) => k);
    if (missing.length >= 2) {
      insights.push({
        type: 'warn', icon: '📋',
        title: 'Missing Resume Sections',
        desc: `Your resume is missing standard sections: ${missing.join(', ')}. ATS systems expect these to parse your resume correctly.`,
      });
    }
  }

  if (atsScore >= 70) {
    insights.push({
      type: 'tip', icon: '🚀',
      title: 'Strong ATS Compatibility',
      desc: `Your resume has a ${atsScore}% match, which is competitive. Focus on quantifying achievements (e.g., "reduced costs by 30%") to stand out further.`,
    });
  }

  if (missingSkills.length > 3) {
    insights.push({
      type: 'warn', icon: '🎯',
      title: 'Critical Skill Gaps',
      desc: `${missingSkills.length} skills required by this job are absent from your resume. Adding even basic proficiency mentions can help pass ATS filters.`,
    });
  }

  return insights.slice(0, 4);
}

/**
 * Detects positive signals in resume text and returns a list of strength cards.
 * Inputs are already-computed values from analyzeResume() so no re-parsing needed.
 *
 * @param {string}   rawText       - Raw resume text (for regex pattern matching)
 * @param {string[]} resumeSkills  - Canonical skill keys detected on the resume
 * @param {number}   atsScore      - Composite ATS score 0-100
 * @param {number}   skillMatchScore - Skill match % 0-100
 * @param {Object}   detectedSections - {summary, skills, experience, education, projects}
 * @returns {{ icon: string, title: string, desc: string }[]}
 */
function generateStrengths({ rawText, resumeSkills, atsScore, skillMatchScore, detectedSections }) {
  const strengths = [];
  const text = rawText || '';

  // ── 1. Skill count ──────────────────────────────────────────────────────────
  // Thresholds: >= 15 extensive | >= 10 strong | >= 5 solid | >= 3 core
  const skillCount = resumeSkills.length;
  if (skillCount >= 15) {
    strengths.push({ icon: '🚀', title: 'Extensive Technical Skillset',
      desc: `Your resume lists ${skillCount} distinct skills — a strong indicator of broad technical depth that stands out to ATS systems and recruiters.` });
  } else if (skillCount >= 10) {
    strengths.push({ icon: '💡', title: 'Strong Technical Skillset',
      desc: `${skillCount} skills detected — well above average for most applicants and a clear positive signal for technical role screening.` });
  } else if (skillCount >= 5) {
    strengths.push({ icon: '⚙️', title: 'Solid Technical Skillset',
      desc: `You have ${skillCount} skills on record, giving your resume a well-rounded technical profile.` });
  } else if (skillCount >= 3) {
    strengths.push({ icon: '🛠', title: 'Core Skills Present',
      desc: `${skillCount} relevant skills detected. A focused, targeted skillset can still score well when aligned to the role.` });
  }

  // ── 2. Project count ────────────────────────────────────────────────────────
  // Count the literal word "project/projects" as the primary signal,
  // then action-verb count as a secondary richness indicator.
  const projectWordCount = (text.match(/\bprojects?\b/gi) || []).length;
  const actionVerbCount  = (text.match(
    /\b(?:built|developed|created|designed|deployed|implemented|launched)\b/gi
  ) || []).length;

  if (projectWordCount > 2 || actionVerbCount >= 8) {
    strengths.push({ icon: '📂', title: 'Multiple Technical Projects',
      desc: `${projectWordCount} project reference${projectWordCount !== 1 ? 's' : ''} detected alongside ${actionVerbCount} build/delivery verbs. Hands-on project depth is a top positive signal for technical roles.` });
  } else if (projectWordCount > 0 || actionVerbCount >= 3) {
    strengths.push({ icon: '📁', title: 'Project Experience Shown',
      desc: 'Your resume references real project work, which helps demonstrate practical skills beyond certifications or coursework.' });
  }

  // ── 3. Internship / freelance / professional work ───────────────────────────
  if (/\bintern(?:ship|ed)?\b/i.test(text)) {
    strengths.push({ icon: '🏢', title: 'Industry Exposure Through Internship',
      desc: 'Internship experience on your resume signals workplace readiness and real-world exposure to employers.' });
  }
  if (/\bfreelance[rd]?\b|\bconsult(?:ant|ing|ed)?\b|\bcontract(?:or|ing)?\b|\bself[\s\-]?employed\b/i.test(text)) {
    strengths.push({ icon: '💼', title: 'Freelance / Contract Work',
      desc: 'Independent work history demonstrates initiative, client communication, and the ability to deliver without direct supervision.' });
  }
  if (/\b(?:full[\s\-]?time|senior|lead|architect|manager|staff)\b/i.test(text)) {
    strengths.push({ icon: '🏆', title: 'Professional Employment History',
      desc: 'Full-time or senior-level employment signals solid career progression and production-grade experience.' });
  }

  // ── 4. AI / ML experience ────────────────────────────────────────────────────
  if (/\b(?:machine\s*learning|deep\s*learning|neural\s*network|nlp|computer\s*vision|tensorflow|pytorch|keras|llm|gpt|bert|hugging\s*face|ai\s+project|ml\s+model|artificial\s+intelligence)\b/i.test(text)) {
    strengths.push({ icon: '🤖', title: 'AI / ML Development Experience',
      desc: 'Mentions of AI or machine learning work are high-signal keywords that strongly differentiate candidates in technical hiring pipelines.' });
  }

  // ── 5. Full-stack experience ────────────────────────────────────────────────
  // Positive if resume contains both a recognised frontend AND backend technology.
  const hasFrontend = /\b(?:react(?:js)?|angular|vue(?:js)?|svelte|nextjs|html|css|tailwind|bootstrap|jquery|typescript)\b/i.test(text);
  const hasBackend  = /\b(?:node(?:js)?|express(?:js)?|django|flask|fastapi|spring(?:boot)?|laravel|rails|nestjs|asp\.net|php)\b/i.test(text);
  if (hasFrontend && hasBackend) {
    strengths.push({ icon: '🔀', title: 'Full-Stack Experience',
      desc: 'Both frontend and backend technologies detected (e.g. React + Node.js). Full-stack fluency is a high-value signal for product and startup roles.' });
  }

  // ── 6. Open-source / public work ────────────────────────────────────────────
  if (/\bopen[\s\-]?source\b|\bgithub\.com\/\S+|\bcontribut(?:ed|ing|or)\b/i.test(text)) {
    strengths.push({ icon: '🌐', title: 'Open-Source Contributions',
      desc: 'Public contributions or a GitHub presence demonstrate initiative and allow employers to verify your code quality directly.' });
  }

  // ── 7. Quantified impact ────────────────────────────────────────────────────
  if (/\b\d+\s*%|\b(?:increased|reduced|improved|saved|scaled|grew)[^.]*\d+/i.test(text)) {
    strengths.push({ icon: '📊', title: 'Quantified Achievements',
      desc: 'Your resume uses numbers and percentages to describe impact. Quantified results are among the highest-value signals for both ATS and human reviewers.' });
  }

  // ── 8. Hackathon / competition ───────────────────────────────────────────────
  if (/\bhackathon[s]?\b|\bcompetition\b|\baward(?:ed)?\b|\bwon\b|\bwinner\b|\bprize\b/i.test(text)) {
    strengths.push({ icon: '🥇', title: 'Hackathons or Awards',
      desc: 'Competitive achievements demonstrate drive, fast execution, and the ability to perform under pressure — qualities recruiters actively look for.' });
  }

  // ── 9. Education credentials ────────────────────────────────────────────────
  if (/\b(?:bachelor|master|b\.?tech|m\.?tech|b\.?e\.?|m\.?s\.?|b\.?sc|phd|doctorate|degree)\b/i.test(text)) {
    strengths.push({ icon: '🎓', title: 'Formal Education Credential',
      desc: 'A declared degree or qualification meets the baseline requirement for most technical job postings and filters.' });
  }

  // ── 10. Resume structure completeness ──────────────────────────────────────
  if (detectedSections) {
    const sectionCount = Object.values(detectedSections).filter(Boolean).length;
    if (sectionCount >= 4) {
      strengths.push({ icon: '📋', title: 'Well-Structured Resume',
        desc: `${sectionCount} of ${Object.keys(detectedSections).length} standard sections detected. A complete structure makes parsing easier for ATS.` });
    }
  }

  // ── 11. ATS score bracket ───────────────────────────────────────────────────
  if (atsScore >= 75) {
    strengths.push({ icon: '✅', title: 'High ATS Compatibility',
      desc: `An ATS score of ${atsScore}% places you in the top tier for automated screening. Most positions filter candidates below 60%.` });
  } else if (atsScore >= 55) {
    strengths.push({ icon: '👍', title: 'Competitive ATS Score',
      desc: `${atsScore}% ATS compatibility — a solid foundation. Closing a few keyword and skill gaps could push you into the top band.` });
  }

  return strengths.slice(0, 6);
}

function generateSuggestions({ atsScore, missingSkills, resumeLength, missingKeywords, detectedSections, resumeSkills }) {
  const suggestions = [];

  // Filter out any keyword that is already present as a detected resume skill.
  // Uses a Set for O(1) lookups: filteredMissing = missingKeywords − detectedSkills
  const detectedSkillSet = new Set((resumeSkills || []).map(s => s.toLowerCase()));
  const filteredMissing = [...new Set(
    missingKeywords.filter(kw => !detectedSkillSet.has(kw.toLowerCase()))
  )];

  if (atsScore < 40) {
    suggestions.push({ icon: '🎯', text: 'Your resume needs significant tailoring. Rewrite your summary section to directly address the job requirements and include relevant keywords.' });
  } else if (atsScore < 60) {
    suggestions.push({ icon: '📝', text: 'Customize your resume further by incorporating more keywords from the job description into your experience bullet points.' });
  } else if (atsScore >= 80) {
    suggestions.push({ icon: '🌟', text: 'Excellent ATS alignment! Focus on making achievements more quantifiable (e.g., "Increased performance by 40%").' });
  }

  suggestions.push({ icon: '📊', text: 'Add measurable achievements with numbers and metrics. Both ATS systems and recruiters favor quantifiable impact statements.' });

  if (missingSkills.length > 0) {
    const top3 = missingSkills.slice(0, 3).map(capitalizeSkill).join(', ');
    suggestions.push({ icon: '🛠', text: `Add these in-demand skills if you have them: ${top3}. Even beginner-level exposure is worth mentioning.` });
  }

  suggestions.push({ icon: '💪', text: 'Use strong action verbs like "Architected", "Spearheaded", "Optimized", "Automated" to begin bullet points.' });

  if (filteredMissing.length > 3) {
    const topKw = filteredMissing.slice(0, 4).join(', ');
    suggestions.push({ icon: '🔑', text: `Include these missing technical keywords naturally: "${topKw}".` });
  }

  if (detectedSections) {
    if (!detectedSections.summary) {
      suggestions.push({ icon: '📋', text: 'Add a Professional Summary/Objective section at the top of your resume. ATS systems prioritize keywords found here.' });
    }
    if (!detectedSections.projects) {
      suggestions.push({ icon: '📂', text: 'Add a Projects section to showcase practical experience. Include the problem, approach, technologies, and measurable results.' });
    }
    if (!detectedSections.skills) {
      suggestions.push({ icon: '🧩', text: 'Add a dedicated Skills section listing your technical skills. ATS parsers specifically look for a labeled skills block.' });
    }
  }

  if (resumeLength < 250) {
    suggestions.push({ icon: '📄', text: 'Your resume appears short. Add more detail to experience descriptions and include a professional summary section.' });
  }

  suggestions.push({ icon: '🔤', text: 'Avoid tables, columns, headers/footers, or images — they confuse ATS parsers. Use simple, clean formatting.' });

  // Deduplicate suggestions by text before slicing, in case any two branches produced the same message.
  const seenTexts = new Set();
  const uniqueSuggestions = suggestions.filter(s => {
    if (seenTexts.has(s.text)) return false;
    seenTexts.add(s.text);
    return true;
  });
  return uniqueSuggestions.slice(0, 6);
}


// ═══════════════════════════════════════════════════════════════════════════════
// §15  MAIN ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Weighted ATS score formula (all inputs are 0–100):
 *   40% Skill Match  +  30% Keyword Match  +  20% Experience  +  10% Structure
 * Returns a rounded integer in [0, 100].
 */
function computeAtsScore(skillScore, keywordScore, experienceScore, structureScore) {
  const raw = (
    (skillScore     / 100) * 0.40 +
    (keywordScore   / 100) * 0.30 +
    (experienceScore / 100) * 0.20 +
    (structureScore / 100) * 0.10
  );
  return Math.min(Math.round(raw * 100), 100);
}

function analyzeResume(resumeTxt, jobDescTxt) {
  // Keep raw text for structural extraction (needs newlines/bullets intact)
  const rawResume = resumeTxt;
  const rawJD     = jobDescTxt;

  // 1. Clean input for keyword/skill matching
  resumeTxt  = cleanText(resumeTxt);
  jobDescTxt = cleanText(jobDescTxt);

  // 2. Extract JD structure (keywords, skills, responsibilities)
  //    Pass raw JD for responsibility extraction (needs line structure)
  const { keywordObjects: jdKeywordObjects, responsibilities: jdResponsibilities, jdSkills } =
    extractJobKeywordObjects(jobDescTxt, 70, rawJD);

  // 3. Build resume search index
  const resumeIndex = buildResumeIndex(resumeTxt);

  // 4. Extract resume skills, then expand via skill relationship inference.
  //    e.g. "GitHub" on a resume automatically credits "Git";
  //         "Express" credits "Node.js" and "JavaScript"; etc.
  const resumeSkills = applySkillImplications(extractSkills(resumeTxt));

  // ── Skill matching ──
  const matchedSkills = [...new Set(jdSkills.filter(sk => resumeSkills.includes(sk)))];
  const missingSkills = [...new Set(jdSkills.filter(sk => !resumeSkills.includes(sk)))];

  // ── Keyword matching (exact → n-gram → partial → semantic) ──
  const matchedKwDetails = [];
  const missingKwDetails = [];
  for (const obj of jdKeywordObjects) {
    const result = matchKeywordToResume(obj, resumeIndex);
    (result.matched ? matchedKwDetails : missingKwDetails).push({ ...obj, ...result });
  }

  const highValueTypes = new Set(['skill', 'industry', 'certification', 'qualification', 'verb']);

  const matchedKeywords = [...new Set(
    matchedKwDetails.sort((a, b) => (b.score * b.weight) - (a.score * a.weight)).map(k => k.display),
  )];

  const missingKeywordsAll = [...new Set([
    ...missingKwDetails.filter(k => highValueTypes.has(k.type)).sort((a, b) => (b.weight * b.occurrences) - (a.weight * a.occurrences)),
    ...missingKwDetails.filter(k => !highValueTypes.has(k.type)).sort((a, b) => (b.weight * b.occurrences) - (a.weight * a.occurrences)),
  ].map(k => k.display))];

  const jdKeywords = jdKeywordObjects.slice(0, 40).map(k => k.display);

  // ── Filter detected resume skills out of missing-keyword lists ──
  // Prevents already-present skills from appearing in rewrite blueprints,
  // insights, and suggestions (e.g. "Inject Git" when Git is already detected).
  const detectedSkillSet = new Set(resumeSkills.map(s => s.toLowerCase()));
  // Case-insensitive dedup: track seen lowercase keys while preserving original display.
  const filteredSeenKeys = new Set();
  const filteredMissingKeywords = missingKeywordsAll.filter(kw => {
    const lower = kw.toLowerCase();
    if (detectedSkillSet.has(lower) || filteredSeenKeys.has(lower)) return false;
    filteredSeenKeys.add(lower);
    return true;
  });

  // ── Priority targets & rewrite blueprints ──
  const priorityTargets   = buildPriorityTargets(missingSkills, filteredMissingKeywords, jobDescTxt);
  const rewriteBlueprints = buildRewriteBlueprints(resumeTxt, priorityTargets, matchedSkills, resumeSkills);

  // ── Scores ──
  const resumeLength = resumeTxt.split(/\s+/).length;

  // ── Keyword coverage ────────────────────────────────────────────────────────
  // Two complementary signals are blended for accuracy:
  //
  //  A) Weighted ratio — accounts for synonym/partial/semantic matches and
  //     differences in keyword importance.  Tends to be generous.
  //
  //  B) Count-based ATS ratio — pure (matched / total) formula applied to
  //     a normalized, stop-word-filtered token set.  Precise and transparent.
  //
  // Final blend: 60% weighted  +  40% count-based
  // This prevents inflation from low-confidence partial matches while still
  // crediting synonym and multi-word phrase hits that a raw token scan misses.

  const kwTotalWeight    = jdKeywordObjects.reduce((s, k) => s + k.weight, 0) || 1;
  const kwMatchedWeight  = matchedKwDetails.reduce((s, k) => s + k.weight * Math.min(1, k.score), 0);
  const weightedRatio    = kwMatchedWeight / kwTotalWeight;

  // Count-based ATS pass — delegate to analyzeKeywords() which implements the
  // exact (matched / total) × 100 formula with full normalization, stop-word
  // filtering, and synonym collapse.  Also gives us totalJDKeywords and
  // topMissingKeywords (importance-ranked) for the report output.
  const kwAnalysis = analyzeKeywords(resumeTxt, jobDescTxt);
  const countRatio = kwAnalysis.keywordScore / 100;

  // Blended final ratio used by the ATS composite formula:
  // 60% weighted (credits synonyms / partial / semantic matches) +
  // 40% count-based (precise, transparent, mirrors real ATS behaviour)
  const keywordRatio  = Math.max(0, Math.min(1, weightedRatio * 0.60 + countRatio * 0.40));

  // Skill match ratio
  const skillRatio = jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : 0;

  // Experience relevance — use raw text for fragment splitting (needs newlines)
  const resumeBullets  = splitResumeFragments(rawResume);
  const jdTokenSet     = new Set(tokenizeForSimilarity(jobDescTxt));
  const resumeTokenSet = new Set(tokenizeForSimilarity(resumeTxt));
  const experience     = computeExperienceRelevance(jdResponsibilities, resumeBullets, jdTokenSet, resumeTokenSet, rawResume);
  const experienceRatio = Math.max(0, Math.min(1, experience.percent / 100));

  // Section detection
  const detectedSections = detectResumeSections(resumeTxt);
  const sectionCount  = Object.values(detectedSections).filter(Boolean).length;
  const totalSections = Object.keys(RESUME_SECTIONS).length;
  const sectionFactor = sectionCount / totalSections;

  // Resume quality analysis (bullets, metrics, action verbs)
  const resumeQuality = analyzeResumeQuality(rawResume);
  const qualityFactor = resumeQuality.structureScore / 100;   // 0–1

  // Content quality & completeness
  const lengthFactor   = Math.min(resumeLength / 500, 1);
  const contentQuality = lengthFactor * 0.4 + sectionFactor * 0.3 + qualityFactor * 0.3;
  const skillVariety   = Math.min(resumeSkills.length / 12, 1);
  const completeness   = skillVariety * 0.5 + sectionFactor * 0.5;

  // ATS composite score
  //
  // Weights: 40% Skill Match | 30% Keyword Match | 20% Experience | 10% Resume Structure
  // Structure = content quality (7%) + completeness (3%)
  const rawScore = computeAtsScore(skillRatio * 100, keywordRatio * 100, experienceRatio * 100, contentQuality * 100 * 0.7 + completeness * 100 * 0.3);
  const atsScore = Math.min(rawScore, 99);

  const skillMatchScore      = Math.round(skillRatio * 100);
  const experienceRelevance  = experience.percent;
  // keywordOptimization uses the analyzeKeywords formula: (matched / total) × 100
  // This is the clean, transparent ATS count-based score shown in the report.
  // keywordRatio (blended) is kept separately for the ATS composite calculation.
  const keywordOptimization  = kwAnalysis.keywordScore;

  // Rejection risk
  let rejectionRisk;
  if (atsScore >= 75 && skillMatchScore >= 70 && experienceRelevance >= 60) rejectionRisk = 'Low';
  else if (atsScore >= 60 && (skillMatchScore >= 55 || experienceRelevance >= 50)) rejectionRisk = 'Medium';
  else if (atsScore >= 45) rejectionRisk = 'High';
  else rejectionRisk = 'Very High';

  // Strength level
  const strengthLevel =
    (resumeLength > 300 ? 1 : 0) +
    (resumeSkills.length > 8 ? 1 : 0) +
    (jdKeywords.length > 15 ? 1 : 0) +
    (atsScore > 60 ? 1 : 0) +
    (resumeSkills.length > 15 ? 1 : 0);

  // ── Section scores (bar chart) ──
  const sectionScores = {
    Skills:       skillMatchScore,
    Keywords:     keywordOptimization,
    Experience:   experienceRelevance,
    Content:      Math.round(contentQuality * 100),
    Completeness: Math.round(completeness * 100),
  };

  // ── Radar data ──
  const radarData = {
    labels: ['Technical Skills', 'Domain Keywords', 'Content Depth', 'Skill Variety', 'Job Alignment', 'Completeness'],
    resume: [
      skillMatchScore,
      keywordOptimization,
      Math.round(contentQuality * 100),
      Math.min(Math.round((resumeSkills.length / 20) * 100), 100),
      experienceRelevance,
      Math.round(completeness * 100),
    ],
    job: [100, 100, 100, 100, 100, 100],
  };

  // ── Line chart data ──
  const lineData = {
    labels: ['Keywords', 'Skills', 'Experience', 'Content', 'Sections', 'Impact'],
    values: [
      keywordOptimization,
      skillMatchScore,
      experienceRelevance,
      Math.round(contentQuality * 100),
      Math.round(sectionFactor * 100),
      atsScore,
    ],
  };

  // ── Skill category breakdown ──
  const skillCategories = {};
  for (const [cat, catSkills] of Object.entries(SKILL_CATEGORIES)) {
    const jdCat     = jdSkills.filter(s => catSkills.includes(s));
    const matchCat  = matchedSkills.filter(s => catSkills.includes(s));
    if (jdCat.length > 0) {
      skillCategories[cat] = {
        matched: matchCat.length,
        total: jdCat.length,
        percent: Math.round((matchCat.length / jdCat.length) * 100),
      };
    }
  }

  // ── Insights & Suggestions ──
  const insights   = generateInsights({
    atsScore, missingSkills, missingKeywords: filteredMissingKeywords, keywordMatchRatio: keywordRatio,
    skillMatchRatio: skillRatio, experienceRatio, resumeLength, detectedSections,
  });

  const strengths = generateStrengths({
    rawText: rawResume, resumeSkills, atsScore, skillMatchScore, detectedSections,
  });

  const suggestions = generateSuggestions({
    atsScore, matchedSkills, missingSkills, resumeLength,
    strengthLevel, keywordMatchRatio: keywordRatio, missingKeywords: filteredMissingKeywords,
    detectedSections, resumeSkills,
  });

  // ── Return full results object ──
  return {
    atsScore,
    skillMatchScore,
    experienceRelevance,
    keywordOptimization,
    rejectionRisk,
    // ── analyzeKeywords integration ──
    totalJDKeywords:    kwAnalysis.totalJDKeywords,
    topMissingKeywords: kwAnalysis.topMissingKeywords,
    matchedKeywords,
    missingKeywords: missingKeywordsAll.slice(0, 15),
    matchedSkills,
    missingSkills,
    matchedSkillsByGroup: classifySkillsByGroup(matchedSkills),
    missingSkillsByGroup: classifySkillsByGroup(missingSkills),
    jdKeywords,
    resumeSkills,
    jdKeywordDetails: jdKeywordObjects,
    matchedKeywordDetails: matchedKwDetails.slice(0, 120),
    experienceEvidence: experience.matches,
    priorityTargets,
    rewriteBlueprints,
    strengthLevel,
    detectedSections,
    sectionScores,
    radarData,
    lineData,
    skillCategories,
    insights,
    strengths,
    suggestions,
    resumeQuality,
    // ── New AI Career Intelligence features ──
    recommendedRoles: recommendJobRoles(resumeSkills),
    interviewProbability: computeInterviewProbability(atsScore, skillMatchScore, keywordOptimization, experienceRelevance),
    resumeImprovements: generateResumeImprovements(rawResume),
    recruiterRisks: generateRecruiterRisks({
      missingSkills, matchedSkills, skillMatchScore, keywordOptimization,
      experienceRelevance, atsScore, resumeQuality, detectedSections, resumeLength,
    }),
    skillGapRoadmap: generateSkillGapRoadmap(missingSkills, jobDescTxt),
    stats: {
      resumeWordCount: resumeLength,
      jdWordCount: jobDescTxt.split(/\s+/).length,
      totalKeywords: jdKeywordObjects.length,
    },
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §16  AI CAREER INTELLIGENCE — JOB ROLE RECOMMENDATION
// ═══════════════════════════════════════════════════════════════════════════════

const JOB_ROLE_RULES = [
  { role: 'Frontend Developer',       icon: '🎨', skills: ['reactjs','angular','vuejs','svelte','nextjs','css','tailwind','html','javascript','typescript'], minMatch: 3 },
  { role: 'Backend Developer',        icon: '⚙️', skills: ['nodejs','express','nestjs','django','flask','fastapi','spring','springboot','laravel','rails','java','python','go','rust','csharp','php'], minMatch: 3 },
  { role: 'Full Stack Developer',     icon: '🔀', skills: ['reactjs','angular','vuejs','nodejs','express','nextjs','mongodb','postgresql','mysql','javascript','typescript'], minMatch: 4, requireBoth: {front:['reactjs','angular','vuejs','svelte','nextjs'],back:['nodejs','express','django','flask','fastapi','spring','nestjs','laravel','rails']} },
  { role: 'AI / ML Engineer',         icon: '🤖', skills: ['machinelearning','deeplearning','tensorflow','pytorch','keras','scikitlearn','nlp','computervision','neuralnetwork','python','numpy','pandas'], minMatch: 3 },
  { role: 'Data Scientist',           icon: '📊', skills: ['python','dataanalysis','datascience','pandas','numpy','matplotlib','seaborn','statistics','tableau','powerbi','r','scikitlearn','datavisualization'], minMatch: 3 },
  { role: 'Data Engineer',            icon: '🛢️', skills: ['python','sql','spark','hadoop','airflow','etl','datapipeline','dataengineering','pyspark','kafka','aws','gcp'], minMatch: 3 },
  { role: 'DevOps Engineer',          icon: '🚀', skills: ['docker','kubernetes','cicd','jenkins','terraform','ansible','aws','azure','gcp','linux','githubactions','prometheus','grafana'], minMatch: 3 },
  { role: 'Cloud Architect',          icon: '☁️', skills: ['aws','azure','gcp','cloudcomputing','serverless','lambda','ec2','s3','terraform','kubernetes','docker','infrastructure'], minMatch: 4 },
  { role: 'Mobile App Developer',     icon: '📱', skills: ['reactnative','swift','kotlin','flutter','dart','java','javascript','typescript'], minMatch: 2 },
  { role: 'Cybersecurity Analyst',    icon: '🔐', skills: ['linux','networking','firewalls','encryption','oauth','jwt','security'], minMatch: 2 },
  { role: 'UI/UX Designer',           icon: '🖌️', skills: ['figma','adobe','photoshop','css','html','tailwind','bootstrap','materialui','creative'], minMatch: 3 },
  { role: 'QA / Test Engineer',       icon: '🧪', skills: ['selenium','jest','cypress','playwright','pytest','mocha','testing'], minMatch: 2 },
  { role: 'Database Administrator',   icon: '🗄️', skills: ['sql','postgresql','mysql','mongodb','redis','oracle','sqlserver','databasedesign','queryoptimization','indexing'], minMatch: 3 },
  { role: 'Technical Project Manager',icon: '📋', skills: ['projectmanagement','agile','scrum','jira','confluence','leadership','communication','stakeholdermanagement'], minMatch: 3 },
];

function recommendJobRoles(resumeSkills) {
  const skillSet = new Set(resumeSkills.map(s => normalizeSkill(s)));
  const scored = [];

  for (const rule of JOB_ROLE_RULES) {
    const matchedRoleSkills = rule.skills.filter(s => skillSet.has(s));
    const matchCount = matchedRoleSkills.length;
    if (matchCount < rule.minMatch) continue;

    // For Full Stack, require at least one front + one back
    if (rule.requireBoth) {
      const hasFront = rule.requireBoth.front.some(s => skillSet.has(s));
      const hasBack  = rule.requireBoth.back.some(s => skillSet.has(s));
      if (!hasFront || !hasBack) continue;
    }

    const confidence = Math.min(Math.round((matchCount / rule.skills.length) * 100), 98);
    scored.push({
      role: rule.role,
      icon: rule.icon,
      confidence,
      matchedSkills: matchedRoleSkills.map(formatSkillName),
      totalSkills: rule.skills.length,
      matchCount
    });
  }

  return scored.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}


// ═══════════════════════════════════════════════════════════════════════════════
// §17  INTERVIEW PROBABILITY SCORE
// ═══════════════════════════════════════════════════════════════════════════════

function computeInterviewProbability(atsScore, skillMatchScore, keywordOptimization, experienceRelevance) {
  const raw = (atsScore * 0.35) + (skillMatchScore * 0.35) + (keywordOptimization * 0.20) + (experienceRelevance * 0.10);
  const score = Math.min(Math.round(raw), 99);
  let level, color;
  if (score >= 70) { level = 'High'; color = 'green'; }
  else if (score >= 45) { level = 'Medium'; color = 'amber'; }
  else { level = 'Low'; color = 'red'; }
  return { score, level, color };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §18  AI RESUME IMPROVEMENT LAB
// ═══════════════════════════════════════════════════════════════════════════════

const IMPROVEMENT_TEMPLATES = [
  { pattern: /^(built|created|made)\s+(a\s+)?(website|app|application|tool|platform)/i,
    improve: (m) => `Developed a responsive ${m[3]} using modern frameworks and UI components, improving usability and performance across devices.` },
  { pattern: /^(worked\s+on|helped\s+with)\s+(.+)/i,
    improve: (m) => `Collaborated on ${m[2]}, contributing to architecture decisions and delivering measurable improvements in functionality and code quality.` },
  { pattern: /^(did|handled|was\s+responsible\s+for)\s+(.+)/i,
    improve: (m) => `Owned and executed ${m[2]}, streamlining processes and achieving quantifiable results that strengthened team output.` },
  { pattern: /^(used|utilized|worked\s+with)\s+(.+)/i,
    improve: (m) => `Leveraged ${m[2]} to architect scalable solutions, reducing development time and improving system reliability.` },
  { pattern: /^(learned|studied|trained)\s+(.+)/i,
    improve: (m) => `Acquired proficiency in ${m[2]} through hands-on projects, applying knowledge to deliver production-ready features.` },
  { pattern: /^(fixed|solved|resolved)\s+(.+)/i,
    improve: (m) => `Diagnosed and resolved ${m[2]}, reducing recurring issues by [X]% and improving system stability for end users.` },
  { pattern: /^(managed|led|supervised)\s+(.+)/i,
    improve: (m) => `Spearheaded ${m[2]}, coordinating cross-functional teams and delivering results on time while maintaining high quality standards.` },
  { pattern: /^(tested|checked|verified)\s+(.+)/i,
    improve: (m) => `Engineered comprehensive test suites for ${m[2]}, achieving [X]% code coverage and reducing production bugs by [X]%.` },
];

function generateResumeImprovements(rawText) {
  const lines = String(rawText || '')
    .replace(/[•●▪►·→⇒]/g, '\n')
    .split(/\n+/)
    .map(l => l.trim())
    .filter(l => l.length > 15 && l.split(/\s+/).length >= 4 && l.split(/\s+/).length <= 25);

  const improvements = [];
  const WEAK_STARTERS = /^(built|created|made|worked|helped|did|handled|was|used|utilized|learned|studied|trained|fixed|solved|resolved|managed|led|supervised|tested|checked|verified)\b/i;

  for (const line of lines) {
    if (!WEAK_STARTERS.test(line)) continue;

    for (const tmpl of IMPROVEMENT_TEMPLATES) {
      const match = line.match(tmpl.pattern);
      if (match) {
        improvements.push({
          original: line,
          improved: tmpl.improve(match),
        });
        break;
      }
    }
    if (improvements.length >= 5) break;
  }

  // Fallback: generic weak bullets
  if (improvements.length === 0) {
    const genericWeak = lines.filter(l => !/\d/.test(l) && l.split(/\s+/).length <= 12).slice(0, 3);
    for (const line of genericWeak) {
      improvements.push({
        original: line,
        improved: `${line.replace(/\.$/, '')}, resulting in measurable improvements in [key metric] and enhanced user experience.`,
      });
    }
  }

  return improvements.slice(0, 5);
}


// ═══════════════════════════════════════════════════════════════════════════════
// §19  RECRUITER RISK INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════

function generateRecruiterRisks({
  missingSkills, matchedSkills, skillMatchScore, keywordOptimization,
  experienceRelevance, atsScore, resumeQuality, detectedSections, resumeLength
}) {
  const risks = [];

  // Missing required skills
  if (missingSkills.length > 3) {
    const top = missingSkills.slice(0, 4).map(formatSkillName).join(', ');
    risks.push({
      severity: 'high',
      icon: '🚫',
      title: 'Missing Key Technologies',
      desc: `Your resume is missing ${missingSkills.length} required skills: ${top}. These are likely hard filters in ATS screening.`,
    });
  } else if (missingSkills.length > 0) {
    const top = missingSkills.map(formatSkillName).join(', ');
    risks.push({
      severity: 'medium',
      icon: '⚠️',
      title: 'Some Skills Not Found',
      desc: `Missing: ${top}. Adding even basic proficiency can help pass initial screening.`,
    });
  }

  // Low keyword match
  if (keywordOptimization < 35) {
    risks.push({
      severity: 'high',
      icon: '🔑',
      title: 'Low Keyword Match',
      desc: `Only ${keywordOptimization}% keyword overlap detected. Most ATS systems filter below 40%. Incorporate more job-specific terminology.`,
    });
  } else if (keywordOptimization < 55) {
    risks.push({
      severity: 'medium',
      icon: '🔑',
      title: 'Moderate Keyword Coverage',
      desc: `${keywordOptimization}% keyword match is borderline. Adding 5-10 more targeted keywords could significantly improve your chances.`,
    });
  }

  // Weak experience
  if (experienceRelevance < 30) {
    risks.push({
      severity: 'high',
      icon: '💼',
      title: 'Weak Experience Section',
      desc: `Experience relevance is only ${experienceRelevance}%. Rewrite bullet points to mirror the job description language and responsibilities.`,
    });
  } else if (experienceRelevance < 50) {
    risks.push({
      severity: 'medium',
      icon: '💼',
      title: 'Experience Needs Tailoring',
      desc: `${experienceRelevance}% experience alignment. Tailor your bullet points to better reflect the specific requirements of this role.`,
    });
  }

  // No measurable achievements
  if (!resumeQuality.hasMetrics || resumeQuality.metricsCount < 2) {
    risks.push({
      severity: 'high',
      icon: '📉',
      title: 'No Quantified Achievements',
      desc: 'Resume lacks measurable results. Recruiters strongly prefer impact statements like "increased revenue by 30%" or "reduced load time by 50%".',
    });
  }

  // Missing action verbs
  if (!resumeQuality.hasActionVerbs || resumeQuality.verbCount < 3) {
    risks.push({
      severity: 'medium',
      icon: '✍️',
      title: 'Weak Action Language',
      desc: 'Few strong action verbs detected. Use words like "Architected", "Spearheaded", "Optimized" to convey leadership and ownership.',
    });
  }

  // Missing sections
  if (detectedSections) {
    const missingSections = Object.entries(detectedSections).filter(([, v]) => !v).map(([k]) => k);
    if (missingSections.length >= 2) {
      risks.push({
        severity: 'medium',
        icon: '📋',
        title: 'Missing Resume Sections',
        desc: `Missing: ${missingSections.join(', ')}. Standard sections help ATS parse your resume correctly and reassure recruiters.`,
      });
    }
  }

  // Short resume
  if (resumeLength < 200) {
    risks.push({
      severity: 'medium',
      icon: '📄',
      title: 'Resume Too Short',
      desc: `Only ${resumeLength} words detected. Most competitive resumes have 400-700 words with detailed experience descriptions.`,
    });
  }

  // Low ATS overall
  if (atsScore < 40) {
    risks.push({
      severity: 'high',
      icon: '🔴',
      title: 'Critical ATS Score',
      desc: `${atsScore}% ATS score is dangerously low. This resume would likely be auto-rejected by most applicant tracking systems.`,
    });
  }

  return risks.sort((a, b) => (a.severity === 'high' ? 0 : 1) - (b.severity === 'high' ? 0 : 1)).slice(0, 6);
}


// ═══════════════════════════════════════════════════════════════════════════════
// §20  AI SKILL GAP ROADMAP
// ═══════════════════════════════════════════════════════════════════════════════

const LEARNING_RESOURCES = {
  docker:       { difficulty: 'Intermediate', timeWeeks: 3, category: 'DevOps' },
  kubernetes:   { difficulty: 'Advanced',     timeWeeks: 6, category: 'DevOps' },
  aws:          { difficulty: 'Intermediate', timeWeeks: 5, category: 'Cloud' },
  azure:        { difficulty: 'Intermediate', timeWeeks: 5, category: 'Cloud' },
  gcp:          { difficulty: 'Intermediate', timeWeeks: 5, category: 'Cloud' },
  cicd:         { difficulty: 'Intermediate', timeWeeks: 3, category: 'DevOps' },
  terraform:    { difficulty: 'Intermediate', timeWeeks: 4, category: 'DevOps' },
  python:       { difficulty: 'Beginner',     timeWeeks: 4, category: 'Language' },
  javascript:   { difficulty: 'Beginner',     timeWeeks: 4, category: 'Language' },
  typescript:   { difficulty: 'Intermediate', timeWeeks: 3, category: 'Language' },
  reactjs:      { difficulty: 'Intermediate', timeWeeks: 4, category: 'Frontend' },
  nodejs:       { difficulty: 'Intermediate', timeWeeks: 3, category: 'Backend' },
  machinelearning: { difficulty: 'Advanced',  timeWeeks: 8, category: 'AI/ML' },
  deeplearning: { difficulty: 'Advanced',     timeWeeks: 8, category: 'AI/ML' },
  sql:          { difficulty: 'Beginner',     timeWeeks: 2, category: 'Database' },
  mongodb:      { difficulty: 'Beginner',     timeWeeks: 2, category: 'Database' },
  postgresql:   { difficulty: 'Intermediate', timeWeeks: 3, category: 'Database' },
  git:          { difficulty: 'Beginner',     timeWeeks: 1, category: 'Tools' },
  linux:        { difficulty: 'Intermediate', timeWeeks: 3, category: 'Systems' },
  graphql:      { difficulty: 'Intermediate', timeWeeks: 2, category: 'API' },
  redis:        { difficulty: 'Intermediate', timeWeeks: 2, category: 'Database' },
  systemdesign: { difficulty: 'Advanced',     timeWeeks: 6, category: 'Architecture' },
  agile:        { difficulty: 'Beginner',     timeWeeks: 1, category: 'Process' },
  scrum:        { difficulty: 'Beginner',     timeWeeks: 1, category: 'Process' },
};

function generateSkillGapRoadmap(missingSkills, jdText) {
  const normJD = normalizeAnalysisText(jdText);
  const roadmap = [];

  for (const skill of missingSkills) {
    const key = normalizeSkill(skill);
    const occ = (normJD.match(new RegExp(escapeRegExp(key), 'g')) || []).length;
    const meta = LEARNING_RESOURCES[key] || { difficulty: 'Intermediate', timeWeeks: 3, category: getSkillCategory(key) || 'Technical' };

    // Priority: high-occurrence JD mentions + core technical categories
    const priority = occ >= 3 ? 'Critical' : occ >= 2 ? 'High' : 'Medium';

    roadmap.push({
      skill: formatSkillName(key),
      key,
      priority,
      difficulty: meta.difficulty,
      timeWeeks: meta.timeWeeks,
      category: typeof meta.category === 'string' ? meta.category : 'Technical',
      occurrences: occ,
    });
  }

  // Sort: Critical > High > Medium, then by occurrences
  const priorityOrder = { Critical: 0, High: 1, Medium: 2 };
  return roadmap
    .sort((a, b) => (priorityOrder[a.priority] - priorityOrder[b.priority]) || (b.occurrences - a.occurrences))
    .slice(0, 8);
}


// ═══════════════════════════════════════════════════════════════════════════════
// §21  WINDOW EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.computeAtsScore            = computeAtsScore;
  window.normalizeAnalysisText      = normalizeAnalysisText;
  window.normalizeSkill             = normalizeSkill;
  window.detectFuzzySkills          = detectFuzzySkills;
  window.extractSkills              = extractSkills;
  window.applySkillImplications     = applySkillImplications;
  window.matchAtsKeywords           = matchAtsKeywords;
  window.analyzeKeywords            = analyzeKeywords;
  window.scoreExperienceIndicators  = scoreExperienceIndicators;
  window.capitalizeSkill            = capitalizeSkill;
  window.formatSkillName            = formatSkillName;
  window.analyzeResumeQuality       = analyzeResumeQuality;
  window.recommendJobRoles          = recommendJobRoles;
  window.computeInterviewProbability = computeInterviewProbability;
  window.generateResumeImprovements = generateResumeImprovements;
  window.generateRecruiterRisks     = generateRecruiterRisks;
  window.generateSkillGapRoadmap    = generateSkillGapRoadmap;
}
