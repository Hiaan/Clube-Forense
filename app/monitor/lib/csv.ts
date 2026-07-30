// Parser de CSV conforme RFC 4180, suficiente para o que o Google Sheets exporta.
//
// Não dá para usar `split(",")`: os campos de texto da curadoria têm vírgula
// ("...25 vagas imediatas, além de cadastro de reserva"), aspas e às vezes
// quebra de linha dentro da célula. Tudo isso vem entre aspas duplas, com aspas
// internas duplicadas — e é exatamente o que este parser trata.

/** Divide o CSV em linhas de campos já sem aspas. Linhas vazias são ignoradas. */
export function parseCSV(texto: string): string[][] {
  const linhas: string[][] = [];
  let campos: string[] = [];
  let campo = "";
  let dentroDeAspas = false;

  // O BOM que o Google às vezes envia viraria parte do primeiro cabeçalho.
  const s = texto.charCodeAt(0) === 0xfeff ? texto.slice(1) : texto;

  for (let i = 0; i < s.length; i++) {
    const c = s[i];

    if (dentroDeAspas) {
      if (c === '"') {
        // Aspas duplicadas representam uma aspa literal; senão, fecha o campo.
        if (s[i + 1] === '"') {
          campo += '"';
          i++;
        } else {
          dentroDeAspas = false;
        }
      } else {
        campo += c;
      }
      continue;
    }

    if (c === '"') {
      dentroDeAspas = true;
    } else if (c === ",") {
      campos.push(campo);
      campo = "";
    } else if (c === "\n" || c === "\r") {
      // Aceita LF, CRLF e CR sozinho.
      if (c === "\r" && s[i + 1] === "\n") i++;
      campos.push(campo);
      if (campos.some((x) => x.trim() !== "")) linhas.push(campos);
      campos = [];
      campo = "";
    } else {
      campo += c;
    }
  }

  // Último campo, quando o arquivo não termina em quebra de linha.
  if (campo !== "" || campos.length > 0) {
    campos.push(campo);
    if (campos.some((x) => x.trim() !== "")) linhas.push(campos);
  }

  return linhas;
}
