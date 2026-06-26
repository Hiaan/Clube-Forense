"use client";
import { useEffect, useState } from "react";

function useCountdown(targetHours = 24) {
  const [time, setTime] = useState({ h: targetHours, m: 0, s: 0 });
  useEffect(() => {
    const end = Date.now() + targetHours * 3600 * 1000;
    const t = setInterval(() => {
      const diff = Math.max(0, end - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return time;
}

const inclusos = [
  "Mentoria semanal e ao vivo",
  "Aulas gravadas de 100% do edital (PC-MA) — disponíveis offline",
  "Grupo com alunos e professores de medicina e direito",
  "Banco de questões exclusivo",
  "Simulados semanais",
  "9 eBooks de Medicina Legal completos",
  "Suporte pós-prova",
  "Cronograma Personalizado",
  "Flashcards Interativos",
  "Bônus: Resumos Ilustrados (Mapas Mentais) de Medicina Legal",
  "Reembolso incondicional de 7 dias",
  "eBooks e Apostilas das matérias de Conhecimentos Gerais",
  "Dr. Bonnet — IA com referências bibliográficas",
];

export default function Preco() {
  const { h, m, s } = useCountdown(23);

  return (
    <section id="preco" className="py-24 px-6" style={{ background: "#f8f9fb" }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-5">
          <p className="section-label">CONQUISTE SUA APROVAÇÃO</p>
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase text-center text-gray-900 mb-14">
          Tudo em um só lugar,{" "}
          <span style={{ color: "#e6b800" }}>com os melhores mentores.</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: features card */}
          <div className="card-white p-8" style={{ borderTop: "4px solid #ffcd07" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#fff9db" }}>
                <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                  <path d="M14 2L26 8V16C26 21.523 20.627 26.373 14 27C7.373 26.373 2 21.523 2 16V8L14 2Z" fill="rgba(255,205,7,0.2)" stroke="#ffcd07" strokeWidth="1.5"/>
                  <circle cx="14" cy="14" r="3" fill="#ffcd07"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-400">Mentoria</div>
                <div className="font-black text-gray-900">
                  Aprova <span style={{ color: "#e6b800" }}>Legista</span>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {inclusos.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#16a34a" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="text-sm text-red-400">
                <s>VALOR TOTAL: R$ 10.588,00</s>
              </div>
            </div>
          </div>

          {/* Right: pricing */}
          <div className="rounded-2xl p-8 flex flex-col" style={{ background: "#111827" }}>
            <div className="flex-1">
              <div className="text-xs mb-1 text-gray-400">OFERTA DE LANÇAMENTO:</div>
              <div className="font-black text-white mb-1" style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)", lineHeight: 1 }}>
                12x de{" "}
                <span style={{ color: "#ffcd07" }}>R$516,81</span>
              </div>
              <div className="text-base mb-8 text-gray-400">
                ou <strong className="text-white">R$ 4.997</strong> à vista
              </div>

              <a href="#" className="btn-yellow w-full py-4 text-center block text-base mb-6">
                APROVEITAR OFERTA AGORA
              </a>

              {/* Payment icons */}
              <div className="flex items-center justify-center flex-wrap gap-3 mb-8">
                {["VISA", "Mastercard", "Elo", "Amex", "Boleto", "PIX"].map((p) => (
                  <span key={p} className="text-xs font-bold px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Countdown */}
            <div className="pt-5 border-t border-white/10">
              <div className="flex justify-center gap-6 mb-2">
                {[
                  { v: String(h).padStart(2,"0"), l: "HORAS" },
                  { v: String(m).padStart(2,"0"), l: "MIN." },
                  { v: String(s).padStart(2,"0"), l: "SEG." },
                ].map((t) => (
                  <div key={t.l} className="text-center">
                    <div className="font-black" style={{ color: "#ffcd07", fontSize: "2rem", lineHeight: 1 }}>{t.v}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{t.l}</div>
                  </div>
                ))}
              </div>
              <p className="text-center text-xs font-black uppercase" style={{ color: "#ffcd07" }}>
                As matrículas podem encerrar a qualquer momento
              </p>
            </div>
          </div>
        </div>

        {/* Availability */}
        <p className="text-center mt-4 text-xs text-gray-400">
          Disponibilidade limitada. Poucas vagas disponíveis.*
        </p>
      </div>
    </section>
  );
}
