type RoadmapGroup = { features: readonly { status: string }[] };

/** Prefer available content, then the fullest module. Source order breaks exact ties. */
export function preferredModuleIndex(groups: readonly RoadmapGroup[], statuses: readonly string[] = ["Working", "Limited"]): number {
  let best = 0;
  let bestMatches = -1;
  let bestTotal = -1;
  groups.forEach((group, index) => {
    const matches = group.features.filter(feature => statuses.includes(feature.status)).length;
    if (matches > bestMatches || (matches === bestMatches && group.features.length > bestTotal)) {
      best = index; bestMatches = matches; bestTotal = group.features.length;
    }
  });
  return best;
}
