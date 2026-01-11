import { Store } from 'express-session';
import { Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';

export type SocketMiddleware = (socket: Socket, next: (err?: Error) => void) => void;

const SESSION_COOKIE_NAME = 'connect.sid';

const getSignedSessionId = (rawCookie?: string) => {
  if (!rawCookie) {
    return undefined;
  }
  const cookies = cookie.parse(rawCookie);
  return cookies[SESSION_COOKIE_NAME];
};

const unsignSessionId = (signedId: string, secret: string) => {
  const decoded = decodeURIComponent(signedId);
  if (decoded.startsWith('s:')) {
    return signature.unsign(decoded.slice(2), secret) || undefined;
  }
  return decoded;
};

export const createSocketSessionMiddleware = (
  store: Store,
  sessionSecret: string,
): SocketMiddleware => {
  return (socket, next) => {
    const signedId = getSignedSessionId(socket.handshake.headers.cookie);
    if (!signedId) {
      next(new Error('Session cookie missing'));
      return;
    }

    const sessionId = unsignSessionId(signedId, sessionSecret);
    if (!sessionId) {
      next(new Error('Invalid session cookie'));
      return;
    }

    store.get(sessionId, (err, session) => {
      if (err || !session) {
        next(new Error('Session not found'));
        return;
      }

      socket.data.session = session;
      socket.data.userId = session.userId;
      socket.data.nickname = session.nickname;
      next();
    });
  };
};
