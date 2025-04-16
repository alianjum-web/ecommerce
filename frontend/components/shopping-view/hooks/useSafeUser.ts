// hooks/useSafeUser.ts
import { useAppSelector } from "@/store/hooks";

export const useSafeUser = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  
  return {
    user: user || null,
    isAuthenticated,
    userId: user?._id || null,
    hasRole: (role: string) => user?.role === role,
    isAdmin: user?.role === 'admin',
    isSeller: user?.role === 'seller',
    isBuyer: user?.role === 'buyer'
  };
};