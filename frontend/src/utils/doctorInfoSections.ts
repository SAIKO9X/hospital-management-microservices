import type { DoctorProfile } from "@/types/doctor.types";

export const buildDoctorInfoSections = (
  profile: DoctorProfile,
  userName?: string,
) => {
  const personal = [
    { label: "Nome", value: userName || "Não informado" },
    {
      label: "Data de Nascimento",
      value: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString("pt-BR")
        : "Não informado",
    },
  ];

  const professional = [
    { label: "CRM", value: profile.crmNumber || "Não informado" },
    {
      label: "Especialização",
      value: profile.specialization || "Não informado",
    },
    { label: "Departamento", value: profile.department || "Não informado" },
    {
      label: "Anos de Experiência",
      value: profile.yearsOfExperience
        ? `${profile.yearsOfExperience} anos`
        : "Não informado",
    },
    { label: "Telefone", value: profile.phoneNumber || "Não informado" },
  ];

  return { personal, professional };
};
