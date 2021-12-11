import csrf from 'csurf';
export const CsrfProtection = csrf({ cookie: true });
