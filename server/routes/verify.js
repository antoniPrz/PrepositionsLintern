import express from 'express';
import db from '../db.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const stmt = db.prepare('SELECT * FROM invitations WHERE token = ?');
    const invite = stmt.get(token);

    if (!invite) {
      return res.status(401).json({ error: 'Código de invitación inválido.' });
    }

    if (invite.used_requests >= invite.max_requests) {
      return res.status(403).json({ 
        error: 'Límite alcanzado.', 
        message: 'Esta invitación ya no tiene análisis disponibles.'
      });
    }

    // Valid token
    res.json({
      valid: true,
      max_requests: invite.max_requests,
      used_requests: invite.used_requests,
      remaining: invite.max_requests - invite.used_requests
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ error: 'Error del servidor al verificar el token.' });
  }
});

export default router;
