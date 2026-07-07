import { Params } from 'nestjs-pino';

const isProd = process.env.NODE_ENV === 'production';

export const loggerConfig: Params = {
  pinoHttp: {
    level: 'warn',
    ...(isProd
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              levelFirst: false,
              translateTime: 'SYS:HH:MM:ss',
            },
          },
        }),
    redact: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.token',
    ],
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        requestId: req.id,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  },
};
