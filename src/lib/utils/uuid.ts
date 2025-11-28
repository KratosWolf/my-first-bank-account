// Utility function to generate valid UUIDs
export function generateUUID(): string {
  // Simple UUID v4 generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Check if a string is a valid UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Convert legacy child ID to UUID if needed
export function ensureValidChildId(id: string): string {
  if (isValidUUID(id)) {
    return id;
  }
  
  // If it's a legacy format like "child-{timestamp}", generate new UUID
  if (id.startsWith('child-')) {
    return generateUUID();
  }
  
  return generateUUID();
}