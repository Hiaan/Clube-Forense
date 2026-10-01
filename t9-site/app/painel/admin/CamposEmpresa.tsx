import type { Empresa } from "@/lib/painel/auth";
import { MOEDAS } from "@/lib/painel/formato";
import { CONFIG_IDIOMA, IDIOMAS } from "@/lib/i18n";

/** Campos de cadastro e metas da empresa, usados em "Novo cliente" e na edição. */
export default function CamposEmpresa({ empresa }: { empresa?: Empresa }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <span className="painel-rotulo">Nome do cliente</span>
        <input name="nome" required defaultValue={empresa?.nome} className="painel-campo" placeholder="Ex.: Farmácia Cristo" />
      </label>
      <label>
        <span className="painel-rotulo">Tipo de operação</span>
        <select name="tipo" defaultValue={empresa?.tipo ?? "leads"} className="painel-campo">
          <option value="leads">Geração de leads (foco em CPL)</option>
          <option value="ecommerce">E-commerce (foco em ROAS)</option>
        </select>
      </label>
      <label>
        <span className="painel-rotulo">Idioma do painel do cliente</span>
        <select name="idioma" defaultValue={empresa?.idioma ?? "pt"} className="painel-campo">
          {IDIOMAS.map((i) => (
            <option key={i} value={i}>
              {CONFIG_IDIOMA[i].nome}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="painel-rotulo">Moeda</span>
        <select name="moeda" defaultValue={empresa?.moeda ?? "BRL"} className="painel-campo">
          {MOEDAS.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="painel-rotulo">País (sigla)</span>
        <input name="pais" defaultValue={empresa?.pais ?? "BR"} maxLength={2} className="painel-campo uppercase" />
      </label>

      <p className="pt-2 font-display text-base font-extrabold sm:col-span-2">Metas mensais</p>
      <label>
        <span className="painel-rotulo">Investimento no mês</span>
        <input name="meta_investimento" inputMode="decimal" defaultValue={empresa?.meta_investimento ?? ""} className="painel-campo" placeholder="Ex.: 15000" />
      </label>
      <label>
        <span className="painel-rotulo">Leads no mês</span>
        <input name="meta_leads" inputMode="numeric" defaultValue={empresa?.meta_leads ?? ""} className="painel-campo" placeholder="Ex.: 300" />
      </label>
      <label>
        <span className="painel-rotulo">CPL máximo</span>
        <input name="meta_cpl" inputMode="decimal" defaultValue={empresa?.meta_cpl ?? ""} className="painel-campo" placeholder="Ex.: 45" />
      </label>
      <label>
        <span className="painel-rotulo">Receita no mês (e-commerce)</span>
        <input name="meta_receita" inputMode="decimal" defaultValue={empresa?.meta_receita ?? ""} className="painel-campo" placeholder="Ex.: 120000" />
      </label>
    </div>
  );
}
