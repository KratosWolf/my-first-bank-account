// Centralized storage for purchase requests (in production, use database)
export interface PurchaseRequest {
  id: number;
  childId: number;
  childName: string;
  parentId: number;
  item: string;
  amount: number;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt?: string;
  parentComment?: string;
}

// Global storage (in production, this would be database operations)
// Use globalThis to persist across module reloads in development
if (!(globalThis as any).__purchaseRequests) {
  (globalThis as any).__purchaseRequests = [];
  (globalThis as any).__purchaseRequestNextId = 1;
}

const purchaseRequests = (globalThis as any)
  .__purchaseRequests as PurchaseRequest[];
let nextId = (globalThis as any).__purchaseRequestNextId as number;

export const PurchaseRequestStorage = {
  getAll: (): PurchaseRequest[] => {
    return [...purchaseRequests];
  },

  getByParent: (parentId: number): PurchaseRequest[] => {
    return purchaseRequests.filter(req => req.parentId === parentId);
  },

  getByChild: (childId: number): PurchaseRequest[] => {
    return purchaseRequests.filter(req => req.childId === childId);
  },

  getById: (id: number): PurchaseRequest | undefined => {
    return purchaseRequests.find(req => req.id === id);
  },

  create: (
    request: Omit<PurchaseRequest, 'id' | 'createdAt' | 'status'>
  ): PurchaseRequest => {
    const newRequest: PurchaseRequest = {
      ...request,
      id: nextId++,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    purchaseRequests.push(newRequest);
    // Update global nextId
    (globalThis as any).__purchaseRequestNextId = nextId;
    return newRequest;
  },

  update: (
    id: number,
    updates: Partial<PurchaseRequest>
  ): PurchaseRequest | null => {
    const index = purchaseRequests.findIndex(req => req.id === id);
    if (index === -1) return null;

    purchaseRequests[index] = {
      ...purchaseRequests[index],
      ...updates,
    };

    return purchaseRequests[index];
  },

  getPendingCount: (parentId: number): number => {
    return purchaseRequests.filter(
      req => req.parentId === parentId && req.status === 'pending'
    ).length;
  },
};
