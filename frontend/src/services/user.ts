import api from "@/config/axios";
import type { ApiResponse } from "@/types/api.types";

export const changeUserPassword = async (
  userId: number,
  data: { oldPassword: string; newPassword: string },
) => {
  try {
    const response = await api.put<ApiResponse<void>>(
      `/users/${userId}/change-password`,
      data,
    );
    return response.data.message;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao alterar a senha.",
    );
  }
};
