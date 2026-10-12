// 1. Deriving deterministic view models from an append-only event log
function rowsFor(snapshot: ScanProgressSnapshot): { rows: EngineRow[]; page?: ScanProgressPage } {
  const planEvent = latestPlan(snapshot.events);
  const pageKey = planEvent?.payload?.pageKey;
  const page = snapshot.pages.find((candidate) => pageKey && candidate.pageKey === pageKey)
    || snapshot.pages.find((candidate) => ["running", "retrying"].includes(candidate.status))
    || snapshot.pages.at(-1);

  const plan = planEvent?.payload?.engines || [];
  const definitions = plan.flatMap((execution) => (execution.engineIds || []).map((engineId) => ({
    id: engineId,
    resourceClass: execution.resourceClass,
  })));

  const seen = new Set<string>();
  return {
    page,
    rows: definitions.filter((d) => !seen.has(d.id) && seen.add(d.id)).map((definition) => {
      const executionEvent = [...snapshot.events].reverse().find((event) =>
        event.type.startsWith("engine.") &&
        (!pageKey || event.payload?.pageKey === pageKey) &&
        event.payload?.engineIds?.includes(definition.id)
      );
      return { id: definition.id, status: executionEvent?.payload?.status || "queued" };
    }),
  };
}
