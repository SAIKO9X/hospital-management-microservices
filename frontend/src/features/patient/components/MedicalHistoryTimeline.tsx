import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Stethoscope,
  type LucideProps,
} from "lucide-react";
import { format, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AppointmentHistory } from "@/types/patient.types";
import type { FC, ForwardRefExoticComponent, RefAttributes } from "react";
import { useMedicalHistory } from "@/services/queries/profile-queries";

type StatusConfigValue = {
  label: string;
  variant: "secondary" | "default" | "destructive" | "outline";
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
  bg: string;
  border: string;
  timeline: string;
};

const statusConfig: { [key: string]: StatusConfigValue } = {
  COMPLETED: {
    label: "Concluída",
    variant: "secondary",
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950/30",
    border: "border-green-200 dark:border-green-900/50",
    timeline: "bg-green-500",
  },
  SCHEDULED: {
    label: "Agendada",
    variant: "default",
    icon: Clock,
    color: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/20",
    timeline: "bg-primary",
  },
  CANCELED: {
    label: "Cancelada",
    variant: "destructive",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
    timeline: "bg-destructive",
  },
  DEFAULT: {
    label: "Status Desconhecido",
    variant: "outline",
    icon: Activity,
    color: "text-muted-foreground",
    bg: "bg-muted/50",
    border: "border",
    timeline: "bg-muted-foreground",
  },
};

const TimelineItem: FC<{
  appointment: AppointmentHistory;
  isLast: boolean;
  compactMode?: boolean;
}> = ({ appointment, isLast, compactMode = false }) => {
  const config = statusConfig[appointment.status] || statusConfig.DEFAULT;
  const StatusIcon = config.icon;

  const date = new Date(appointment.appointmentDateTime);
  const day = format(date, "dd");
  const month = format(date, "MMM", { locale: ptBR }).replace(".", "");
  const year = getYear(date);
  const time = format(date, "HH:mm");

  return (
    <div className={`relative flex ${compactMode ? "gap-3" : "gap-6"}`}>
      {!isLast && (
        <div
          className={`absolute ${
            compactMode ? "left-[19px] top-[44px]" : "left-[52px] top-[70px]"
          } w-0.5 h-full bg-border`}
        />
      )}

      <div className="flex-shrink-0 flex flex-col items-center">
        {compactMode ? (
          <div
            className={`flex flex-col items-center justify-center w-10 h-11 rounded-lg ${config.bg} border ${config.border}`}
          >
            <span
              className={`text-base font-bold leading-none ${config.color}`}
            >
              {day}
            </span>
            <span
              className={`text-[10px] font-semibold capitalize leading-none mt-0.5 ${config.color}`}
            >
              {month}
            </span>
          </div>
        ) : (
          <div
            className={`flex flex-col items-center justify-center w-[105px] h-[70px] rounded-xl ${config.bg} border ${config.border}`}
          >
            <span className={`text-3xl font-bold ${config.color}`}>{day}</span>
            <span
              className={`-mt-1 text-sm font-semibold capitalize ${config.color}`}
            >
              {month}
            </span>
          </div>
        )}
        <div
          className={`relative z-10 ${
            compactMode ? "w-3 h-3 mt-1.5" : "w-4 h-4 mt-2"
          } rounded-full ${config.timeline} ring-4 ring-background`}
        >
          <div
            className={`absolute inset-0 rounded-full ${config.timeline} animate-ping opacity-75`}
          />
        </div>
      </div>

      <Card className="flex-1 shadow-sm transition-shadow duration-300 border-border/60 min-w-0">
        {/* AJUSTE 2: pb-2 no compact mode para reduzir espaço até o container de baixo */}
        <CardHeader className={compactMode ? "px-3 pb-2" : "pb-4"}>
          <div
            className={`flex ${
              compactMode
                ? "flex-col items-start gap-1.5"
                : "items-start justify-between gap-2"
            }`}
          >
            <div className="min-w-0 flex-1 w-full">
              <CardTitle
                className={`flex items-start gap-2 ${
                  compactMode ? "text-sm" : "text-lg"
                }`}
              >
                <FileText
                  className={`${
                    compactMode ? "h-3.5 w-3.5 mt-0.5" : "h-5 w-5 mt-1"
                  } text-primary flex-shrink-0`}
                />
                <span className="leading-tight line-clamp-2 break-words">
                  {appointment.reason}
                </span>
              </CardTitle>

              <div
                className={`flex items-center gap-1.5 ${
                  compactMode ? "mt-3 text-xs" : "mt-1.5 text-sm"
                } text-muted-foreground flex-wrap`}
              >
                <Clock className={compactMode ? "h-3 w-3" : "h-4 w-4"} />
                <span>{time}</span>
                <span className="text-muted-foreground/50">•</span>
                <span>{year}</span>

                {compactMode && (
                  <>
                    <span className="text-muted-foreground/50 ml-0.5">•</span>
                    <Badge
                      variant={config.variant}
                      className="text-[9px] px-1.5 py-0 h-4 flex items-center gap-1 whitespace-nowrap ml-0.5"
                    >
                      <StatusIcon className="h-2.5 w-2.5" />
                      {config.label}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {!compactMode && (
              <Badge
                variant={config.variant}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {config.label}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className={compactMode ? "px-3 pb-3 pt-0" : ""}>
          <div
            className={`flex items-center ${
              compactMode ? "gap-2 p-2" : "gap-3 p-3"
            } rounded-lg ${config.bg} border ${config.border}`}
          >
            <div className="p-1.5 bg-background rounded-full shadow-sm flex-shrink-0">
              <Stethoscope
                className={`${compactMode ? "h-3 w-3" : "h-4 w-4"} ${
                  config.color
                }`}
              />
            </div>
            <div className="min-w-0">
              <p
                className={`text-xs text-muted-foreground font-medium truncate`}
              >
                Profissional
              </p>
              <p className={`text-sm font-semibold truncate ${config.color}`}>
                {appointment.doctorName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface MedicalHistoryTimelineProps {
  appointments?: AppointmentHistory[];
  patientId?: number;
  compactMode?: boolean;
}

export const MedicalHistoryTimeline: FC<MedicalHistoryTimelineProps> = ({
  appointments: initialAppointments,
  patientId,
  compactMode = false,
}) => {
  const { data: medicalHistoryData, isLoading } = useMedicalHistory(patientId);

  const appointments =
    initialAppointments || (medicalHistoryData as any)?.appointments || [];

  const sortedAppointments = [...appointments].sort(
    (a: AppointmentHistory, b: AppointmentHistory) =>
      new Date(b.appointmentDateTime).getTime() -
      new Date(a.appointmentDateTime).getTime(),
  );

  const displayLimit = compactMode ? 3 : undefined;
  const displayedAppointments = sortedAppointments.slice(0, displayLimit);

  if (isLoading && !initialAppointments && patientId) {
    return (
      <div className="flex justify-center items-center py-8">
        <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sortedAppointments || sortedAppointments.length === 0) {
    return (
      <Card className="shadow-sm border-border/60">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">
            Nenhum histórico
          </p>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Consultas passadas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={compactMode ? "space-y-4" : "space-y-8"}>
      {displayedAppointments.map(
        (appointment: AppointmentHistory, index: number) => (
          <TimelineItem
            key={appointment.id}
            appointment={appointment}
            isLast={index === displayedAppointments.length - 1}
            compactMode={compactMode}
          />
        ),
      )}
      {compactMode && sortedAppointments.length > 3 && (
        <p className="text-xs text-center text-muted-foreground mt-4">
          e mais {sortedAppointments.length - 3} consultas...
        </p>
      )}
    </div>
  );
};
