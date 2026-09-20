import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public/privacy-policy.html');
    const content = readFileSync(filePath, 'utf-8');
    return new Response(content, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
