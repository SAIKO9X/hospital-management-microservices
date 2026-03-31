import { BloodGroup, Gender, type PatientProfile } from "@/types/patient.types";

export const buildPatientInfoSections = (profile: PatientProfile) => {
  const personal = [
    { label: "CPF", value: profile.cpf || "Não informado" },
    {
      label: "Data de Nascimento",
      value: profile.dateOfBirth
        ? new Date(profile.dateOfBirth).toLocaleDateString("pt-BR")
        : "Não informado",
    },
    { label: "Telefone", value: profile.phoneNumber || "Não informado" },
    { label: "Endereço", value: profile.address || "Não informado" },
  ];

  const medical = [
    {
      label: "Tipo Sanguíneo",
      value: profile.bloodGroup
        ? BloodGroup[profile.bloodGroup] || profile.bloodGroup
        : "Não informado",
    },
    {
      label: "Gênero",
      value: profile.gender
        ? Gender[profile.gender] || profile.gender
        : "Não informado",
    },
  ];

  const emergency = [
    { label: "Nome", value: profile.emergencyContactName || "Não informado" },
    {
      label: "Telefone",
      value: profile.emergencyContactPhone || "Não informado",
    },
  ];

  return { personal, medical, emergency };
};
