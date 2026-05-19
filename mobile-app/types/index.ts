export interface User {
  id: string;
  name: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  campus: string;
  campusShort: string;
  universityId: string;
  hostel: string;
  verified: boolean;
  trust: number;
  ridesCompleted: number;
  ridesPosted: number;
  ridesJoined: number;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Person {
  name: string;
  initials: string;
  trust: number;
  verified: boolean;
  gender: string;
  color: string;
  avatar_url: string | null;
}

export type DepartureType = 'immediate' | 'scheduled';

export type GenderPreference = 'same' | 'any';

export type RideMode = 'boda' | 'cab';

export type RideStatus = 'active' | 'full' | 'completed' | 'cancelled';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface Ride {
  id: string;
  posterId: string;
  campus: string;
  poster: Person;
  from: string;
  to: string;
  departureType: DepartureType;
  scheduledTime?: string;
  scheduledDate?: string;
  closesIn?: string;
  expiresAt?: string;
  seatsTotal: number;
  seatsTaken: number;
  genderPreference: GenderPreference;
  mode: RideMode;
  postedAt: Date;
  status: RideStatus;
}

export interface JoinRequest {
  id: string;
  rideId: string;
  requester: Person;
  status: RequestStatus;
  requestedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: Date;
  isMine: boolean;
}

export interface Chat {
  id: string;
  rideId: string;
  rideFrom: string;
  rideTo: string;
  buddy: Person;
  messages: Message[];
  createdAt: Date;
}

export type NotificationType = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
}

export interface RideHistory {
  id: string;
  rideId: string;
  date: string;
  from: string;
  to: string;
  poster: string;
  rating: number;
  mode: RideMode;
}

export interface SavedFilter {
  id: string;
  name: string;
  genderPreference?: GenderPreference;
  departureType?: DepartureType;
  maxWaitTime?: number;
  minSeats?: number;
  minTrustScore?: number;
  mode?: RideMode;
}

export interface PostRideData {
  from: string;
  to: string;
  mode: RideMode;
  departureType: DepartureType;
  scheduledDate?: Date;
  scheduledTime?: string;
  seats: number;
  genderPreference: GenderPreference;
  expiresInMinutes?: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export interface AppState {
  user: User | null;
  rides: Ride[];
  myPostedRides: Ride[];
  myRequestedRides: Ride[];
  notifications: Notification[];
  rideHistory: RideHistory[];
  savedFilters: SavedFilter[];
}

export interface JoinRequest {
  id: string;
  rideId: string;
  requesterId: string;
  requester?: Person;
  status: RequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
  responseMessage?: string;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl?: string;
  trustScore: number;
  verified: boolean;
  gender: string;
}

export interface ChatWithDetails {
  id: string;
  rideId: string;
  rideFrom: string;
  rideTo: string;
  participant: ChatParticipant;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  createdAt: Date;
}
