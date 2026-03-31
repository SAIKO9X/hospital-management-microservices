import { useState } from "react";
import { Edit } from "lucide-react";
import { isDoctorProfile } from "@/types/doctor.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileInfoTable } from "@/features/patient/components/ProfileInfoTable";
import { EditDoctorProfileDialog } from "@/features/doctor/components/EditDoctorProfileDialog";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { StarRating } from "@/components/shared/StarRating";
import { useProfile } from "@/services/queries/profile-queries";
import { useActionNotification } from "@/hooks/useActionNotification";
import { useProfilePictureUpload } from "@/hooks/useProfilePictureUpload";
import { resolveImageUrl } from "@/utils/media";
import type { DoctorProfileFormData } from "@/schemas/profile.schema";
import { useDoctorStats } from "@/hooks/useDoctorStats";
import { buildDoctorInfoSections } from "@/utils/doctorInfoSections";

export const DoctorProfilePage = () => {
  const {
    profile,
    status,
    error,
    user,
    isLoading,
    isError,
    updateProfile,
    isUpdating,
  } = useProfile();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { notification, notify, dismiss } = useActionNotification();

  const { fileInputRef, handleFileChange, isUploading } =
    useProfilePictureUpload(
      () => notify("success", "Foto de perfil atualizada com sucesso!"),
      () => notify("error", "Erro ao atualizar a foto"),
    );

  const { averageRating, totalReviews, reviews } = useDoctorStats(profile?.id);

  const handleSaveProfile = async (data: DoctorProfileFormData) => {
    try {
      await updateProfile(data);
      setIsDialogOpen(false);
      notify("success", "Perfil atualizado com sucesso!");
    } catch (err: any) {
      notify("error", err.message || "Não foi possível salvar as alterações.");
    }
  };

  if (user?.role !== "DOCTOR") {
    return (
      <div className="text-center p-10 text-red-500">
        Acesso negado. Esta página é apenas para doutores.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center p-10">Carregando perfil do doutor...</div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4 text-center">
        <CustomNotification
          variant="error"
          title={error || "Erro ao carregar perfil"}
        />
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (status === "succeeded" && !profile) {
    return (
      <div className="container mx-auto p-4">
        <CustomNotification
          variant="info"
          title="Perfil não encontrado"
          description="Não foi possível encontrar seu perfil. Entre em contato com o suporte."
        />
      </div>
    );
  }

  if (!isDoctorProfile(profile)) return null;

  const isProfileIncomplete = !profile.specialization || !profile.department;

  const { personal, professional } = buildDoctorInfoSections(
    profile,
    user?.name,
  );

  return (
    <div className="container mx-auto p-4 space-y-8">
      {isProfileIncomplete && (
        <CustomNotification
          variant="info"
          title="Complete seu Perfil - Clique em Editar Perfil"
          description="Seu perfil foi criado com sucesso! Complete suas informações profissionais para acessar todas as funcionalidades."
          dismissible={false}
        />
      )}

      {notification && (
        <CustomNotification
          variant={notification.variant}
          title={notification.title}
          autoHide
          onDismiss={dismiss}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={resolveImageUrl(profile.profilePictureUrl)}
                  alt="Foto de perfil"
                />
                <AvatarFallback className="text-3xl">
                  {user?.name?.charAt(0).toUpperCase() || "D"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Edit className="h-3 w-3" />
                <span className="sr-only">Editar foto</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/gif"
              />
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <CardTitle className="text-2xl">
                {user?.name || "Nome não informado"}
              </CardTitle>
              <p className="text-muted-foreground">
                {profile.specialization || "Especialização não informada"}
              </p>
              <p className="text-sm text-muted-foreground">
                CRM: {profile.crmNumber || "Não informado"}
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-start pt-1">
                <StarRating rating={averageRating} readOnly />
                <span className="text-sm text-muted-foreground">
                  ({totalReviews} avaliações)
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              disabled={isUpdating}
            >
              <Edit className="h-4 w-4 mr-2" />
              {isUpdating ? "Salvando..." : "Editar Perfil"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <ProfileInfoTable title="Informações Pessoais" data={personal} />
          <ProfileInfoTable
            title="Informações Profissionais"
            data={professional}
          />
        </div>

        <div className="space-y-8">
          <TextCard
            title="Biografia"
            content={profile.biography}
            emptyMessage="Nenhuma biografia informada."
          />
          <TextCard
            title="Qualificações"
            content={profile.qualifications}
            emptyMessage="Nenhuma qualificação informada."
          />
        </div>
      </div>

      <ReviewsCard reviews={reviews} />

      <EditDoctorProfileDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

type TextCardProps = {
  title: string;
  content?: string;
  emptyMessage: string;
};

const TextCard = ({ title, content, emptyMessage }: TextCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
      {content || emptyMessage}
    </CardContent>
  </Card>
);

type Review = {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
};

type ReviewsCardProps = {
  reviews: Review[];
};

const ReviewsCard = ({ reviews }: ReviewsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle>Avaliações dos Pacientes</CardTitle>
    </CardHeader>
    <CardContent>
      {reviews.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          Ainda não existem avaliações com comentários.
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex justify-between items-center mb-2">
                <StarRating rating={review.rating} readOnly size={16} />
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="text-sm text-foreground italic">
                "{review.comment || "Sem comentário escrito."}"
              </p>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
