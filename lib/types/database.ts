/**
 * Database Types - Generated from Supabase
 * ═════════════════════════════════════════════════════════════════════════════
 * Auto-generated from: npx supabase gen types typescript --project-id mrxsteroid --schema public
 * Do not edit manually — run the supabase command to regenerate
 */

// Compounds
export type CompoundFamily = 
  | 'testosterone' 
  | 'nandrolone' 
  | 'trenbolone' 
  | 'masteron' 
  | 'anavar' 
  | 'winstrol' 
  | 'proviron' 
  | 'other';

export type Compound = {
  id: number;
  name_en: string;
  name_ar?: string;
  family: CompoundFamily;
  suppression_factor: number;
  half_life_days: number;
  is_lipophilic: boolean;
  bioavailability: number;
  default_dose_mg: number;
  description_text?: string;
  created_at: string;
  updated_at: string;
};

// Compound Esters
export type EsterType = 
  | 'propionate' 
  | 'enanthate' 
  | 'cypionate' 
  | 'decanoate' 
  | 'undecylenate' 
  | 'acetate' 
  | 'other';

export type CompoundEster = {
  id: number;
  name_en: string;
  name_ar?: string;
  ester_type: EsterType;
  half_life_days: number;
  is_lipophilic: boolean;
  weight_factor: number;
  description_text?: string;
  created_at: string;
  updated_at: string;
};

// Medications
export type MedicationType = 
  | 'nolvadex' 
  | 'clomid' 
  | 'enclomiphene' 
  | 'toremifene' 
  | 'aromasin' 
  | 'arimidex' 
  | 'letrozole' 
  | 'hcg' 
  | 'pramipexole' 
  | 'cabergoline' 
  | 'other';

export type Medication = {
  id: number;
  name_en: string;
  name_ar?: string;
  medication_type: MedicationType;
  typical_dose_mg?: number;
  half_life_days?: number;
  description_text?: string;
  is_controlled: boolean;
  created_at: string;
  updated_at: string;
};

// User Profiles
export type MeasurementSystem = 'metric' | 'imperial';
export type UserRole = 'free' | 'premium' | 'vip';

export type UserProfile = {
  id: string;  // UUID stored as string
  user_id: string;  // UUID stored as string
  measurement_system: MeasurementSystem;
  role: UserRole;
  body_weight_kg?: number;
  body_height_cm?: number;
  created_at: string;
  updated_at: string;
};

// User Tool States
export type HcgPhase = {
  phase: string;
  start_date: string;
  end_date: string;
  dosage: string;
  warning: string;
};

export type SarmPhase = {
  phase: 'HPTA Kickstart' | 'Receptor Stabilization' | 'Weaning & Bio-Feedback' | 'Extended Weaning';
  start_date: string;
  end_date: string;
  compound: string;
  dosage: string;
};

export type PctProtocolResult = {
  status: 'Success';
  s_score: {
    sScore: number;
    interpretation: 'mild' | 'moderate' | 'severe';
    recommendedIntensity: 'mild' | 'moderate' | 'severe';
  };
  selectedSerm: string;
  hcgRequired: boolean;
  hcgPhases: HcgPhase[];
  sermPhases: SarmPhase[];
  totalDurationWeeks: number;
};

export type UserToolState = {
  id: string;  // UUID stored as string
  user_id: string;  // UUID stored as string
  current_stack: any;  // JSONB
  current_protocol?: string;
  s_score?: number;
  washout_date?: string;
  pct_start_date?: string;
  pct_duration_weeks?: number;
  hcg_phases: HcgPhase[];
  serm_phases: SarmPhase[];
  selected_serm: string;
  input_data: any;  // JSONB
  last_calculated_at?: string;
  created_at: string;
  updated_at: string;
};

// Query Result Types
export type SuppliesQueryResult = {
  data: Compound[];
  error?: any;
};

export type ProtocolsQueryResult = {
  data: UserToolState[];
  error?: any;
};

// Insert/Update Types
export type InsertCompound = {
  name_en: string;
  name_ar?: string;
  family: CompoundFamily;
  suppression_factor?: number;
  half_life_days?: number;
  is_lipophilic?: boolean;
  bioavailability?: number;
  default_dose_mg?: number;
  description_text?: string;
};

export type InsertUserProfile = {
  measurement_system: MeasurementSystem;
  role: UserRole;
  body_weight_kg?: number;
  body_height_cm?: number;
};

export type InsertUserToolState = {
  user_id: string;
  current_stack: any;
  current_protocol?: string;
  s_score?: number;
  washout_date?: string;
  pct_start_date?: string;
  pct_duration_weeks?: number;
  hcg_phases: HcgPhase[];
  serm_phases: SarmPhase[];
  selected_serm: string;
  input_data: any;
};