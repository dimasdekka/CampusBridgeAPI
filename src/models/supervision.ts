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

// ditambahkan untuk testing saja
export const SUPERVISIONS: Supervision[] = [
  {
    id: '9j5ljw1dh',
    studentId: '221091750079',
    professorId: '0000001',
    dateTime: '2025-03-11T13:15:29.364Z',
    status: SupervisionStatus.Pending,
    topic: 'Research methodology discussion',
    notes: 'First chapter review',
  },
  {
    id: '9j51ga1dh',
    studentId: '221091750079',
    professorId: '0000001',
    dateTime: '2025-03-18T13:15:29.364Z',
    status: SupervisionStatus.Pending,
    topic: 'Data analysis review',
    notes: 'Discussion about statistical methods',
  },
];
