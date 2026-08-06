// Aprovados do Clube: fotos e dados das aprovações.

import FormAprovado from "./FormAprovado";
import ListaAprovados from "./ListaAprovados";
import { listarAprovados } from "../../../lib/aprovadosRepo";
import { blobConfigurado } from "../../../lib/blob";
import { ESTADOS } from "../../../monitor/lib/estados";
import { APROVADOS } from "../../../monitor/lib/aprovados";

export const dynamic = "force-dynamic";

export default async function PainelAprovados() {
  const aprovados = await listarAprovados();
  const temBlob = blobConfigurado();
  const estados = ESTADOS.map((e) => ({ uf: e.uf, nome: e.nome }));

  // Quantos existem hoje na lista embutida no código — é o que o site mostra
  // enquanto esta tabela estiver vazia.
  const noCodigo = Object.values(APROVADOS).reduce((s, a) => s + a.nomes.length, 0);

  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Aprovados</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quem passou, em que estado, com que colocação — e a foto que aparece no
          card do estado.
        </p>
      </header>

      {aprovados === null && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Banco indisponível. Confira a variável <code>DATABASE_URL</code> na Vercel.
        </div>
      )}

      {!temBlob && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          A store de imagens (Blob) não está conectada a este projeto, então o campo
          de foto fica escondido. Vercel → projeto → Storage → conecte a store; a
          variável <code>BLOB_STORE_ID</code> aparece sozinha nas variáveis de
          ambiente. O resto do cadastro funciona sem ela.
        </div>
      )}

      {aprovados !== null && aprovados.length === 0 && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-sm text-gray-600">
          Ainda não há ninguém cadastrado aqui. Enquanto esta lista estiver vazia, o
          site mostra os <strong>{noCodigo} aprovados</strong> que estão escritos no
          código. Assim que você cadastrar o primeiro, esta lista passa a mandar.
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-2 text-sm font-bold text-gray-900">Cadastrar aprovado</h2>
        <FormAprovado estados={estados} inicial={null} temBlob={temBlob} />
      </div>

      {aprovados !== null && aprovados.length > 0 && (
        <ListaAprovados aprovados={aprovados} estados={estados} temBlob={temBlob} />
      )}
    </>
  );
}
