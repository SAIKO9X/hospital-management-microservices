import { useState } from "react";
import { Edit, AlertTriangle, Activity, UserRound } from "lucide-react";
import { isPatientProfile } from "@/types/patient.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileInfoTable } from "@/features/patient/components/ProfileInfoTable";
import { EditProfileDialog } from "@/features/patient/components/EditProfileDialog";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { useProfile } from "@/services/queries/profile-queries";
import { useActionNotification } from "@/hooks/useActionNotification";
import { useProfilePictureUpload } from "@/hooks/useProfilePictureUpload";
import { parseListField } from "@/utils/profile";
import { resolveImageUrl } from "@/utils/media";
import type { PatientProfileFormData } from "@/schemas/profile.schema";
import { buildPatientInfoSections } from "@/utils/patientInfoSections";

// ─── Skeleton ────────────────────────────────────────────────────────────────

const PatientProfileSkeleton = () => (
  <div className="container mx-auto p-4 space-y-8">
    {/* Profile card skeleton */}
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full shrink-0" />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <Skeleton className="h-6 w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-36 mx-auto sm:mx-0" />
          </div>
          <Skeleton className="h-9 w-32 shrink-0" />
        </div>
      </CardHeader>
    </Card>

    {/* Grid skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <Card key={`col1-${i}`}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-8">
        {[...Array(3)].map((_, i) => (
          <Card key={`col2-${i}`}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(2)].map((_, j) => (
                <div key={j} className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// ─── Page ────────────────────────────────────────────────────────────────────

export const PatientProfilePage = () => {
  const {
    profile,
    status,
    user,
    isLoading,
    isError,
    error,
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

  const handleSaveProfile = async (data: PatientProfileFormData) => {
    try {
      await updateProfile(data);
      setIsDialogOpen(false);
      notify("success", "Perfil atualizado com sucesso!");
    } catch (err: any) {
      notify("error", err.message || "Não foi possível salvar as alterações.");
    }
  };

  if (user?.role !== "PATIENT") {
    return (
      <div className="text-center p-10 text-red-500">
        Acesso negado. Esta página é apenas para pacientes.
      </div>
    );
  }

  if (isLoading) return <PatientProfileSkeleton />;

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

  if (!isPatientProfile(profile)) return null;

  const isProfileIncomplete =
    !profile.phoneNumber || !profile.address || !profile.dateOfBirth;

  const { personal, medical, emergency } = buildPatientInfoSections(profile);
  const allergies = parseListField(profile.allergies);
  const chronicDiseases = parseListField(profile.chronicDiseases);

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Banner de perfil incompleto */}
      {isProfileIncomplete && (
        <div className="flex items-start gap-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
            <UserRound className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Seu perfil está incompleto
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Complete suas informações pessoais para poder usar todos os
              recursos disponíveis.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
            onClick={() => setIsDialogOpen(true)}
          >
            Completar agora
          </Button>
        </div>
      )}

      {notification && (
        <CustomNotification
          variant={notification.variant}
          title={notification.title}
          autoHide
          onDismiss={dismiss}
        />
      )}

      {/* Card Principal */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar com botão de editar foto visível */}
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 border shadow-sm">
                <AvatarImage
                  src={resolveImageUrl(profile.profilePictureUrl)}
                  alt="Foto do perfil"
                />
                <AvatarFallback className="text-3xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                  {user?.name?.charAt(0).toUpperCase() || "P"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border border-background"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Alterar foto de perfil"
              >
                <Edit className="h-4 w-4 text-muted-foreground" />
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

            {/* Informações Resumidas */}
            <div className="flex-1 text-center sm:text-left space-y-1">
              <CardTitle className="text-2xl">
                {user?.name || "Nome não informado"}
              </CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>

            {/* Botão de Ação */}
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

      {/* Grid de Informações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-8">
          <ProfileInfoTable title="Informações Pessoais" data={personal} />
          <ProfileInfoTable title="Contato de Emergência" data={emergency} />
        </div>

        <div className="space-y-8">
          <ProfileInfoTable
            title="Informações Médicas Básicas"
            data={medical}
          />

          <BadgeListCard
            title="Alergias"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
            items={allergies}
            emptyMessage="Nenhuma alergia registrada."
          />
          <BadgeListCard
            title="Doenças Crônicas"
            icon={<Activity className="h-4 w-4 text-rose-500" />}
            items={chronicDiseases}
            emptyMessage="Nenhuma doença crônica registrada."
          />
        </div>
      </div>

      <EditProfileDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        profile={profile}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

// ─── Sub-componentes locais ───────────────────────────────────────────────────

type BadgeListCardProps = {
  title: string;
  icon: React.ReactNode;
  items: string[];
  emptyMessage: string;
};

const BadgeListCard = ({
  title,
  icon,
  items,
  emptyMessage,
}: BadgeListCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      {items.length > 0 ? (
        items.map((item, index) => (
          <Badge key={index} variant="secondary">
            {item}
          </Badge>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      )}
    </CardContent>
  </Card>
);
