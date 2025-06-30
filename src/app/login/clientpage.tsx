"use client";

import { createCompanyAdminUser } from "@/actions/user/createCompanyAdminUser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { signInServer } from "@/lib/signin";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const newCompanyAndUserSchema = z.object({
  companyName: z
    .string({ invalid_type_error: "Nombre de empresa invalido" })
    .min(1),
  username: z
    .string({ invalid_type_error: "Nombre de Usuario invalido" })
    .min(5),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
});

const signInSchema = z.object({
  username: z.string().min(1, { message: "Es necesario un nombre de usuario" }),
  password: z.string().min(1, { message: "Es necesaria una contraseña" }),
});

export default function SignInClientPage() {
  const formSignIn = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [errorAtSignIn, setErrorAtSignIn] = useState(false);

  const router = useRouter();

  return (
    <div className="mx-auto h-screen flex items-center">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Ingresar</TabsTrigger>
          <TabsTrigger value="singup">Registrar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Ingresar</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert
                variant="destructive"
                className="mb-2"
                hidden={errorAtSignIn ? false : true}
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al iniciar sesion</AlertTitle>
                <AlertDescription>
                  Usuario/Contraseña incorrectos o Usuario Bloqueado
                </AlertDescription>
              </Alert>
              <Form {...formSignIn}>
                <form
                  onSubmit={formSignIn.handleSubmit(
                    async (values: z.infer<typeof signInSchema>) => {
                      const formData: FormData = new FormData();
                      formData.append("username", values.username);
                      formData.append("password", values.password);

                      try {
                        await signInServer(formData);
                        router.push("/app/boards");
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      } catch (e) {
                        setErrorAtSignIn(true);
                      }
                    }
                  )}
                >
                  <FormField
                    control={formSignIn.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Usuario</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={formSignIn.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full mt-4">
                    Ingresar
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="singup">
          <Card>
            <CardHeader>
              <CardTitle>Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-2"
                action={async (formData) => {
                  const validatedFields = newCompanyAndUserSchema.safeParse({
                    companyName: formData.get("companyname"),
                    username: formData.get("username"),
                    password: formData.get("password"),
                  });

                  if (!validatedFields.success) {
                    return;
                  }

                  await createCompanyAdminUser({
                    username: validatedFields.data.username,
                    password: validatedFields.data.password,
                    companyName: validatedFields.data.companyName,
                  });
                }}
              >
                <div className="grid gap-2 mb-8">
                  <Label htmlFor="email">Nombre de Empresa</Label>
                  <Input
                    id="companyname"
                    type="text"
                    name="companyname"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Usuario</Label>
                  <Input id="username" type="text" name="username" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Registrar
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
