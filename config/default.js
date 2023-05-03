module.exports = {
  name: 'AllActivity Backend',
  version: '1.0',
  port: 1338,
  frontend: {
    baseUrl: 'http://localhost:1337',
    routes: {
      joinWorkspace: '/join?token={{acceptToken}}',
      resetPassword: '/reset-password?token={{restoreToken}}',
    },
  },
  backend: {
    baseUrl: 'http://localhost:1338',
  },
  sentry: {
    dsn: '',
  },
  app: {
    name: 'AllActivity',
    logName: -1 /* TODO : AllActivity */,
    slack: {
      token: 'xoxb-597779810256-1548705817574-gRSjtyZ73SCJyCyZVr5vutQM',
      conversationId: 'C046PKS9X0X',
    },
    operator: {
      company: 'AllActivity Ltd.',
      firstName: 'Christof',
      lastName: 'Strasser',
      street: '207 Regent Street',
      zipCode: 'W1B 3HH',
      city: 'London',
      country: 'United Kingdom',
      phone: {},
      email: {
        contact: 'contact@allactivity.com',
        help: 'feedback@allactivity.com',
      },
    },
    lists: {
      before: (Model, findOptions, args, { req: { user } }) => {
        // Restrict result for own organization if required
        if (Model.associations.Organization) {
          findOptions.where = { ...findOptions.where, organization: user.organization };
        }
        return findOptions;
      },
    },
    configuration: {
      maxRecentAssignedProjects: 4,
      autoSealDays: 7,
    },
    RawTimeEntry: {
      invoiceStatus: ['pending', 'paid', 'cancelled'],
      state: ['private', 'processed', 'completed', 'Invoiced', 'InvoiceLost'],
    },
    user: {
      roles: ['user', 'manager', 'owner', 'admin', 'systemadmin'],
      defaultWorkingHrs: '09:00, 17:00',
      defaultTimeZone: 'Europe/Vienna',
    },
    email: {
      emailCheckCodeLength: 6,
      emailCheckCodeSplitLength: 3,
      emailCheckTime: 300,
      emailSignTokenTime: 3600,
    },
    invite: {
      userInviteTime: 3600 * 24 * 7,
      userMinReinviteTime: 600,
    },
    password: {
      passwordMinLength: 6,
      restoreTime: 3600 * 24,
      policy: '(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\\W)',
    },
    bulk: {
      maxDataRows: 1000,
    },
    rule: {
      conditionDurationValues: {
        1: 60 * 1000, // 1 min
        2: 10 * 60 * 1000, // 10 min
        3: 15 * 1000, // 15 secs,
        4: 30 * 1000, // 30 secs,
      },
    },
    project: {
      systemTimeEntryRulesProject: 'system time entry rules',
    },
    theme: {
      palette: {
        primary: {
          light: '#2a6591',
          main: '#1e4974',
          dark: '#093251',
        },
        secondary: {
          light: '#00d0ff',
          main: '#30e3df',
        },
        error: {
          main: '#b0001f',
        },
        info: {
          light: '#f5f8fc',
          main: '#eceff7',
          dark: '#a4b5c6',
        },
        action: {
          main: '#ffb302',
        },
        background: {
          default: '#fff',
          light: '#f5f8fc',
          lighter: '#fbfdff',
        },
      },
    },
    export: {
      limit: 10 * 1000,
    },
  },
  logging: {
    console: 'nodebug',
    file: 'error',
  },
  sequelize: {
    connect: {
      retryWaitSec: 1,
      retries: 60,
    },
    sync: {
      force: false,
      // We can not activate that by default in production systems
      // So from now, when we need database updates, we migrations are required
      // But for development you can overwrite this settings via development.js
      // As a demo check development.js.default
      alter: false,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    defaultOptions: {
      benchmark: true,
    },
    warningLimit: 3, // Any query which runs more then 3 Sec will be logged as warning.
  },
  postgres: {
    host: 'localhost',
    username: 'postgres',
    password: 'postgres',
    database: 'allactivitynew',
    operatorsAliases: 1,
    groupConcatMaxLen: 10240000,
    dialectOptions: {
      connectTimeout: 30000,
    },
    migrationEnabled: true,
    migrationConfig: {},
    seederEnabled: true,
    seederConfig: {},
  },
  graphql: {
    path: '/graphql',
    playground: true,
    resolverOptions: {
      needAuthorization: true,
    },
    fieldOptions: {
      exclude: ['deletedAt'],
    },
    fieldInputOptions: {
      exclude: [
        'organization',
        'owner',
        'user',
        'timeEntry',
        'isArchived',
        'createdAt',
        'updatedAt',
        'deletedAt',
        'createdBy',
        'updatedBy',
      ],
    },
  },
  redis: {
    host: 'localhost',
    port: 6379,
  },
  bull: {
    limiter: {
      max: 5, // Max number of jobs processed
      duration: 1000, // per duration in milliseconds
      bounceBack: false, // When jobs get rate limited, they stay in the waiting queue and are not moved to the delayed queue
    },
    repeat: {
      expiredRules: {
        cron: '00 3 * * *', // Repeat job once every day at 3:00 (am)
      },
      expiredSessions: {
        cron: '00 3 * * *', // Repeat job once every day at 3:00 (am)
      },
      syncProgram: {
        cron: '*/5 * * * *', // Repeat job once every 5 minute
      },
      syncOffHours: {
        cron: '*/15 * * * *', // Repeat job once every 15 minute
      },
    },
    delay: {
      acceptedSharedRules: 1000 * 60 * 60 * 24 * 3, // Run after 3 days (in milliseconds)
    },
  },
  express: {
    bodyParser: {
      options: {
        json: {
          limit: '10mb',
        },
        urlencoded: {
          limit: '10mb',
          extended: false,
        },
      },
    },
  },
  security: {
    saltRounds: 10,
    jwtSecret: 'tb0thpzabg1uu2kynq3ww19x20z37gma',
    jwtAlgorithm: 'HS256',
    headers: {
      frameAncestors: "'none'",
      hstsMaxAge: 63072000, // 2 years (recommended value)
      graphqlcdn: "'cdn.jsdelivr.net'",
      contentSecurityPolicy: {
        directives: {
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    },
  },
  sessions: {
    expires: {
      tokenLifeTime: 5 * 60, // 5m
      refreshTokenLifeTimeWithoutRemember: 30 * 24 * 60 * 60, // 30 days
      refreshTokenLifeTimeWithRemember: 365 * 24 * 60 * 60, // 365 days
    },
  },
  mailer: {
    messageDefaults: {
      encoding: 'base64',
    },
    smtp: {
      check: true,
    },
  },
  parsers: {
    csv: {
      opts: {},
      transformOpts: {
        highWaterMark: 8192,
        encoding: 'utf-8',
      },
    },
  },
  mustache: {
    layout: './layouts/default',
    emailLayout: './layouts/email',
  },
  locales: {
    en: {
      delimiters: {
        thousands: ',',
        decimal: '.',
      },
      abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't',
      },
      ordinal: () => ',',
      currency: {
        symbol: '€',
      },
    },
    de: {
      delimiters: {
        thousands: '.',
        decimal: ',',
      },
      abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't',
      },
      ordinal: () => '.',
      currency: {
        symbol: '€',
      },
    },
  },
  Sensitive: ['password', 'token', 'refreshToken'],
};
