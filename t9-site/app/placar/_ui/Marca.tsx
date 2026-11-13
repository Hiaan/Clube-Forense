/** Símbolo do Placar (barras de um placar). */
export default function Marca({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <span className="flex items-center gap-2.5 text-lg font-bold text-gray-900">
      <span className="flex items-center justify-center rounded-lg bg-[#2F5BEA]" style={{ width: tamanho, height: tamanho }}>
        <svg width={tamanho * 0.57} height={tamanho * 0.57} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M4 18V10M10 18V6M16 18v-5M22 18H2" />
        </svg>
      </span>
      Placar
    </span>
  );
}
