import React from 'react'

interface LogoProps {
  className?: string
}

export const GmgnLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/platforms/gmgn.png" 
    alt="GMGN" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const AxiomLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/platforms/axiom.png" 
    alt="Axiom" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const PhotonLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/platforms/photon.png" 
    alt="Photon" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const BullxLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/platforms/bullx.png" 
    alt="BullX" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const TrojanLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/platforms/trojan.png" 
    alt="Trojan" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const DexScreenerLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <svg 
    className={className}
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" fill="#0D1421" stroke="#00D4AA" strokeWidth="1.5"/>
    <path d="M8 12L11 15L16 9" stroke="#00D4AA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export const platforms = [
  { id: 'gmgn', name: 'GMGN', Logo: GmgnLogo },
  { id: 'axiom', name: 'Axiom', Logo: AxiomLogo },
  { id: 'photon', name: 'Photon', Logo: PhotonLogo },
  { id: 'bullx', name: 'BullX', Logo: BullxLogo },
  { id: 'trojan', name: 'Trojan', Logo: TrojanLogo },
  { id: 'dexscreener', name: 'DexScreener', Logo: DexScreenerLogo },
]
