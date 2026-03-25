import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useDoctorAppointmentDetails,
  useCancelAppointment,
  useCompleteAppointment,
} from "@/services/queries/appointment-queries";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, ListIcon, Loader2 } from "lucide-react";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { columns } from "@/features/doctor/components/columns";
import { rescheduleAppointment } from "@/services/appointment";
import {
  AppointmentCalendar,
  type AppointmentEvent,
} from "@/components/calendar/AppointmentCalendar";

export const DoctorAppointmentsPage = () => {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<{
    show: boolean;
    variant: "success" | "error" | "info";
    title: string;
    description?: string;
  }>({
    show: false,
    variant: "info",
    title: "",
  });

  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useDoctorAppointmentDetails();

  const completeAppointmentMutation = useCompleteAppointment();
  const cancelAppointmentMutation = useCancelAppointment();

  const rescheduleMutation = useMutation({
    mutationFn: ({ id, newDate }: { id: number; newDate: string }) =>
      rescheduleAppointment(id, newDate),

    onMutate: async ({ id, newDate }) => {
      await queryClient.cancelQueries();
      const queryKey = ["doctorAppointmentDetails"];
      const previousAppointments = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;

        const isArray = Array.isArray(oldData);
        const dataList = isArray ? oldData : oldData.data;

        const newDataList = dataList.map((app: any) => {
          if (app.id === id) {
            return { ...app, appointmentDateTime: newDate };
          }
          return app;
        });

        return isArray ? newDataList : { ...oldData, data: newDataList };
      });

      return { previousAppointments, queryKey };
    },

    onSuccess: () => {
      setNotification({
        show: true,
        variant: "success",
        title: "Consulta remarcada com sucesso!",
      });
      queryClient.invalidateQueries();
    },

    // se der erro no back, volta pro estado anterior
    onError: (error: any, _variables, context: any) => {
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          context.queryKey,
          context.previousAppointments,
        );
      }
      setNotification({
        show: true,
        variant: "error",
        title: "Erro ao remarcar consulta",
        description:
          error.response?.data?.message || "Verifique conflitos de horário.",
      });
    },
  });

  const handleCompleteAppointment = async (
    appointmentId: number,
    notes: string,
  ) => {
    try {
      await completeAppointmentMutation.mutateAsync({
        id: appointmentId,
        notes,
      });
      setNotification({
        show: true,
        variant: "success",
        title: "Consulta finalizada com sucesso!",
      });
    } catch (error: any) {
      setNotification({
        show: true,
        variant: "error",
        title: "Erro ao finalizar consulta",
        description: error.message || "Ocorreu um erro inesperado",
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      await cancelAppointmentMutation.mutateAsync(appointmentId);
      setNotification({
        show: true,
        variant: "success",
        title: "Consulta cancelada com sucesso!",
      });
    } catch (err: any) {
      setNotification({
        show: true,
        variant: "error",
        title: "Erro ao cancelar consulta",
        description: err.message || "Não foi possível cancelar a consulta.",
      });
    }
  };

  const handleReschedule = (appointmentId: number, newStart: Date) => {
    rescheduleMutation.mutate({
      id: appointmentId,
      newDate: newStart.toISOString(),
    });
  };

  const dismissNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  const calendarEvents: AppointmentEvent[] = useMemo(() => {
    if (!appointments) return [];

    const dataList = Array.isArray(appointments)
      ? appointments
      : (appointments as any).data || [];

    return dataList.map((app: any) => {
      const startDate = new Date(app.appointmentDateTime);
      const endDate = app.appointmentEndTime
        ? new Date(app.appointmentEndTime)
        : new Date(startDate.getTime() + 30 * 60000);

      return {
        id: app.id,
        title: `${app.patientName} - ${app.reason || "Consulta de Rotina"}`,
        start: startDate,
        end: endDate,
        patientName: app.patientName,
        status: app.status,
        reason: app.reason,
      };
    });
  }, [appointments]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Sincronizando agenda...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-6 text-center">
        <CustomNotification
          variant="error"
          title={error?.message || "Erro ao carregar as consultas"}
        />
        <Button onClick={() => window.location.reload()} className="mt-4">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {notification.show && (
        <CustomNotification
          variant={notification.variant}
          title={notification.title}
          description={notification.description}
          onDismiss={dismissNotification}
          autoHide
          autoHideDelay={5000}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Minhas Consultas
          </h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as consultas agendadas com você. Arraste e
            solte para remarcar.
          </p>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <ListIcon className="h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="relative">
          {rescheduleMutation.isPending && (
            <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="font-medium">Validando novo horário...</p>
            </div>
          )}

          <AppointmentCalendar
            events={calendarEvents}
            onEventReschedule={handleReschedule}
          />
        </TabsContent>

        <TabsContent value="list">
          <div className="bg-card rounded-lg border shadow-sm">
            <DataTable
              columns={columns({
                handleCompleteAppointment,
                handleCancelAppointment,
              })}
              data={appointments || []}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
