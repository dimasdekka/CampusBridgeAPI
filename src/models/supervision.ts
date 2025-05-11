// (models) - supervision.ts
export enum SupervisionStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
}

export interface Supervision {
  id: string;
  studentId: string;
  professorId: string;
  dateTime: string;
  status: SupervisionStatus;
  topic?: string;
  notes?: string;
}

// Added only for testing purposes
export const SUPERVISIONS: Supervision[] = [
  {
    id: '9j5ljw1dh',
    studentId: '7z6ydcm',
    professorId: '41m3lxk',
    dateTime: '2025-03-11T13:15:29.364Z',
    status: SupervisionStatus.Pending,
    topic: 'Research methodology discussion',
    notes: 'First chapter review',
  },
  {
    id: '9j51ga1dh',
    studentId: '7z6ydcm',
    professorId: '41m3lxk',
    dateTime: '2025-03-18T13:15:29.364Z',
    status: SupervisionStatus.Pending,
    topic: 'Data analysis review',
    notes: 'Discussion about statistical methods',
  },
];
