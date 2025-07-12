import { loadStripe } from '@stripe/stripe-js';
import { useQuery } from '@tanstack/react-query';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
export function useStripe() {
    return useQuery({
        queryKey: ['stripe'],
        queryFn: () => stripePromise,
        staleTime: Infinity,
    });
}
