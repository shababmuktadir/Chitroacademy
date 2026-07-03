import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase'; // 🔥 আপনার ফায়ারবেস কনফিগ পাথ মিলিয়ে নেবেন

export const searchEverything = async (searchQuery) => {
  if (!searchQuery) return [];

  const queryLowerCase = searchQuery.toLowerCase().trim();
  const collectionsToSearch = ['courses', 'artworks', 'blogs'];
  let results = [];

  try {
    for (const colName of collectionsToSearch) {
      const querySnapshot = await getDocs(collection(db, colName));
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const title = (data.title || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        const tags = Array.isArray(data.tags) ? data.tags.map(t => t.toLowerCase()) : [];

        // টাইটেল, ডেসক্রিপশন বা ট্যাগের মধ্যে সার্চ কুয়েরি মিললে রেজাল্টে যুক্ত করবে
        if (
          title.includes(queryLowerCase) ||
          description.includes(queryLowerCase) ||
          tags.some(tag => tag.includes(queryLowerCase))
        ) {
          results.push({
            id: doc.id,
            type: colName, // result card কোন ধরনের তা বোঝার জন্য
            ...data
          });
        }
      });
    }
    return results;
  } catch (error) {
    console.error("Error searching Firestore:", error);
    throw error;
  }
};