import { authAdmin } from './firebase-admin';
import { getUserByUid } from '../../db/users';

export async function verifyUserAndCheckAdmin(authHeader: string | null): Promise<{ uid: string; isAdmin: boolean } | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decodedToken = await authAdmin.verifyIdToken(token);
    const uid = decodedToken.uid;

    const user = await getUserByUid(uid);
    if (!user) {
      return null;
    }

    return { uid, isAdmin: user.is_admin || false };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}