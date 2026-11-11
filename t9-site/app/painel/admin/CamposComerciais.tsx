import { SERVICOS, type DadosComerciais } from "@/lib/painel/comercial";
import { MOEDAS } from "@/lib/painel/formato";

type EmpresaBase = { id: number; nome: string; mensalidade: number | null; mensalidade_moeda: string | null };

/**
 * As informações básicas que geram proposta e contrato: cliente, serviços, valor e permanência.
 * `empresa`: quando a proposta é para um cliente que já está no painel, o nome e o valor já vêm preenchidos.
 */
export default function CamposComerciais({ dados, empresa }: { dados?: Partial<DadosComerciais>; empresa?: EmpresaBase | null }) {
  const d: Partial<DadosComerciais> = dados ?? {
    cliente_nome: empresa?.nome,
    valor_mensal: empresa?.mensalidade ?? undefined,
    moeda: empresa?.mensalidade_moeda ?? "BRL",
    servicos: ["trafego_meta", "criativos", "automacoes", "crm"],
  };
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <p className="font-display text-base font-extrabold sm:col-span-2">Cliente</p>
      <label className="sm:col-span-2">
        <span className="painel-rotulo">Nome da empresa (ou do cliente)</span>
        <input name="cliente_nome" required defaultValue={d.cliente_nome ?? ""} className="painel-campo" placeholder="Ex.: Imobiliária Vieira" />
      </label>
      <label>
        <span className="painel-rotulo">CNPJ ou CPF</span>
        <input name="cliente_documento" defaultValue={d.cliente_documento ?? ""} className="painel-campo" placeholder="Opcional na proposta" />
      </label>
      <label>
        <span className="painel-rotulo">Responsável (quem assina)</span>
        <input name="cliente_responsavel" defaultValue={d.cliente_responsavel ?? ""} className="painel-campo" />
      </label>
      <label>
        <span className="painel-rotulo">E-mail</span>
        <input name="cliente_email" type="email" defaultValue={d.cliente_email ?? ""} className="painel-campo" />
      </label>
      <label>
        <span className="painel-rotulo">WhatsApp</span>
        <input name="cliente_telefone" defaultValue={d.cliente_telefone ?? ""} className="painel-campo" />
      </label>
      <label className="sm:col-span-2">
        <span className="painel-rotulo">Endereço</span>
        <input name="cliente_endereco" defaultValue={d.cliente_endereco ?? ""} className="painel-campo" placeholder="Rua, número, cidade e estado (entra no contrato)" />
      </label>

      <p className="pt-2 font-display text-base font-extrabold sm:col-span-2">Serviços</p>
      <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
        {SERVICOS.map((s) => (
          <label key={s.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
            <input type="checkbox" name="servicos" value={s.id} defaultChecked={d.servicos?.includes(s.id)} className="mt-1 accent-[#ff2d38]" />
            <span>
              <span className="font-semibold">{s.nome}</span>
              <span className="mt-0.5 block text-white/50">{s.descricao}</span>
            </span>
          </label>
        ))}
      </div>

      <p className="pt-2 font-display text-base font-extrabold sm:col-span-2">Valor e permanência</p>
      <label>
        <span className="painel-rotulo">Valor mensal</span>
        <input name="valor_mensal" required inputMode="decimal" defaultValue={d.valor_mensal ?? ""} className="painel-campo" placeholder="Ex.: 2500" />
      </label>
      <label>
        <span className="painel-rotulo">Moeda</span>
        <select name="moeda" defaultValue={d.moeda ?? "BRL"} className="painel-campo">
          {MOEDAS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="painel-rotulo">Taxa de implantação (opcional)</span>
        <input name="implantacao" inputMode="decimal" defaultValue={d.implantacao ?? ""} className="painel-campo" placeholder="Paga uma vez, no início" />
      </label>
      <label>
        <span className="painel-rotulo">Prazo mínimo de permanência (meses)</span>
        <input name="prazo_minimo" type="number" min={1} max={60} defaultValue={d.prazo_minimo ?? 6} className="painel-campo" />
      </label>
      <label>
        <span className="painel-rotulo">Multa por saída antecipada (% dos meses restantes)</span>
        <input name="multa_percentual" type="number" min={0} max={100} defaultValue={d.multa_percentual ?? 30} className="painel-campo" />
      </label>
      <label>
        <span className="painel-rotulo">Dia do vencimento</span>
        <input name="vencimento_dia" type="number" min={1} max={28} defaultValue={d.vencimento_dia ?? 10} className="painel-campo" />
      </label>
      <label>
        <span className="painel-rotulo">Início do serviço</span>
        <input name="inicio" type="date" defaultValue={d.inicio ?? ""} className="painel-campo" />
      </label>
      <label className="sm:col-span-2">
        <span className="painel-rotulo">Condição especial (opcional, vira uma cláusula do contrato)</span>
        <textarea name="observacoes" rows={3} defaultValue={d.observacoes ?? ""} className="painel-campo" placeholder="Ex.: verba de anúncios paga direto pelo cliente à Meta, mínimo de R$ 1.500 por mês." />
      </label>
    </div>
  );
}
