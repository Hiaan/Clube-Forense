import { ehEquipe } from "@/lib/painel/auth";
import { listarArquivos } from "@/lib/painel/dados";
import { dataHora } from "@/lib/painel/formato";
import { fmt } from "@/lib/i18n";
import { adicionarArquivo, removerArquivo } from "../../acoes-conteudo";
import { BotaoEnviar } from "../../_ui/Botoes";
import FormComEstado from "../../_ui/FormComEstado";
import { contextoEmpresa } from "../contexto";

const ehDrive = (url: string) => /drive\.google\.com|docs\.google\.com/.test(url);

export default async function Arquivos({ params }: { params: Promise<{ empresa: string }> }) {
  const { usuario, empresa, idioma, t } = await contextoEmpresa(params);
  const arquivos = await listarArquivos(empresa.id);
  const ta = t.arquivos;

  return (
    <>
      <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{ta.titulo}</h1>
      <p className="mt-1 text-white/55">{ta.subtitulo}</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <FormComEstado acao={adicionarArquivo} limparAoSalvar className="painel-cartao h-fit p-6">
          <input type="hidden" name="empresa" value={empresa.id} />
          <div className="grid gap-3">
            <label>
              <span className="painel-rotulo">{ta.nome}</span>
              <input name="titulo" required maxLength={150} className="painel-campo" />
            </label>
            <label>
              <span className="painel-rotulo">{ta.link}</span>
              <input name="url" type="url" required className="painel-campo" placeholder="https://drive.google.com/..." />
            </label>
            <label>
              <span className="painel-rotulo">{ta.nota}</span>
              <textarea name="nota" rows={2} maxLength={500} className="painel-campo" />
            </label>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/45">{ta.dica}</p>
          <BotaoEnviar enviando={ta.enviando} className="botao-painel mt-4">
            {ta.enviar}
          </BotaoEnviar>
        </FormComEstado>

        <section className="painel-cartao h-fit overflow-hidden">
          {arquivos.length === 0 ? (
            <p className="p-6 text-center text-white/55">{ta.vazio}</p>
          ) : (
            <ul className="divide-y divide-white/6">
              {arquivos.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-4">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/8 text-sm" aria-hidden="true">
                    {ehDrive(a.url) ? "▲" : "🔗"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-medium break-words hover:underline">
                      {a.titulo}
                    </a>
                    {a.nota && <p className="mt-0.5 text-sm text-white/60">{a.nota}</p>}
                    <p className="mt-1 text-xs text-white/40">
                      {fmt(ta.enviadoPor, { nome: a.autor ?? empresa.nome, data: dataHora(a.criado_em, idioma) })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="botao-painel botao-painel-sec !min-h-[34px] !px-3 !text-xs">
                      {ta.abrir} ↗
                    </a>
                    {(ehEquipe(usuario) || a.usuario_id === usuario.id) && (
                      <form action={removerArquivo}>
                        <input type="hidden" name="arquivo" value={a.id} />
                        <BotaoEnviar className="px-1 text-xs text-white/40 hover:text-[#ff8a90]" confirmar={ta.confirmarRemocao}>
                          {ta.remover}
                        </BotaoEnviar>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
