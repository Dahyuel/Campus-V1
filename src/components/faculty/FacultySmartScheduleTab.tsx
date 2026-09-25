import React from 'react';
import { User } from '../../types';
import { SmartScheduleView } from '../shared/SmartScheduleView';

interface FacultySmartScheduleTabProps {
  user: User;
}

export const FacultySmartScheduleTab: React.FC<FacultySmartScheduleTabProps> = () => {
  return <SmartScheduleView />;
};

export default FacultySmartScheduleTab;