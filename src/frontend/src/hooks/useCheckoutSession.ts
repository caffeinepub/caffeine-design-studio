import { useMutation } from "@tanstack/react-query";
import { useActor } from "./useActor";

export type CheckoutSession = {
  id: string;
  url: string;
};

export function useCreateCheckoutSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (
      items: { name: string; quantity: number; price: number }[],
    ): Promise<CheckoutSession> => {
      if (!actor) throw new Error("Actor not available");
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      const successUrl = `${baseUrl}/payment-success`;
      const cancelUrl = `${baseUrl}/payment-failure`;
      const shoppingItems = items.map((i) => ({
        name: i.name,
        quantity: BigInt(i.quantity),
        price: BigInt(Math.round(i.price * 100)),
      }));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (actor as any).createCheckoutSession(
        shoppingItems,
        successUrl,
        cancelUrl,
      );
      const session = JSON.parse(result) as CheckoutSession;
      if (!session?.url) throw new Error("Stripe session missing url");
      return session;
    },
  });
}
