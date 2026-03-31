import { useQuery } from "@tanstack/react-query";
import { getDoctorReviews, getDoctorStats } from "@/services/profile";

export const useDoctorStats = (doctorId?: string | number) => {
  const numericId = doctorId ? Number(doctorId) : undefined;

  const { data: stats } = useQuery({
    queryKey: ["doctor-stats", numericId],
    queryFn: () => getDoctorStats(numericId!),
    enabled: !!numericId && !isNaN(numericId),
  });

  const { data: reviews } = useQuery({
    queryKey: ["doctor-reviews", numericId],
    queryFn: () => getDoctorReviews(numericId!),
    enabled: !!numericId && !isNaN(numericId),
  });

  return {
    averageRating: stats?.averageRating ?? 0,
    totalReviews: stats?.totalReviews ?? 0,
    reviews: reviews ?? [],
  };
};
