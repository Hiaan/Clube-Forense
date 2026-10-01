import Link from "next/link";
import { empresasDoUsuario, mostrarEdicao } from "@/lib/painel/auth";
import { hoje } from "@/lib/painel/dados";
import { DIAS_SUSPENSAO, avisoDoDia, listarCobrancas } from "@/lib/painel/financeiro";
import { fmt } from "@/lib/i18n";
import Cabecalho from "../_ui/Cabecalho";
import Abas from "../_ui/Abas";
import AvisoPagamento from "../_ui/AvisoPagamento";
import { contextoEmpresa } from "./contexto";
import { montarAviso } from "./financeiro/aviso";

export default async function LayoutEmpresa({ children, params }: { children: React.ReactNode; params: Promise<{ empresa: string }> }) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const [empresas, equipeEditando] = await Promise.all([empresasDoUsuario(usuario), mostrarEdicao(usuario)]);
  const base = `/painel/${empresa.slug}`;

  // Avisos de pagamento: para o cliente (e para a equipe no modo "ver como cliente").
  const referencia = hoje();
  const aviso = equipeEditando ? null : avisoDoDia(await listarCobrancas(empresa.id), referencia);
  const atraso = aviso?.situacao.tipo === "atrasada" ? aviso.situacao.dias : 0;
  const tf = t.financeiro;

  return (
    <>
      <Cabecalho usuario={usuario} empresas={empresas} atual={empresa}>
        <Abas
          abas={[
            { href: base, rotulo: t.menu.visao },
            { href: `${base}/campanhas`, rotulo: t.menu.campanhas },
            { href: `${base}/criativos`, rotulo: t.menu2.criativos },
            { href: `${base}/leads`, rotulo: t.menu.leads },
            { href: `${base}/plano`, rotulo: t.menu.plano },
            { href: `${base}/reunioes`, rotulo: t.menu2.reunioes },
            { href: `${base}/relatorios`, rotulo: t.menu2.relatorios },
            { href: `${base}/arquivos`, rotulo: t.menu2.arquivos },
            { href: `${base}/financeiro`, rotulo: tf.menu },
          ]}
        />
      </Cabecalho>
      {atraso > 0 && (
        <Link
          href={`${base}/financeiro`}
          className={`nao-imprimir block px-4 py-2.5 text-center text-sm font-medium ${
            atraso >= DIAS_SUSPENSAO ? "bg-[#e3121c] text-white" : "bg-amber-400 text-[#1a0d00]"
          }`}
        >
          {atraso >= DIAS_SUSPENSAO ? fmt(tf.faixaSuspensao, { dias: atraso }) : atraso === 1 ? tf.faixa1 : fmt(tf.faixa, { dias: atraso })}{" "}
          <span className="underline underline-offset-2">{tf.aviso.verFinanceiro} →</span>
        </Link>
      )}
      {aviso && <AvisoPagamento aviso={montarAviso(aviso, empresa, idioma, tf, referencia)} />}
      <main className="mx-auto max-w-7xl px-4 pt-8 pb-20 sm:px-6">{children}</main>
    </>
  );
}
