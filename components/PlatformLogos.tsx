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
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L20 7V13C20 17 16 20 12 21C8 20 4 17 4 13V7L12 3Z" fill="url(#trojan-gradient)" />
    <path d="M12 8L16 10V13C16 15 14 16.5 12 17C10 16.5 8 15 8 13V10L12 8Z" fill="currentColor" fillOpacity="0.4" />
    <defs>
      <linearGradient id="trojan-gradient" x1="4" y1="3" x2="20" y2="21">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </svg>
)

export const platforms = [
  { id: 'gmgn', name: 'GMGN', Logo: GmgnLogo },
  { id: 'axiom', name: 'Axiom', Logo: AxiomLogo },
  { id: 'photon', name: 'Photon', Logo: PhotonLogo },
  { id: 'bullx', name: 'BullX', Logo: BullxLogo },
  { id: 'trojan', name: 'Trojan', Logo: TrojanLogo },
]
