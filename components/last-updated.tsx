'use client';

import { useEffect, useState } from 'react';

interface LastUpdatedProps {
  timestamp: number | string | Date;
}

export default function LastUpdated({ timestamp }: LastUpdatedProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    const lastUpdate = new Date(timestamp);

    const updateTimeAgo = () => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

      let newText = '';

      if (seconds < 60) {
        newText = 'just now';
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        newText = `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        newText = `${hours} hour${hours === 1 ? '' : 's'} ago`;
      } else {
        const days = Math.floor(seconds / 86400);
        newText = `${days} day${days === 1 ? '' : 's'} ago`;
      }

      setTimeAgo(newText);
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 60000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return (
    <span className="py-3 text-sm text-gray-500">
      Last updated {timeAgo}
    </span>
  );
}