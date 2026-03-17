import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Key, Lock } from "lucide-react";
import { CustomNotification } from "@/components/notifications/CustomNotification";
import { FormPasswordInput } from "@/components/ui/form-fields";
import {
  ChangePasswordSchema,
  type ChangePasswordData,
} from "@/schemas/auth.schema";
import { changeUserPassword } from "@/services/user";
import { useAppSelector } from "@/store/hooks";

export default function ChangePasswordPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<ChangePasswordData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ChangePasswordData) => {
    if (!user?.id) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await changeUserPassword(user.id, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      setSuccess(
        "Senha alterada com sucesso! Você foi desconectado de outras sessões.",
      );
      form.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-6">
      <Card className="shadow-lg border-0 bg-card">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Key className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Atualize sua senha de acesso para manter sua conta segura.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <CustomNotification
              variant="error"
              title="Erro"
              description={error}
              onDismiss={() => setError(null)}
              className="mb-6"
            />
          )}

          {success && (
            <CustomNotification
              variant="success"
              title="Sucesso"
              description={success}
              onDismiss={() => setSuccess(null)}
              className="mb-6"
            />
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormPasswordInput
                control={form.control}
                name="oldPassword"
                label="Senha Atual"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormPasswordInput
                  control={form.control}
                  name="newPassword"
                  label="Nova Senha"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <FormPasswordInput
                  control={form.control}
                  name="confirmPassword"
                  label="Confirme a Nova Senha"
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? "Salvando..." : "Atualizar Senha"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
