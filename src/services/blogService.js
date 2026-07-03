/**
 * blogService.js
 * Handles fetching and converting Blogger JSON Feed into structured application data.
 * Utilizes the public feed architecture without requiring an API Key.
 */

const BLOG_FEED_URL = "/blogger-api/feeds/posts/default?alt=json&max-results=100";

/**
 * Helper to extract the first image URL from a string of HTML content
 * Used as a fallback if no default thumbnail is provided by Blogger.
 */
const extractFirstImage = (htmlContent) => {
  if (!htmlContent) return null;
  const match = htmlContent.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
};

/**
 * Cleans the HTML string to generate a plain-text preview snippet
 */
const createExcerpt = (htmlContent, maxLength = 180) => {
  if (!htmlContent) return "";
  const plainText = htmlContent.replace(/<\/?[^>]+(>|$)/g, " ");
  const normalized = plainText.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return normalized.substring(0, maxLength) + "...";
};

/**
 * Extracts a stable numeric or string ID from the Blogger entry URL URI
 */
const parsePostId = (idUri) => {
  if (!idUri) return "";
  const parts = idUri.split("-");
  return parts[parts.length - 1]; // Pulls out the raw unique identifier
};

/**
 * Map utility to structure complex Blogger JSON entries into flat objects
 */
const transformBloggerPost = (entry) => {
  const content = entry.content ? entry.content.$t : (entry.summary ? entry.summary.$t : "");
  const fallbackImage = extractFirstImage(content);
  
  // Parse standard Media Thumbnail, or scale up if small, fallback to extracted asset
  let coverImage = null;
  if (entry.media$thumbnail) {
    coverImage = entry.media$thumbnail.url.replace(/\/s72\-c\//, "/s1600/"); // Scale thumbnail to high quality
  } else {
    coverImage = fallbackImage;
  }

  return {
    id: parsePostId(entry.id.$t),
    title: entry.title ? entry.title.$t : "Untitled Post",
    published: entry.published ? new Date(entry.published.$t).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    }) : "",
    rawPublishedDate: entry.published ? entry.published.$t : "",
    updated: entry.updated ? entry.updated.$t : "",
    author: entry.author && entry.author[0] ? entry.author[0].name.$t : "Chitro Team",
    authorAvatar: entry.author && entry.author[0] && entry.author[0].gd$image ? entry.author[0].gd$image.src : null,
    content: content,
    excerpt: createExcerpt(content),
    labels: entry.category ? entry.category.map(cat => cat.term) : [],
    link: entry.link && entry.link.find(l => l.rel === "alternate") ? entry.link.find(l => l.rel === "alternate").href : "#"
  };
};

/**
 * Fetches all posts from the configuration target
 */
export const fetchBlogPosts = async () => {
  try {
    const response = await fetch(BLOG_FEED_URL);
    if (!response.ok) {
      throw new Error(`Network status error: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.feed || !data.feed.entry) {
      return [];
    }
    
    return data.feed.entry.map(transformBloggerPost);
  } catch (error) {
    console.error("Error executing fetchBlogPosts:", error);
    throw error;
  }
};

/**
 * Resolves an individual post by parsing the fully qualified listing feed
 */
export const fetchPostById = async (id) => {
  try {
    const allPosts = await fetchBlogPosts();
    const activePost = allPosts.find(post => post.id === id);
    if (!activePost) {
      throw new Error("Requested publication content not found.");
    }
    return {
      post: activePost,
      allPosts: allPosts
    };
  } catch (error) {
    console.error(`Error executing fetchPostById for ID ${id}:`, error);
    throw error;
  }
};