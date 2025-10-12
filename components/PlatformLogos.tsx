import React from 'react'

interface LogoProps {
  className?: string
}

export const GmgnLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/gmgn-logo.webp" 
    alt="GMGN" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const AxiomLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <img 
    src="/axiom-logo-optimized.webp" 
    alt="Axiom" 
    className={className}
    style={{ objectFit: 'contain' }}
  />
)

export const PhotonLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" fill="url(#photon-gradient)" />
    <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <defs>
      <linearGradient id="photon-gradient" x1="3" y1="3" x2="21" y2="21">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </svg>
)

export const BullxLogo: React.FC<LogoProps> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 17L9 5L15 17" stroke="url(#bullx-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 13H13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M15 5L19 17" stroke="url(#bullx-gradient)" strokeWidth="2.5" strokeLinecap="round"/>
    <defs>
      <linearGradient id="bullx-gradient" x1="5" y1="5" x2="19" y2="17">
        <stop offset="0%" stopColor="#a855f7" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
  </svg>
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
