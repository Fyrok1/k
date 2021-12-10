import { IHttpConfig } from '../k/interfaces';

export const HttpConfig: IHttpConfig = {
  headers: {
    'Access-Control-Allow-Origin': 'localhost',
    'Access-Control-Allow-Headers':
      'Origin, X-Requested-With, Content-Type, Accept',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Content-Security-Policy': "frame-ancestors 'none';",
    'X-Frame-Options': 'DENY',
  },
  uploadFileSizeLimit: 20,
  requestSizeLimit: 20,
};
