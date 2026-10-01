import "server-only";
import type { Empresa } from "@/lib/painel/auth";
import { DIAS_SUSPENSAO, type Aviso } from "@/lib/painel/financeiro";
import { dataLonga, dinheiro } from "@/lib/painel/formato";
import type { TextosPainel } from "@/lib/painel/textos";
import { fmt, type Idioma } from "@/lib/i18n";
import type { DadosAviso } from "../../_ui/AvisoPagamento";

/** Monta o texto do pop-up para a situação da cobrança. */
export function montarAviso(aviso: Aviso, empresa: Empresa, idioma: Idioma, t: TextosPainel["financeiro"], referencia: string): DadosAviso {
  const { cobranca: c, situacao: s } = aviso;
  const valores = { descricao: c.descricao, valor: dinheiro(c.valor, c.moeda, idioma), data: dataLonga(c.vencimento, idioma), dias: s.dias };
  const a = t.aviso;
  let nivel: DadosAviso["nivel"] = "lembrete";
  let titulo: string;
  let texto: string;
  let extra: string | null = null;

  if (s.tipo === "aberta") {
    titulo = s.dias === 0 ? a.lembrete0 : s.dias === 1 ? a.lembrete1 : s.dias === 3 ? a.lembrete3 : a.lembrete7;
    texto = fmt(a.lembreteTexto, valores);
  } else if (s.dias >= DIAS_SUSPENSAO) {
    nivel = "suspensao";
    titulo = fmt(a.suspensao, valores);
    texto = fmt(a.suspensaoTexto, valores);
  } else {
    nivel = "atraso";
    titulo = s.dias === 1 ? a.atraso1 : fmt(a.atraso, valores);
    texto = fmt(a.atrasoTexto, valores);
    const faltam = DIAS_SUSPENSAO - s.dias;
    extra = faltam === 1 ? a.faltam1 : fmt(a.faltam, { dias: faltam });
  }

  return {
    // Uma chave por cobrança, situação e dia: o aviso volta quando a situação muda.
    chave: `t9-aviso-${c.id}-${s.tipo}-${s.dias}-${referencia}`,
    nivel,
    titulo,
    texto,
    extra,
    link: c.link,
    instrucoes: empresa.pagamento_instrucoes,
    hrefFinanceiro: `/painel/${empresa.slug}/financeiro`,
    rotulos: {
      pagarAgora: a.pagarAgora,
      verFinanceiro: a.verFinanceiro,
      fechar: a.fechar,
      jaPaguei: a.jaPaguei,
      comoPagar: t.comoPagar,
      copiar: t.copiar,
      copiado: t.copiado,
    },
  };
}
