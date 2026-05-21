import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

// @route   GET api/entries/:id
// @desc    Get a single journal entry by ID
export async function GET(request, { params }) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;
    const { id } = await params;

    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return Response.json({ message: 'Invalid entry ID' }, { status: 400 });
    }

    const entryResult = await query(`
      SELECT e.id, e.user_id, e.content, e.created_at, e.updated_at,
             i.mood_score, i.dominant_emotion, i.feelings_list, i.summary, i.celebration, i.improvement
      FROM entries e
      LEFT JOIN ai_insights i ON e.id = i.entry_id
      WHERE e.id = $1 AND e.user_id = $2
    `, [entryId, userId]);

    if (entryResult.rows.length === 0) {
      return Response.json({ message: 'Journal entry not found' }, { status: 404 });
    }

    const entry = entryResult.rows[0];
    entry.feelings_list = entry.feelings_list ? JSON.parse(entry.feelings_list) : [];

    return Response.json(entry);
  } catch (err) {
    console.error('Fetch single entry error:', err);
    return Response.json({ message: 'Server error fetching the journal entry' }, { status: 500 });
  }
}

// @route   DELETE api/entries/:id
// @desc    Delete a journal entry
export async function DELETE(request, { params }) {
  try {
    let decoded;
    try {
      decoded = verifyAuth(request);
    } catch (err) {
      return Response.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = decoded.id;
    const { id } = await params;

    const entryId = parseInt(id, 10);
    if (isNaN(entryId)) {
      return Response.json({ message: 'Invalid entry ID' }, { status: 400 });
    }

    // Check if the entry exists and belongs to the user
    const checkResult = await query(
      'SELECT id FROM entries WHERE id = $1 AND user_id = $2',
      [entryId, userId]
    );

    if (checkResult.rows.length === 0) {
      return Response.json({ message: 'Journal entry not found or unauthorized' }, { status: 404 });
    }

    // Delete the entry
    await query('DELETE FROM entries WHERE id = $1', [entryId]);

    return Response.json({ message: 'Journal entry deleted successfully', id: entryId });
  } catch (err) {
    console.error('Delete entry error:', err);
    return Response.json({ message: 'Server error deleting journal entry' }, { status: 500 });
  }
}
