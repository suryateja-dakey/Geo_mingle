export type Activity = {
  id: string;
  itineraryId: string; // Add itineraryId to link activity to its group
  time: string;
  description: string;
  isCustom: boolean;
  location?: string;
  imageUrl?: string;
  imageHint?: string; // This is now optional as AI flow provides imageUrl
};

export type Itinerary = {
  id: string;
  title: string;
  activities: Activity[];
  prompt?: string;
};
