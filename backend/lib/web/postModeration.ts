export type ProjectPostInput = {
  title: string;
  description: string;
  category: string;
  location: string;
};

export type ModerationResult = {
  allowed: boolean;
  reasons: string[];
};

const PROFANITY_TERMS = [
  "damn",
  "hell",
  "shit",
  "fuck",
  "bitch",
  "asshole",
  "bastard",
  "crap",
  "dick",
  "piss",
  "slut",
  "whore",
  "motherfucker",
  "fucking",
];

const PROJECT_KEYWORDS = [
  "project",
  "construction",
  "remodel",
  "renovation",
  "build",
  "contractor",
  "estimate",
  "quote",
  "scope",
  "labor",
  "crew",
  "site",
  "property",
  "electrical",
  "plumbing",
  "roofing",
  "kitchen",
  "bathroom",
  "flooring",
  "interior",
  "exterior",
  "permit",
  "timeline",
  "materials",
  "commercial",
  "residential",
  "apartment",
  "multi-family",
  "landscaping",
  "developer",
  "food service",
  "job",
  "employment",
  "career",
  "warehouse",
  "industrial",
];

function containsProfanity(text: string) {
  const normalized = text.toLowerCase();
  return PROFANITY_TERMS.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(normalized);
  });
}

function hasProjectIntent(text: string) {
  const normalized = text.toLowerCase();
  const matchedKeywords = PROJECT_KEYWORDS.filter((keyword) => normalized.includes(keyword));
  return matchedKeywords.length >= 2;
}

export function moderateProjectPost(input: ProjectPostInput): ModerationResult {
  const reasons: string[] = [];

  const title = input.title.trim();
  const description = input.description.trim();
  const category = input.category.trim();
  const location = input.location.trim();

  const combined = `${title} ${description} ${category} ${location}`;

  if (!title || !description || !category || !location) {
    reasons.push("All post fields are required.");
  }

  if (title.length < 6) {
    reasons.push("Title must be at least 6 characters long.");
  }

  if (description.length < 20) {
    reasons.push("Description must be at least 20 characters long.");
  }

  if (!hasProjectIntent(combined)) {
    reasons.push("Post must be clearly related to a construction or project need.");
  }

  if (containsProfanity(combined)) {
    reasons.push("Post contains language that is not allowed. Please keep posts professional.");
  }

  return {
    allowed: reasons.length === 0,
    reasons,
  };
}
