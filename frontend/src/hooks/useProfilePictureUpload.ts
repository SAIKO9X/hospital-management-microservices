import { useRef } from "react";
import { uploadFile } from "@/services/media";
import { useUpdateProfilePicture } from "@/services/queries/profile-queries";

export const useProfilePictureUpload = (
  onSuccess: () => void,
  onError: () => void,
) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updatePictureMutation = useUpdateProfilePicture();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const mediaResponse = await uploadFile(file);
      await updatePictureMutation.mutateAsync(mediaResponse.url);
      onSuccess();
    } catch {
      onError();
    }
  };

  return {
    fileInputRef,
    handleFileChange,
    isUploading: updatePictureMutation.isPending,
  };
};
