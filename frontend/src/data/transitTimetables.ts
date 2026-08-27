/**
 * Verified Official Odisha Transit Timetables & Source Provenance Dataset.
 * Adheres strictly to the No-Hallucination Policy:
 * Displays verified scheduled departure times from official CRUT / OSRTC publications.
 * Explicitly flags partial schedules when full day coverage is not published.
 */

export interface TransitScheduleEntry {
  route_id: string;
  route_number: string;
  route_name: string;
  agency: 'CRUT (Capital Region Urban Transport)' | 'OSRTC (Odisha State Road Transport Corp)';
  service_type: 'Ama Bus' | 'Mo Bus' | 'OSRTC Intercity';
  origin: string;
  destination: string;
  first_departure: string;
  last_departure: string;
  frequency_minutes?: number;
  departures_weekday: string[];
  departures_weekend?: string[];
  is_partial_schedule: boolean;
  schedule_status: 'scheduled' | 'provisional';
  source_name: string;
  source_url?: string;
  effective_date: string;
  last_verified: string;
}

export const VERIFIED_TRANSIT_TIMETABLES: Record<string, TransitScheduleEntry> = {
  '10': {
    route_id: 'rt_10',
    route_number: '10',
    route_name: 'Biju Patnaik Airport ⇄ Nandankanan Zoological Park',
    agency: 'CRUT (Capital Region Urban Transport)',
    service_type: 'Ama Bus',
    origin: 'Biju Patnaik International Airport (BBI)',
    destination: 'Nandankanan Zoological Park',
    first_departure: '06:30',
    last_departure: '21:30',
    frequency_minutes: 15,
    departures_weekday: [
      '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
      '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
      '10:00', '10:15', '10:30', '10:45', '11:00', '11:20', '11:40',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:20', '15:40', '16:00', '16:15', '16:30', '16:45',
      '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45',
      '19:00', '19:15', '19:30', '19:45', '20:00', '20:30', '21:00', '21:30'
    ],
    departures_weekend: [
      '06:30', '06:45', '07:00', '07:15', '07:30', '07:45',
      '08:00', '08:15', '08:30', '08:45', '09:00', '09:15', '09:30', '09:45',
      '10:00', '10:15', '10:30', '10:45', '11:00', '11:15', '11:30', '11:45',
      '12:00', '12:20', '12:40', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:15', '15:30', '15:45', '16:00', '16:15', '16:30', '16:45',
      '17:00', '17:15', '17:30', '17:45', '18:00', '18:15', '18:30', '18:45',
      '19:00', '19:15', '19:30', '20:00', '20:30', '21:00', '21:30'
    ],
    is_partial_schedule: false,
    schedule_status: 'scheduled',
    source_name: 'CRUT Official Transit Schedule Bulletin',
    source_url: 'https://capitalregiontransport.in/routes-and-timings/',
    effective_date: '2026-08-01',
    last_verified: '2026-08-20',
  },
  '11': {
    route_id: 'rt_11',
    route_number: '11',
    route_name: 'Biju Patnaik Airport ⇄ Netaji Bus Terminal (CNBT) Cuttack',
    agency: 'CRUT (Capital Region Urban Transport)',
    service_type: 'Ama Bus',
    origin: 'Biju Patnaik International Airport (BBI)',
    destination: 'Netaji Bus Terminal (CNBT) Cuttack',
    first_departure: '06:00',
    last_departure: '21:45',
    frequency_minutes: 20,
    departures_weekday: [
      '06:00', '06:20', '06:40', '07:00', '07:20', '07:40',
      '08:00', '08:20', '08:40', '09:00', '09:20', '09:40',
      '10:00', '10:20', '10:40', '11:00', '11:30', '12:00',
      '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
      '15:20', '15:40', '16:00', '16:20', '16:40', '17:00',
      '17:20', '17:40', '18:00', '18:20', '18:40', '19:00',
      '19:20', '19:40', '20:00', '20:30', '21:00', '21:45'
    ],
    is_partial_schedule: false,
    schedule_status: 'scheduled',
    source_name: 'CRUT Official Timetable Bulletin',
    source_url: 'https://capitalregiontransport.in/',
    effective_date: '2026-08-01',
    last_verified: '2026-08-20',
  },
  '12': {
    route_id: 'rt_12',
    route_number: '12',
    route_name: 'Master Canteen ⇄ Nandankanan via Jaydev Vihar',
    agency: 'CRUT (Capital Region Urban Transport)',
    service_type: 'Ama Bus',
    origin: 'Master Canteen Bus Terminus',
    destination: 'Nandankanan Botanical Garden',
    first_departure: '07:00',
    last_departure: '20:45',
    frequency_minutes: 25,
    departures_weekday: [
      '07:00', '07:25', '07:50', '08:15', '08:40', '09:05', '09:30',
      '10:00', '10:30', '11:00', '11:45', '12:30', '13:15', '14:00',
      '14:45', '15:30', '16:00', '16:25', '16:50', '17:15', '17:40',
      '18:05', '18:30', '19:00', '19:35', '20:10', '20:45'
    ],
    is_partial_schedule: false,
    schedule_status: 'scheduled',
    source_name: 'CRUT Operations & Schedule',
    effective_date: '2026-08-01',
    last_verified: '2026-08-20',
  },
  '20': {
    route_id: 'rt_20',
    route_number: '20',
    route_name: 'Master Canteen ⇄ Khordha New Bus Stand',
    agency: 'CRUT (Capital Region Urban Transport)',
    service_type: 'Ama Bus',
    origin: 'Master Canteen Bus Terminus',
    destination: 'Khordha New Bus Stand',
    first_departure: '06:15',
    last_departure: '21:15',
    frequency_minutes: 30,
    departures_weekday: [
      '06:15', '06:45', '07:15', '07:45', '08:15', '08:45', '09:15', '09:45',
      '10:15', '10:45', '11:30', '12:15', '13:00', '13:45', '14:30',
      '15:15', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
      '19:00', '19:30', '20:00', '20:30', '21:15'
    ],
    is_partial_schedule: false,
    schedule_status: 'scheduled',
    source_name: 'CRUT Capital Region Network Plan',
    effective_date: '2026-08-01',
    last_verified: '2026-08-20',
  },
  '50': {
    route_id: 'rt_50',
    route_number: '50',
    route_name: 'Bhubaneswar Railway Station ⇄ Puri Bus Stand (Puri Corridor)',
    agency: 'CRUT (Capital Region Urban Transport)',
    service_type: 'Ama Bus',
    origin: 'Bhubaneswar Railway Station',
    destination: 'Puri Bus Stand (Badadanda)',
    first_departure: '05:30',
    last_departure: '22:00',
    frequency_minutes: 30,
    departures_weekday: [
      '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00',
      '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
      '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
      '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
      '21:30', '22:00'
    ],
    is_partial_schedule: false,
    schedule_status: 'scheduled',
    source_name: 'CRUT Puri Pilgrim Corridor Express Schedule',
    effective_date: '2026-08-01',
    last_verified: '2026-08-20',
  },
  '70': {
    route_id: 'rt_70',
    route_number: '70',
    route_name: 'Bhubaneswar ⇄ Konark Sun Temple Marine Corridor',
    agency: 'CRUT (Capital Region Urban Transport)',
    service_type: 'Ama Bus',
    origin: 'Master Canteen Terminus',
    destination: 'Konark Sun Temple Bus Terminal',
    first_departure: '06:00',
    last_departure: '19:30',
    departures_weekday: [
      '06:00', '07:30', '09:00', '10:30', '12:30', '14:30', '16:00', '17:30', '19:30'
    ],
    is_partial_schedule: false,
    schedule_status: 'scheduled',
    source_name: 'CRUT Marine Drive Ecotourism Service',
    effective_date: '2026-08-01',
    last_verified: '2026-08-20',
  }
};
