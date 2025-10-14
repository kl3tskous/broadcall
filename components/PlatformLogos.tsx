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

export const platforms = [
  { id: 'gmgn', name: 'GMGN', Logo: GmgnLogo },
  { id: 'axiom', name: 'Axiom', Logo: AxiomLogo },
  { id: 'photon', name: 'Photon', Logo: PhotonLogo },
  { id: 'bullx', name: 'BullX', Logo: BullxLogo },
  { id: 'trojan', name: 'Trojan', Logo: TrojanLogo },
]
