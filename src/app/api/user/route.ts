import { NextRequest, NextResponse } from 'next/server';
import { createUser as dbCreateUser, getUserByUid, getUserByUsername, deleteUser } from '../../../../db/users';
import { verifyUserAndCheckAdmin } from '../../../lib/auth-utils';

export async function POST(req: NextRequest) {
  const { uid, username, email } = await req.json();
  if (!uid || !username || !email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    await dbCreateUser({ uid, username, email });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('DB error in POST /api/user:', e);
    return NextResponse.json({ error: 'DB error', details: e?.message || e }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');
  const username = searchParams.get('username');
  let user = null;
  if (uid) {
    user = await getUserByUid(uid);
  } else if (username) {
    user = await getUserByUsername(username);
  }
  if (user) {
    // Transform DB row to match User type
    user = {
      id: user.uid,
      name: user.username,
      avatarUrl: user.avatar_url || '',
      hasChangedUsername: user.has_changed_username || false,
      email: user.email,
      bio: user.bio,
      isAdmin: user.is_admin || false,
    };
  }
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const authHeader = req.headers.get('authorization');
  const userAuth = await verifyUserAndCheckAdmin(authHeader);

  if (!userAuth || !userAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await deleteUser(uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
