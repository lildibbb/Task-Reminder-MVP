import { join } from 'path';

export default () => ({
  node_env: process.env.NODE_ENV || 'production',
  version: '1.0.0',
  port: parseInt(process.env.PORT!, 10) || 3001,
  app_url: process.env.APP_URL || 'http://localhost:3001',
  TZ: process.env.TZ || 'Asia/Kuala_Lumpur',
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',

  database: {
    type: process.env.DB_TYPE,
    url: process.env.DB_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    name: process.env.DB_NAME,
    nameTest: '',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT!, 10) || 5432,
  },
  mail: {
    mailer: process.env.MAIL_MAILER,
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT!, 10) || 25,
    secure: process.env.MAIL_SECURE,
    username: process.env.MAIL_USER,
    tls: process.env.MAIL_ENCRYPTION,
    password: process.env.MAIL_PASS,
    from_email: process.env.MAIL_FROM_EMAIL,
    from_name: process.env.MAIL_FROM_NAME,
  },

  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!, 10) || 6379,
    password: process.env.REDIS_PASS,
  },

  auth: {
    jwtSecretKey: process.env.JWT_SECRET,
    jwtInviteSecretKey: process.env.JWT_INVITE_SECRET,
    jwtExpiresIn: process.env.NODE_ENV === 'production' ? '30m' : '60m',
    jwtRefreshSecretKey: process.env.JWT_REFRESH_SECRET,
    jwtRefreshExpiresIn: '7d',
    jwtInviteExpiresIn: '30m',
  },

  cache: {
    accessTokenBlockList: 'accessTokenBlockList',
    forgotPassword: 'forgotPassword',
    refreshToken: 'refreshToken',
    inviteToken: 'inviteToken',
    userType: 'userType',
  },

  storage: {
    disks: {
      default: {
        driver: 's3',
        bucket: process.env.S3_BUCKET,
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        accessSecretKey: process.env.S3_SECRET_ACCESS_KEY,
        endpoint: process.env.S3_ENDPOINT,
        region: process.env.S3_REGION,
        s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
        visibility: 'public',
      },

      local: {
        driver: 'local',
        basePath: join(process.cwd(), 'storage/static'), // fully qualified path of the folder
        visibility: 'private',
      },
      local_public: {
        driver: 'local',
        publicPath: join(process.cwd(), 'storage/app/public'),
        baseUrl: `${process.env.APP_URL}/public/`,
        visibility: 'public',
      },
    },
  },
  webPush: {
    vapidPublicKey: process.env.WEB_PUSH_VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.WEB_PUSH_VAPID_PRIVATE_KEY,
    vapidMailto: process.env.WEB_PUSH_VAPID_MAILTO,
  },
});
