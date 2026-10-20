// Estado de la partida: recursos, era, casos y tecnologías.
export function crearEstado(datos) {
  const r = datos.RECURSOS_INICIALES;
  return {
    recursos: { ...r },
    era: 1,
    tiempo: 0,
    tecnologias: new Set(),
    casosResueltos: new Set(),
    casosFallidos: new Map(),     // id -> intentos fallidos
    activos: new Map(),           // id -> { caso, aparecio, plazoRestante, vencido }
    seguros: new Set(),           // edificios asegurados
    seleccion: null,              // 'detective' | id de edificio | null
    stats: { analizadas: 0, aciertos: 0, preguntas: 0, inicio: 0 },

    puedePagar(costo = {}) {
      return Object.entries(costo).every(([k, v]) => (this.recursos[k] ?? 0) >= v);
    },
    pagar(costo = {}) {
      if (!this.puedePagar(costo)) return false;
      Object.entries(costo).forEach(([k, v]) => { this.recursos[k] -= v; });
      return true;
    },
    sumar(rec = {}) {
      Object.entries(rec).forEach(([k, v]) => {
        this.recursos[k] = (this.recursos[k] ?? 0) + v;
      });
      this.recursos.energia = Math.min(this.recursos.energia, this.recursos.energiaMax);
      this.recursos.confianza = Math.max(0, Math.min(100, this.recursos.confianza));
    }
  };
}
