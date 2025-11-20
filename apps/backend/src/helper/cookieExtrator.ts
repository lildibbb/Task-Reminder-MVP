import { Request } from 'express';

const cookieExtractor = (req: Request, tokenName): string | null => {
  if (!req || !req.cookies) {
    console.warn('Request or cookies object is missing');
    return null;
  }
  const token = req.cookies[tokenName];
  if (!token) {
    console.warn(`Cookie with name ${tokenName} is missing`);
  }
  return token;
};

export { cookieExtractor };
