import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('LLM crawling is not permitted for this site.\n', {
    status: 410,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow, noai, noimageai',
    },
  });
}
