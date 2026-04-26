import { User, Ride, JoinRequest, Message, Notification, RideHistory, Person } from '../types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Mwangi',
  email: 'alex@must.ac.ug',
  gender: 'Male',
  campus: 'Mbarara University of Science and Technology',
  campusShort: 'MUST',
  hostel: 'Nyamitanga',
  verified: true,
  trust: 4.7,
  ridesCompleted: 23,
  ridesPosted: 15,
  ridesJoined: 8,
  createdAt: new Date('2024-01-01'),
};

export const mockRides: Ride[] = [
  {
    id: '1',
    campus: 'MUST',
    poster: { name: 'Fatima Hassan', initials: 'FH', trust: 4.8, verified: true, gender: 'Female', color: '#E91E63' },
    from: 'Main Campus Gate',
    to: 'Mbarara Town Centre',
    departureType: 'immediate',
    seatsTotal: 2,
    seatsTaken: 1,
    genderPreference: 'same',
    mode: 'boda',
    postedAt: new Date(Date.now() - 2 * 60 * 1000),
    status: 'active',
  },
  {
    id: '2',
    campus: 'MUST',
    poster: { name: 'James Otieno', initials: 'JO', trust: 4.5, verified: true, gender: 'Male', color: '#2196F3' },
    from: 'Hostel A Parking',
    to: 'Mbarara Market',
    departureType: 'scheduled',
    scheduledDate: 'Wed',
    scheduledTime: '10:00 AM',
    closesIn: '3 days',
    seatsTotal: 3,
    seatsTaken: 1,
    genderPreference: 'any',
    mode: 'boda',
    postedAt: new Date(Date.now() - 5 * 60 * 1000),
    status: 'active',
  },
  {
    id: '3',
    campus: 'MUST',
    poster: { name: 'Grace Wanjiku', initials: 'GW', trust: 4.9, verified: true, gender: 'Female', color: '#9C27B0' },
    from: 'Library Entrance',
    to: 'Ruharo',
    departureType: 'immediate',
    seatsTotal: 2,
    seatsTaken: 0,
    genderPreference: 'same',
    mode: 'boda',
    postedAt: new Date(),
    status: 'active',
  },
  {
    id: '4',
    campus: 'MUST',
    poster: { name: 'Brian Kiprop', initials: 'BK', trust: 3.8, verified: false, gender: 'Male', color: '#FF5722' },
    from: 'Engineering Block',
    to: 'Kakyeka Stage',
    departureType: 'scheduled',
    scheduledDate: 'Fri',
    scheduledTime: '5:30 PM',
    closesIn: '5 days',
    seatsTotal: 2,
    seatsTaken: 0,
    genderPreference: 'any',
    mode: 'boda',
    postedAt: new Date(Date.now() - 10 * 60 * 1000),
    status: 'active',
  },
  {
    id: '5',
    campus: 'MUST',
    poster: { name: 'Aisha Mohamed', initials: 'AM', trust: 4.6, verified: true, gender: 'Female', color: '#00BCD4' },
    from: 'Science Labs',
    to: 'Booma Grounds',
    departureType: 'immediate',
    seatsTotal: 2,
    seatsTaken: 1,
    genderPreference: 'same',
    mode: 'boda',
    postedAt: new Date(Date.now() - 60 * 1000),
    status: 'active',
  },
];

export const mockJoinRequests: JoinRequest[] = [
  {
    id: '1',
    rideId: '2',
    requester: { name: 'Sarah Kimani', initials: 'SK', trust: 4.3, verified: true, gender: 'Female', color: '#4CAF50' },
    status: 'pending',
    requestedAt: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: '2',
    rideId: '2',
    requester: { name: 'Diana Chebet', initials: 'DC', trust: 4.7, verified: true, gender: 'Female', color: '#FF9800' },
    status: 'pending',
    requestedAt: new Date(Date.now() - 60 * 1000),
  },
  {
    id: '3',
    rideId: '2',
    requester: { name: 'Lucy Wambui', initials: 'LW', trust: 3.9, verified: false, gender: 'Female', color: '#795548' },
    status: 'pending',
    requestedAt: new Date(),
  },
];

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

export const mockRideHistory: RideHistory[] = [
  { id: '47', rideId: '47', date: 'Today', from: 'Main Campus', to: 'Town Centre', poster: 'Fatima Hassan', rating: 5, mode: 'boda' },
  { id: '44', rideId: '44', date: 'Yesterday', from: 'Hostel B', to: 'Mbarara Market', poster: 'You', rating: 4, mode: 'boda' },
  { id: '41', rideId: '41', date: 'Dec 18', from: 'Library', to: 'Ruharo', poster: 'Grace Wanjiku', rating: 5, mode: 'boda' },
  { id: '39', rideId: '39', date: 'Dec 17', from: 'Engineering', to: 'Kakyeka Stage', poster: 'You', rating: 4, mode: 'boda' },
  { id: '35', rideId: '35', date: 'Dec 15', from: 'Main Gate', to: 'Booma Grounds', poster: 'Aisha Mohamed', rating: 5, mode: 'boda' },
  { id: '30', rideId: '30', date: 'Dec 12', from: 'Hostel A', to: 'Town Centre', poster: 'You', rating: 4, mode: 'boda' },
];

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
