import { createMoment, getNextAction, isActionSafeToAutoPresent } from '../lib/rmeMoments';

describe('LOT E.3 — Context / Moment foundation', () => {
  const base = {
    title:'Préparer mon départ au Maroc',
    phase:'BEFORE' as const,
    intent:{id:'i1',label:'Voyage au Maroc',confidence:'EXPLICIT' as const,goal:'Arriver préparé',constraints:['vendredi']},
    actions:[
      {id:'a1',label:'Vérifier les documents',reason:'Le départ approche',safety:'INFORMATIONAL' as const},
      {id:'a2',label:'Voir les options de transport',reason:'Préparer le trajet',safety:'USER_CONFIRMATION_REQUIRED' as const,destination:'transport'},
    ],
    createdAt:'2026-09-27T00:00:00Z',
  };

  it('creates a valid moment',()=>{const m=createMoment(base);expect(m.id).toBeTruthy();expect(m.title).toContain('départ');});
  it('exposes the next action without executing it',()=>{const m=createMoment(base);expect(getNextAction(m).id).toBe('a1');expect(isActionSafeToAutoPresent(getNextAction(m))).toBe(true);});
  it('requires confirmation metadata for transactional actions',()=>{expect(()=>createMoment({...base,actions:[{...base.actions[1],destination:undefined}]})).toThrow();});
  it('rejects empty moments and invalid timestamps',()=>{expect(()=>createMoment({...base,actions:[]})).toThrow();expect(()=>createMoment({...base,createdAt:'bad'})).toThrow();});
  it('keeps explicit, detected and inferred intent distinct',()=>{expect(createMoment({...base,intent:{...base.intent,confidence:'DETECTED'}}).intent.confidence).toBe('DETECTED');expect(createMoment({...base,intent:{...base.intent,confidence:'INFERRED'}}).intent.confidence).toBe('INFERRED');});
});
