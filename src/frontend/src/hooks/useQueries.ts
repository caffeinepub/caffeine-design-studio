import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useListDesigns() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["designs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listDesigns();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveDesign() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      data,
      thumbnailUrl,
    }: {
      title: string;
      data: string;
      thumbnailUrl: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.saveDesign(title, data, thumbnailUrl);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["designs"] });
    },
  });
}

export function useGetDesign(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["design", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getDesign(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useDeleteDesign() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteDesign(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["designs"] });
    },
  });
}
