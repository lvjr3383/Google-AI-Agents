
import { Review } from './types';

export const REVIEWS_DATASET: Review[] = [
  // Cars
  { id: 1, text: "The electric engine in this sedan provides instant torque and a silent ride." },
  { id: 2, text: "Charging station availability is the only hurdle for long-distance road trips." },
  { id: 3, text: "The leather interior and adaptive cruise control make this car feel premium." },
  { id: 4, text: "Braking performance on wet roads is significantly improved with these new tires." },
  
  // Phones
  { id: 5, text: "The OLED display on this smartphone has deep blacks and vibrant contrast." },
  { id: 6, text: "Battery life is disappointing; I barely make it through the day on one charge." },
  { id: 7, text: "The triple-lens camera system takes professional-grade photos in low light." },
  { id: 8, text: "This mobile device feels sluggish after the latest software update." },
  
  // Movies
  { id: 9, text: "The cinematography in that sci-fi epic was breathtakingly beautiful." },
  { id: 10, text: "A weak script and poor pacing ruined what could have been a great film." },
  { id: 11, text: "The lead actor delivered a haunting performance that deserves an award." },
  { id: 12, text: "This sequel lacks the charm and original plot of the first installment." },
  
  // Sports
  { id: 13, text: "The striker scored a hat-trick to secure the championship victory." },
  { id: 14, text: "Fans packed the stadium to cheer for the home team during the playoffs." },
  { id: 15, text: "The referee made a controversial call that changed the momentum of the match." },
  { id: 16, text: "Intense training and discipline helped the sprinter break the world record." },
  
  // Food
  { id: 17, text: "The authentic spices and fresh herbs made this curry taste incredible." },
  { id: 18, text: "Service at the new bistro was slow, but the pasta was cooked to perfection." },
  { id: 19, text: "A gourmet experience with a diverse menu featuring local organic ingredients." },
  { id: 20, text: "The dessert was far too sweet and lacked the balance of the main course." }
];

export const STOP_WORDS = new Set([
  'the', 'is', 'and', 'to', 'a', 'of', 'in', 'i', 'it', 'was', 'for', 'with', 'on', 'my', 'this', 'that', 'but', 'every', 'when', 'just', 'as', 'very', 'at', 'has', 'be', 'are', 'were'
]);

export const TOPICS = [
  { 
    id: 'cars', 
    name: 'Cars', 
    color: '#ef4444', 
    keywords: ['engine', 'sedan', 'torque', 'charging', 'tires', 'car', 'cruise', 'braking'] 
  },
  { 
    id: 'phones', 
    name: 'Phones', 
    color: '#3b82f6', 
    keywords: ['smartphone', 'oled', 'battery', 'charge', 'camera', 'device', 'mobile', 'software'] 
  },
  { 
    id: 'movies', 
    name: 'Movies', 
    color: '#6366f1', 
    keywords: ['cinematography', 'script', 'film', 'actor', 'performance', 'sequel', 'plot', 'movie'] 
  },
  { 
    id: 'sports', 
    name: 'Sports', 
    color: '#10b981', 
    keywords: ['striker', 'championship', 'stadium', 'playoffs', 'referee', 'match', 'sprinter', 'record'] 
  },
  { 
    id: 'food', 
    name: 'Food', 
    color: '#f59e0b', 
    keywords: ['spices', 'curry', 'bistro', 'pasta', 'gourmet', 'menu', 'ingredients', 'dessert'] 
  }
];
