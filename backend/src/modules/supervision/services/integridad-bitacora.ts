export const HASH_GENESIS = 'GENESIS_HASH_ERGOCHECK_2026';

export interface BloqueAuditado {
  id: string;
  hash: string | null;
  prevHash: string | null;
}

export function comprobarCadena(
  bloques: BloqueAuditado[],
  idsVisibles: ReadonlySet<string> | null,
  inicio: number,
) {
  const hashesValidos = new Set([HASH_GENESIS]);
  const visibles = idsVisibles ? bloques.filter(bloque => idsVisibles.has(bloque.id)) : bloques;
  let indiceVisible = 0;

  for (const bloque of bloques) {
    const visible = !idsVisibles || idsVisibles.has(bloque.id);
    if (bloque.hash && bloque.prevHash) {
      if (hashesValidos.has(bloque.prevHash)) {
        hashesValidos.add(bloque.hash);
      } else if (visible) {
        return {
          valida: false,
          totalRegistros: visibles.length,
          genesisHash: HASH_GENESIS,
          ultimoHash: bloque.hash,
          errorIndex: indiceVisible,
          tiempoVerificacionMs: Date.now() - inicio,
        };
      }
    }
    if (visible) indiceVisible += 1;
  }

  return {
    valida: true,
    totalRegistros: visibles.length,
    genesisHash: HASH_GENESIS,
    ultimoHash: visibles.at(-1)?.hash || HASH_GENESIS,
    tiempoVerificacionMs: Date.now() - inicio,
  };
}
