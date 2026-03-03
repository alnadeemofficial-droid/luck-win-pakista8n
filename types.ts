
export enum EntryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  AWAITING_TID = 'AWAITING_TID'
}

export interface TermCondition {
  id: string;
  textUr: string;
  textEn: string;
}

export interface InvestmentOption {
  id: string;
  investAmount: number;
  winAmount: number;
  membersNeeded: number;
  currentMembers: number;
  qrData?: string; 
  qrImage?: string; 
  color?: string;
  isExpired?: boolean;
  drawCompleted?: boolean;
  // New Fields
  cardType: 'member-based' | 'time-based' | 'custom-design';
  drawDate?: number; // For time-based
  bonusPercentage?: number;
  customBgImage?: string;
  customTextColor?: string;
  termsIds: string[]; // Selected terms for this card
  descriptionUr?: string;
  descriptionEn?: string;
  designVariant?: 'default' | 'gold' | 'royal' | 'neon' | 'minimal' | 'dark' | 'glass';
}

export interface Participant {
  id: string;
  name: string;
  phone: string;
  network: string;
  secondaryPhone?: string;
  secondaryNetwork?: string;
  whatsapp?: string; // Optional WhatsApp number
  categoryId: string;
  investAmount?: number;
  trackingId: string;
  status: EntryStatus;
  timestamp: number;
  secretToken?: string; 
  isWinner?: boolean;
  winAmount?: number;
  winningDate?: number;
  referredBy?: string; // For invite system
  referralCount?: number;
}

export interface Announcement {
  id: string;
  text: string;
  textEn: string;
  active: boolean;
}

export interface AdService {
  id: string;
  titleUr: string;
  titleEn: string;
  descriptionUr?: string;
  descriptionEn?: string;
  imageUrl?: string;
  linkUrl?: string;
  category: string;
  active: boolean;
}

export interface GlobalAd {
  id: string;
  adNetwork: string; // e.g., 'Adsterra', 'AdSense', 'PropellerAds'
  location: string; // e.g., 'Home', 'Status', 'Result'
  placement: string; // Specific placement ID e.g., 'Header', 'Direct_Link_Status'
  linkUrl: string;
  active: boolean;
  isExpired?: boolean;
  expiryDate?: number;
}

export type Language = 'ur' | 'en';
