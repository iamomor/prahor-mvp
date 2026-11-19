import "server-only";
import community from "./community-facilities.json";
import registry from "./registry-records.json";
import { buildDirectory } from "./directoryCore";
import type { OsmEntry } from "./nearbyCore";
const directory = buildDirectory(registry, community as OsmEntry[]);
export function getPothDiscovery() { return directory; }
