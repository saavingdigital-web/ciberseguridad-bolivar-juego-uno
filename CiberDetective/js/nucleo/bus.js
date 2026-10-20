// Bus de eventos mínimo: al(evento, fn) / emitir(evento, datos)
export function crearEmisor() {
  const oyentes = new Map();
  return {
    al(evento, fn) {
      if (!oyentes.has(evento)) oyentes.set(evento, new Set());
      oyentes.get(evento).add(fn);
      return () => oyentes.get(evento).delete(fn);
    },
    emitir(evento, datos) {
      const fns = oyentes.get(evento);
      if (fns) fns.forEach(fn => { try { fn(datos); } catch (e) { console.error(`[bus:${evento}]`, e); } });
    }
  };
}
