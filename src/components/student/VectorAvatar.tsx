import React from 'react';

interface VectorAvatarProps {
  outfit?: boolean;
  shoes?: boolean;
  hat?: boolean;
  accessory?: boolean;
  item?: boolean;
  companion?: boolean;
  size?: string; // ex: "w-full h-full" ou "w-32 h-32"
}

export const VectorAvatar: React.FC<VectorAvatarProps> = ({
  outfit = true,
  shoes = true,
  hat = true,
  accessory = true,
  item = true,
  companion = true,
  size = 'w-full h-full',
}) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={size}>
      {/* 1. CORPO BASE (Sempre visível) */}
      <g id="base">
        <g stroke="#f5c6a0" strokeWidth="44" strokeLinecap="round">
          <path d="M410 505L325 685"/><path d="M614 505L699 685"/><path d="M468 760V925" strokeWidth="62"/><path d="M556 760V925" strokeWidth="62"/>
        </g>
        <circle cx="322" cy="702" r="30" fill="#f5c6a0"/><circle cx="702" cy="702" r="30" fill="#f5c6a0"/>
        <ellipse cx="462" cy="948" rx="50" ry="22" fill="#f5c6a0"/><ellipse cx="562" cy="948" rx="50" ry="22" fill="#f5c6a0"/>
        <rect x="482" y="410" width="60" height="75" fill="#e3a97f"/>
        <g fill="#b8bcc4"><path d="M418 480Q512 458 606 480L618 700H406Z"/></g>
        <g stroke="#b8bcc4" strokeWidth="58"><path d="M410 505L378 565"/><path d="M614 505L646 565"/></g>
        <path d="M406 690H618L632 800H520L512 760L504 800H392Z" fill="#9ea3ad"/>
        <ellipse cx="512" cy="300" rx="125" ry="138" fill="#f5c6a0"/>
        <circle cx="387" cy="305" r="22" fill="#f5c6a0"/><circle cx="637" cy="305" r="22" fill="#f5c6a0"/>
        <ellipse cx="470" cy="305" rx="21" ry="27" fill="#fff"/><ellipse cx="554" cy="305" rx="21" ry="27" fill="#fff"/>
        <circle cx="472" cy="310" r="14" fill="#3b2a1d"/><circle cx="552" cy="310" r="14" fill="#3b2a1d"/>
        <circle cx="477" cy="303" r="5" fill="#fff"/><circle cx="557" cy="303" r="5" fill="#fff"/>
        <ellipse cx="428" cy="355" rx="22" ry="13" fill="#f29a8f" opacity=".6"/><ellipse cx="596" cy="355" rx="22" ry="13" fill="#f29a8f" opacity=".6"/>
        <path d="M478 368Q512 398 546 368" fill="none" stroke="#a8503c" strokeWidth="7" strokeLinecap="round"/>
        <g stroke="#4a3426" strokeWidth="7" strokeLinecap="round" fill="none"><path d="M445 262Q470 250 495 262"/><path d="M529 262Q554 250 579 262"/></g>
      </g>

      {/* 2. OUTFIT (Roupa) */}
      {outfit && (
        <g id="outfit">
          <g stroke="#f4f4f4" strokeWidth="62" strokeLinecap="round"><path d="M410 505L340 650"/><path d="M614 505L684 650"/></g>
          <path d="M418 480Q512 458 606 480L618 700H406Z" fill="#f4f4f4"/>
          <g fill="#1d2f66">
            <rect x="406" y="500" width="212" height="18"/><rect x="408" y="548" width="208" height="18"/>
            <rect x="410" y="596" width="204" height="18"/><rect x="412" y="644" width="200" height="18"/>
          </g>
          <rect x="396" y="676" width="232" height="30" fill="#d6293a"/>
          <g stroke="#15151a" strokeWidth="68" strokeLinecap="round"><path d="M468 760V910"/><path d="M556 760V910"/></g>
          <path d="M392 700H632L638 790H386Z" fill="#15151a"/>
          <path d="M404 905H516L520 965H404Z M508 905H620L620 965H504Z" fill="#0b0b0e"/>
        </g>
      )}

      {/* 3. SAPATOS */}
      {shoes && (
        <g id="shoes">
          <ellipse cx="458" cy="945" rx="56" ry="26" fill="#e8ff3a"/><rect x="402" y="958" width="112" height="9" rx="4" fill="#111"/><path d="M444 932q14 -8 28 0" stroke="#111" strokeWidth="5" fill="none"/>
          <ellipse cx="566" cy="945" rx="56" ry="26" fill="#e8ff3a"/><rect x="510" y="958" width="112" height="9" rx="4" fill="#111"/><path d="M552 932q14 -8 28 0" stroke="#111" strokeWidth="5" fill="none"/>
        </g>
      )}

      {/* 4. CHAPÉU / CABELO */}
      {hat && (
        <g id="hat">
          <path d="M410 190L398 110L452 165Z M614 190L626 110L572 165Z" fill="#e8b830"/>
          <path d="M424 175L412 130L440 160Z" fill="#f4a6b8"/>
          <path d="M388 215Q512 150 636 215" fill="none" stroke="#d6293a" strokeWidth="16"/>
        </g>
      )}

      {/* 5. ACESSÓRIO FACIAL */}
      {accessory && (
        <g id="accessory">
          <path fillRule="evenodd" fill="#d6293a" d="M415 285Q512 250 609 285L602 335Q512 318 422 335Z M470 305m-24 0a24 30 0 1 0 48 0a24 30 0 1 0 -48 0 M554 305m-24 0a24 30 0 1 0 48 0a24 30 0 1 0 -48 0"/>
        </g>
      )}

      {/* 6. ITEM NA MÃO */}
      {item && (
        <g id="item">
          <circle cx="322" cy="640" r="46" fill="#fff" stroke="#15151a" strokeWidth="5"/>
          <path d="M322 616l24 18l-9 28h-30l-9-28z" fill="#15151a"/>
          <path d="M322 594v22M346 634l22-8M337 662l14 20M307 662l-14 20M298 634l-22-8" stroke="#15151a" strokeWidth="5"/>
          <circle cx="322" cy="702" r="30" fill="#f5c6a0"/>
        </g>
      )}

      {/* 7. MASCOTE / ACOMPANHANTE */}
      {companion && (
        <g id="companion">
          <g transform="translate(815 960)">
            <path d="M-50 -90L-110 -140L-80 -60Z M50 -90L110 -140L80 -60Z" fill="#7a2cff"/>
            <path d="M62 -30Q130 -20 120 -70Q114 -36 70 -50Z" fill="#3fb868"/>
            <ellipse cx="0" cy="-50" rx="56" ry="50" fill="#3fb868"/>
            <ellipse cx="0" cy="-40" rx="32" ry="38" fill="#c8f0d2"/>
            <path d="M-26 -148L-34 -190L-6 -160Z M26 -148L34 -190L6 -160Z" fill="#f2c230"/>
            <circle cx="0" cy="-118" r="48" fill="#3fb868"/>
            <ellipse cx="0" cy="-104" rx="26" ry="16" fill="#8fe0a8"/>
            <circle cx="-8" cy="-106" r="3" fill="#15151a"/><circle cx="8" cy="-106" r="3" fill="#15151a"/>
            <circle cx="-22" cy="-130" r="7" fill="#15151a"/><circle cx="-20" cy="-133" r="2.5" fill="#fff"/>
            <circle cx="22" cy="-130" r="7" fill="#15151a"/><circle cx="24" cy="-133" r="2.5" fill="#fff"/>
            <path d="M-14 -94Q0 -86 14 -94" stroke="#15151a" strokeWidth="3" fill="none"/>
          </g>
        </g>
      )}
    </svg>
  );
};