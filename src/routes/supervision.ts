import { Request, Response, Router } from 'express';
import { USERS, UserRole } from '../models/user';
import { SUPERVISIONS, SupervisionStatus } from '../models/supervision';
import { authenticateToken } from '../middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Create supervision meet
router.post(
  '/',
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const { professorId, dateTime, topic, notes } = req.body;
    const user = req.user!;

    if (!professorId || !dateTime || !topic) {
      return res.status(400).json({
        message: 'Professor ID, dateTime, and topic are required.',
      });
    }

    if (user.role !== UserRole.Student) {
      return res
        .status(403)
        .json({ message: 'Only students can schedule supervision meetings' });
    }

    const professor = USERS.find(
      (u) => u.id === professorId && u.role === UserRole.Professor
    );
    if (!professor) {
      return res.status(404).json({ message: 'Professor not found' });
    }

    const supervision = {
      id: Math.random().toString(36).substring(2, 9),
      studentId: user.id,
      professorId,
      dateTime,
      status: SupervisionStatus.Pending,
      topic,
      notes: notes || '',
    };

    SUPERVISIONS.push(supervision);
    return res.json(supervision);
  }
);

// Get supervision meetings
router.get(
  '/',
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const user = req.user!;

    const userSupervisions = SUPERVISIONS.filter((supervision) =>
      user.role === UserRole.Student
        ? supervision.studentId === user.id
        : supervision.professorId === user.id
    );

    const supervisionsWithStudentInfo = userSupervisions.map((supervision) => {
      const student = USERS.find((user) => user.id === supervision.studentId);
      const professor = USERS.find(
        (user) => user.id === supervision.professorId
      );
      return {
        ...supervision,
        studentName: student?.name,
        studentEmail: student?.email,
        professorName: professor?.name,
      };
    });

    return res.json(supervisionsWithStudentInfo);
  }
);

// Update supervision status
router.patch(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const user = req.user!;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const supervision = SUPERVISIONS.find((s) => s.id === id);
    if (!supervision) {
      return res.status(404).json({ message: 'Supervision meeting not found' });
    }

    if (
      user.role !== UserRole.Professor ||
      supervision.professorId !== user.id
    ) {
      return res.status(403).json({
        message: 'Only the assigned professor can update supervision status',
      });
    }

    if (!Object.values(SupervisionStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    supervision.status = status;
    if (feedback) {
      supervision.notes = supervision.notes
        ? `${supervision.notes}\n\nFeedback: ${feedback}`
        : `Feedback: ${feedback}`;
    }

    return res.json(supervision);
  }
);

// Add thesis progress
router.post(
  '/:id/progress',
  authenticateToken,
  async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;
    const { progressDetails, attachmentLinks } = req.body;
    const user = req.user!;

    if (!progressDetails) {
      return res.status(400).json({
        message: 'Progress details are required.',
      });
    }

    const supervision = SUPERVISIONS.find((s) => s.id === id);
    if (!supervision) {
      return res.status(404).json({ message: 'Supervision meeting not found' });
    }

    if (user.role !== UserRole.Student || supervision.studentId !== user.id) {
      return res
        .status(403)
        .json({ message: 'Only the student can add progress updates' });
    }

    const sanitizedAttachments = Array.isArray(attachmentLinks)
      ? attachmentLinks.join(', ')
      : 'None';

    const progressUpdate = `Progress Update: ${progressDetails}\nAttachments: ${sanitizedAttachments}`;

    supervision.notes = supervision.notes
      ? `${supervision.notes}\n\n${progressUpdate}`
      : progressUpdate;

    return res.json(supervision);
  }
);

export default router;
