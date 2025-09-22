import { createUser as dbCreateUser } from '../../../../db/users';
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
import { NextRequest, NextResponse } from 'next/server';
import { getUserByUid, getUserByUsername } from '../../../../db/users';

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
  return NextResponse.json({ user });
}
