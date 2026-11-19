// Fixed scenes for screenshots: ?shot=cover draws one cover alone at a chosen
// size; ?shot=editor shows the editor with a sample photo loaded. The query
// picks the layout, grade, sample photo and words; window.__shotReady is set
// once the cover has painted, so a screenshot tool knows when to shoot.

export async function runShot(shot, query, setup) {
  const layout = query.get('layout') || 'hero';
  const grade = query.get('grade') || 'sunset';
  const photo = query.get('photo') || 'pier';
  const title = query.get('title') || 'VICE COAST';
  const subtitle = query.get('subtitle') || 'Sunset Heist';
  const badge = query.get('badge') || 'VICE CITY';
  const heat = Number(query.get('heat') || '4');
  const size = query.get('size') || '1080x1080';
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
  await setup({ layout, grade, photo, title, subtitle, badge, heat, size });
  await document.fonts.ready;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.__shotReady = true;
  }));
}
