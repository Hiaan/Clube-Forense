// As matérias da aba "aulas" na página do Acre, com as capas da PC-AC.
//
// As listas de aulas são as mesmas da plataforma (aulas.ts); só a capa muda,
// para a do curso do Acre, com o brasão da PC-AC. Patologia (exames
// laboratoriais), Realidade do Acre e Legislação Institucional ainda não têm
// lista de aulas cadastrada aqui: entram só com a capa, sem o "ver lista", em
// vez de mostrar uma lista inventada.

import { MATERIAS, type Materia } from "../black/plataforma/aulas";

const CAPA = (slug: string) => `/preparatorio-ac/capas/${slug}.webp`;

/** Na ordem do edital: específicos, básicos e jurídicos. */
const ORDEM = [
  "medicina-legal",
  "toxicologia-forense",
  "patologia-exames-laboratoriais",
  "lingua-portuguesa",
  "raciocinio-logico",
  "informatica",
  "realidade-do-acre",
  "direito-constitucional",
  "direito-administrativo",
  "direito-penal",
  "direito-processual-penal",
  "legislacao-institucional",
];

const NOVAS: Record<string, string> = {
  "patologia-exames-laboratoriais": "Patologia (exames laboratoriais)",
  "realidade-do-acre": "Realidade do Acre",
  "legislacao-institucional": "Legislação Institucional",
};

export const MATERIAS_AC: Materia[] = ORDEM.map((slug) => {
  const base = MATERIAS.find((m) => m.slug === slug);
  if (base) return { ...base, capa: CAPA(slug) };
  return { slug, nome: NOVAS[slug] ?? slug, capa: CAPA(slug), modulos: [] };
});
