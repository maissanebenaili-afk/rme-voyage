import { randomUUID } from 'node:crypto';
import type { AgentVersion, Patch } from '../types.js';

/** Applies patches to a deep-cloned copy of a version, producing a new candidate version. */
export function applyPatches(version: AgentVersion, patches: Patch[]): AgentVersion {
  const knowledge = version.knowledge.map((e) => ({ ...e, keywords: [...e.keywords] }));

  for (const patch of patches) {
    if (patch.kind === 'update_entry') {
      const idx = knowledge.findIndex((e) => e.id === patch.entryId);
      if (idx >= 0) {
        knowledge[idx] = {
          ...knowledge[idx],
          content: patch.newContent,
          lastVerified: new Date().toISOString(),
        };
      }
    } else if (patch.kind === 'add_entry') {
      const entry = { ...patch.entry, keywords: [...patch.entry.keywords] };
      const idx = knowledge.findIndex((e) => e.id === entry.id);
      if (idx >= 0) knowledge[idx] = entry;
      else knowledge.push(entry);
    }
  }

  return {
    ...version,
    id: `v-${Date.now()}-${randomUUID()}`,
    parentId: version.id,
    createdAt: new Date().toISOString(),
    knowledge,
  };
}
