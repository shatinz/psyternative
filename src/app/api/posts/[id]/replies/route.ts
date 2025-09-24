import { NextRequest, NextResponse } from 'next/server';
import { deleteReply } from '../../../../../../db/posts';
import { verifyUserAndCheckAdmin } from '../../../../../lib/auth-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const replyId = url.searchParams.get('replyId');

  if (!replyId) {
    return NextResponse.json({ error: 'Reply ID required' }, { status: 400 });
  }

  const authHeader = request.headers.get('authorization');
  const userAuth = await verifyUserAndCheckAdmin(authHeader);

  if (!userAuth || !userAuth.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    await deleteReply(replyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}