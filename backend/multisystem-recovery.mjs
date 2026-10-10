/* BI Vella: recovery of cached multi-system page summaries without resetting load cursors.
 * Pure orchestration, with D1/R2 operations supplied by the Worker.
 */
export async function reconcileArchivedPages({
  loaded, pages, summary, readPage, resetSummary, applyPage, batchSize = 2
}) {
  if (!Number.isSafeInteger(loaded) || loaded < 0 ||
      !Number.isSafeInteger(pages) || pages < 0 ||
      (loaded > 0 && pages === 0)) {
    throw new Error("MULTISYSTEM_CHECKPOINT_INVALID");
  }
  if (loaded === 0) return { complete: true, replayed: 0 };
  const count = Number(summary?.count ?? 0);
  const lastPage = Number(summary?.lastPage ?? -1);
  if (summary && count === loaded && lastPage === pages - 1) {
    return { complete: true, replayed: 0 };
  }

  // After an interrupted replay, keep the existing partial summary and resume
  // from its last committed page. Otherwise rebuild only the summary, not the load.
  const resume = Boolean(summary) &&
    Number.isSafeInteger(count) && count >= 0 && count < loaded &&
    Number.isSafeInteger(lastPage) && lastPage >= 0 && lastPage < pages - 1;
  const first = resume ? lastPage + 1 : 0;
  let accumulated = resume ? count : 0;
  if (!resume) await resetSummary();

  const limit = Math.max(1, Math.min(3, Number.isSafeInteger(batchSize) ? batchSize : 2));
  const stop = Math.min(pages, first + limit);
  for (let page = first; page < stop; page++) {
    const rows = await readPage(page);
    if (!Array.isArray(rows) || rows.length < 1) {
      throw new Error("MULTISYSTEM_ARCHIVED_PAGE_MISSING");
    }
    accumulated += rows.length;
    if (accumulated > loaded) throw new Error("MULTISYSTEM_ARCHIVE_COUNT_MISMATCH");
    await applyPage(page, rows);
  }
  if (stop === pages && accumulated !== loaded) {
    throw new Error("MULTISYSTEM_ARCHIVE_COUNT_MISMATCH");
  }
  return { complete: stop === pages, replayed: stop - first };
}
