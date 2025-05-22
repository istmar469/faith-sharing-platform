
// This file is deprecated. Import from @/hooks/useAuthStatus instead.
import { useAuthStatus as importedUseAuthStatus } from '@/hooks/useAuthStatus';
import type { AuthStatusReturn } from '@/hooks/useAuthStatus';

export type { AuthStatusReturn };
export const useAuthStatus = importedUseAuthStatus;
