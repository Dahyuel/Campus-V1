import React from 'react';
import { User } from '../../types';
import { SmartScheduleView } from '../shared/SmartScheduleView';

interface SmartScheduleTabProps {
  user: User;
}

export const SmartScheduleTab: React.FC<SmartScheduleTabProps> = () => {
  return <SmartScheduleView />;
};

export default SmartScheduleTab;