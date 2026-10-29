import mongoose from 'mongoose';
import { AuditLog } from '../models/AuditLog';

export class AuditService {
  static async log(params: {
    action: string;
    performedBy: string | mongoose.Types.ObjectId;
    targetType: 'user' | 'internship' | 'job' | 'company' | 'report' | 'system';
    targetId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await AuditLog.create({
        action: params.action,
        performedBy: new mongoose.Types.ObjectId(params.performedBy.toString()),
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details,
        ipAddress: params.ipAddress,
      });
    } catch (error) {
      // Never crash a request if audit log recording fails
      console.error('[AuditService] Failed to record audit log:', error);
    }
  }
}
