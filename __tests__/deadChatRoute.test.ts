import { existsSync } from 'node:fs'

describe('dead /api/chat surface', () => {
  it('is fully removed: unauthenticated, unbounded, unused-by-the-UI edge route and its agents', () => {
    // Nothing in app/, components/ or lib/ ever called /api/chat (grep-verified
    // before deletion), and packages/agents/* had no other caller. Kept as a
    // regression guard against re-adding a paid-LLM-adjacent surface with no
    // input bounds and no rate limit.
    for (const path of [
      'app/api/chat/route.ts',
      'packages/agents/safar.ts',
      'packages/agents/navigator.ts',
      'packages/agents/budget.ts',
      'packages/agents/emergency.ts',
      'packages/agents/community.ts',
      'packages/agents/localizer.ts',
      'packages/types/agent.ts',
    ]) {
      expect(existsSync(path)).toBe(false)
    }
  })
})
