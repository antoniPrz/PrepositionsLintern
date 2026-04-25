import express from 'express';
import { analyzeText } from '../services/ai.js';
import db from '../db.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { text } = req.body;
  const token = req.headers['x-invitation-token'];

  if (!token) {
    return res.status(401).json({ error: 'Se requiere un código de invitación.' });
  }

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    // 0. Verify token
    const inviteStmt = db.prepare('SELECT * FROM invitations WHERE token = ?');
    const invite = inviteStmt.get(token);

    if (!invite) {
      return res.status(401).json({ error: 'Código de invitación inválido.' });
    }

    if (invite.used_requests >= invite.max_requests) {
      return res.status(403).json({ error: 'Límite de usos alcanzado para esta invitación.' });
    }

    // 1. Send to AI
    const analysisResult = await analyzeText(text);

    // 2. Update DB
    const insertStmt = db.prepare('INSERT INTO analyses (invitation_id, input_text, result_json) VALUES (?, ?, ?)');
    insertStmt.run(invite.id, text, JSON.stringify(analysisResult));

    const updateInviteStmt = db.prepare('UPDATE invitations SET used_requests = used_requests + 1 WHERE id = ?');
    updateInviteStmt.run(invite.id);

    // 3. Return to frontend with updated limits
    res.json({
      ...analysisResult,
      meta: {
        remaining: invite.max_requests - (invite.used_requests + 1)
      }
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

export default router;
