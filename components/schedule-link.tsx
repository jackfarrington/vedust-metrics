import Link from 'next/link';

export default function ScheduleLink() {
  return (
    <div className="flex justify-center">
      <Link href="/schedule">📅</Link>
    </div>
  );
}