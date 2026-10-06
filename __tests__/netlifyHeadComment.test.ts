import { NETLIFY_HEAD_COMMENT_CLEANUP } from '@/lib/netlifyHeadComment';

describe('Netlify head comment cleanup', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('removes the comment Netlify injects in production <head>, which broke hydration (#418)', () => {
    document.head.innerHTML =
      '<meta charset="utf-8">\n<!-- This site is hosted on Netlify. Anyone can build and deploy a site like this one. --><title>RME</title>';
    new Function(NETLIFY_HEAD_COMMENT_CLEANUP)();
    expect(document.head.innerHTML).not.toMatch(/hosted on Netlify/);
    // The newline Netlify inserts with the comment is a node React did not render either.
    expect(document.head.innerHTML).toBe('<meta charset="utf-8"><title>RME</title>');
  });

  it('leaves every other node alone, including other comments', () => {
    document.head.innerHTML = '<meta charset="utf-8"><!-- autre commentaire --><meta name="x" content="y">';
    new Function(NETLIFY_HEAD_COMMENT_CLEANUP)();
    expect(document.head.innerHTML).toBe('<meta charset="utf-8"><!-- autre commentaire --><meta name="x" content="y">');
  });
});
