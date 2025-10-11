export interface Blacksmith {
  id?: string; // Firestore document ID
  name: string;
  phone: string;
  specialty?: string; // e.g., 'Equine Farrier', 'Cattle Hoof Trim'
}