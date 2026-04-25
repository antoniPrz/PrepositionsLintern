import db from '../server/db.js';
import crypto from 'crypto';

// Get max requests from arguments (default to 10)
const args = process.argv.slice(2);
const maxRequests = args.length > 0 ? parseInt(args[0], 10) : 10;

if (isNaN(maxRequests)) {
  console.error('Error: max_requests must be a number.');
  process.exit(1);
}

// Generate a random token (e.g., BETA-A1B2C3D4)
const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
const token = `BETA-${randomString}`;

try {
  const stmt = db.prepare('INSERT INTO invitations (token, max_requests) VALUES (?, ?)');
  stmt.run(token, maxRequests);
  
  console.log('✅ Invitación creada con éxito!');
  console.log('-----------------------------------');
  console.log(`CÓDIGO: ${token}`);
  console.log(`USOS:   ${maxRequests}`);
  console.log('-----------------------------------');
  console.log('Copia este código y dáselo a tu tester.');
} catch (error) {
  console.error('Error al crear invitación:', error.message);
}
