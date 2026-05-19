import { User, Ride, JoinRequest, Message, Notification, RideHistory, Person } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Mwangi',
  email: 'alex@must.ac.ug',
  gender: 'Male',
  campus: 'Mbarara University of Science and Technology',
  campusShort: 'MUST',
  universityId: '',
  hostel: 'Nyamitanga',
  verified: true,
  trust: 4.7,
  ridesCompleted: 23,
  ridesPosted: 15,
  ridesJoined: 8,
  avatarUrl: undefined,
  createdAt: new Date('2024-01-01'),
};

export const mockRides: Ride[] = [];

export const mockJoinRequests: JoinRequest[] = [];

export const mockMessages: Message[] = [
  { id: '1', senderId: '2', senderName: 'Fatima', text: "Hey! I'm at the gate now, near the security desk.", timestamp: new Date('2024-01-15T17:28:00'), isMine: false },
  { id: '2', senderId: '1', text: "Great, I'm walking over now. About 2 minutes away.", timestamp: new Date('2024-01-15T17:29:00'), isMine: true },
  { id: '3', senderId: '2', senderName: 'Fatima', text: "I'm wearing a blue jumper. Look out for me!", timestamp: new Date('2024-01-15T17:29:30'), isMine: false },
  { id: '4', senderId: '1', text: 'Got it, see you in a bit.', timestamp: new Date('2024-01-15T17:30:00'), isMine: true },
];

export const mockNotifications: Notification[] = [
  { id: '1', type: 'success', icon: 'user-plus', title: 'New Join Request', description: 'Diana Chebet wants to join your ride to Town Centre', timestamp: new Date(Date.now() - 2 * 60 * 1000), read: false },
  { id: '2', type: 'success', icon: 'check-circle', title: 'Request Accepted', description: 'Fatima accepted your request to Mbarara Town Centre', timestamp: new Date(Date.now() - 15 * 60 * 1000), read: false },
  { id: '3', type: 'warning', icon: 'clock', title: 'Ride Closing Soon', description: 'Your posted ride to Mbarara Market closes in 3 days', timestamp: new Date(Date.now() - 20 * 60 * 1000), read: false },
  { id: '4', type: 'success', icon: 'star', title: 'New Rating', description: 'James Otieno rated you 5 stars for yesterday\'s ride', timestamp: new Date(Date.now() - 60 * 60 * 1000), read: true },
  { id: '5', type: 'error', icon: 'times-circle', title: 'Ride Cancelled', description: 'Brian Kiprop cancelled the ride to Kakyeka', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), read: true },
  { id: '6', type: 'success', icon: 'shield-halved', title: 'Safety Verified', description: 'Your Safety PIN was confirmed for ride #47', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), read: true },
];

export const mockRideHistory: RideHistory[] = [];

export const mockPerson: Person = {
  name: 'Fatima Hassan',
  initials: 'FH',
  trust: 4.8,
  verified: true,
  gender: 'Female',
  color: '#E91E63',
};

export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} days ago`;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
