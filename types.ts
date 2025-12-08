
export type Screen = 'home' | 'diary' | 'stats' | 'settings' | 'add-event' | 'profile' | 'vaccination' | 'agenda';

export interface BabyProfile {
  name: string;
  birthDate: string;
  themeColor: 'blue' | 'pink' | 'purple' | 'green';
  gender: 'male' | 'female';
  photo?: string; // Base64 string for the image
}

export interface BabyDocument {
  id: string;
  title: string;
  type: 'id' | 'health_card' | 'prescription' | 'other';
  number?: string;
  notes?: string;
}

export type WidgetType = 'white_noise' | 'next_reminder' | 'quick_actions' | 'last_milestone';

export interface DashboardWidget {
  id: string;
  type: WidgetType;
}

export type EventCategory = 'food' | 'activity' | 'growth' | 'health' | 'milestone';

export type EventType = 
  // Food
  'breastfeeding' | 'bottle' | 'baby_food' | 'pumping' |
  // Activity
  'diaper' | 'sleep' | 'stroll' | 'bath' |
  // Growth
  'weight' | 'length' | 'head_circumference' | 'measurements' |
  // Health
  'doctor' | 'vaccine' | 'temperature' | 'illness' | 'medication' |
  // Milestone
  'first_step' | 'sat_up' | 'first_word' | 'first_tooth' | 'crawled' | 'smiled' | 'walked' | 'custom_milestone';

export interface LoggedEvent {
  id: string;
  type: EventType;
  timestamp: string;
  value?: number | string;
  unit?: string;
  notes?: string;
  // New fields for detailed events
  attachments?: ('photo' | 'audio' | 'video')[];
  attachmentData?: string; // Base64 for a single photo for simplicity in this demo
  
  // Sleep specific fields
  startTime?: string; // ISO date string
  endTime?: string; // ISO date string
  sleepType?: 'night' | 'nap';
  awakenings?: number;

  // Diaper specific fields
  diaperContent?: ('pee' | 'poop')[];

  // Medication specific fields
  medicationName?: string;
  medicationDosage?: string;
  medicationDuration?: string;

  // Breastfeeding specific fields
  breastfeedingSide?: 'left' | 'right' | 'both';
  breastfeedingDuration?: number; // minutes

  // Bottle specific fields
  bottleContent?: 'formula' | 'breast_milk' | 'cow_milk' | 'water' | 'juice';
  bottleAmount?: number; // ml

  // Baby Food specific fields
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodConsistency?: 'puree' | 'mashed' | 'pieces' | 'blw';
  foodAcceptance?: 'all' | 'most' | 'some' | 'refused';
  foodIngredients?: string;

  // Illness specific fields
  illnessSymptoms?: string[];
  illnessDiagnosis?: string;
  illnessTemperature?: number;
  illnessTreatment?: string;

  // Doctor specific fields
  doctorSpecialty?: string;
  doctorName?: string;
  visitReason?: string;

  // Vaccine specific fields
  vaccineId?: string;

  // Plagiocephaly specific fields
  plagiocephalyAsymmetry?: number; // mm
}

export interface EventDefinition {
  type: EventType;
  label: string;
  category: EventCategory;
  icon: string;
  hideInMenu?: boolean;
}

export interface Reminder {
  id: string;
  title: string;
  date: string; // ISO Date
  time: string;
  type: 'doctor' | 'vaccine' | 'other';
  notes?: string;
}

export interface VaccineInfo {
  id: string;
  name: string;
  description: string;
  monthDue: number; // 0 for birth, 2 for 2 months, etc.
  isPrivateOnly?: boolean;
}
