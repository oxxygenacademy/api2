import { handleCors } from '../../lib/cors.js';

async function handler(req, res) {
  res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
}

export default function(req, res) {
  return handleCors(req, res, handler);
}