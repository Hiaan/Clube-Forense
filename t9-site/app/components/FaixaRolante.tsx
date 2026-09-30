const ITENS = [
  "Tráfego Pago",
  "Meta Ads",
  "Google Ads",
  "Páginas de Vendas",
  "CRM",
  "Funis de Vendas",
  "Automações",
  "Agentes de IA",
  "Dashboard Central",
];

export default function FaixaRolante() {
  const lista = [...ITENS, ...ITENS];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-[#7c0409] py-5" aria-hidden="true">
      <div className="marquee">
        {lista.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-8 pr-8 font-display text-xl font-extrabold tracking-tight whitespace-nowrap uppercase sm:text-2xl"
          >
            {item}
            <span className="text-[#ff5a63]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
