// src/components/Footer.jsx — mesma assinatura do Lab MasterMix

import logoLaboratorio from '../assets/litex.png';

export function Footer() {
  return (
    <footer className="w-full mt-12 py-4 flex items-center justify-center text-sm text-gray-500">
      <div className="flex items-center gap-3">
        <img src={logoLaboratorio} alt="Logo do LITEX" className="h-12" />
        <span>
          Desenvolvido por: Lennon P Caires| © {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}
