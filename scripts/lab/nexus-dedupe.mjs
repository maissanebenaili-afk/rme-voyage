// Double send: same event retried. Append with a random key per *send* counts it twice;
// append with an event id chosen once per *event* (onlyIfNew) counts it once.
const store = new Map();
const setIfNew = (k) => (store.has(k) ? false : (store.set(k, 1), true));
const sends = [];
for (let e = 0; e < 1000; e++) { const id = `${e}-${Math.random().toString(36).slice(2)}`; sends.push(id); if (Math.random() < 0.1) sends.push(id); }
let naive = 0; for (const _ of sends) naive++;
let dedup = 0; for (const id of sends) if (setIfNew(`ev/${id}`)) dedup++;
console.log(`1000 événements, ${sends.length} envois (≈10 % renvoyés) → clé aléatoire par envoi : ${naive} · clé = identifiant d'événement : ${dedup}`);
