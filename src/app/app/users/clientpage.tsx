"use client";

import { createNoAdminUser } from "@/actions/user/createNoAdminUser";
import { UpdateBoardResponsabilities } from "@/actions/user/updateBoardResponsabilities";
import { UpdatePassword } from "@/actions/user/updatePassword";
import { updateRole } from "@/actions/user/updateRole";
import { updateStatus } from "@/actions/user/updateStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeftRight,
  CheckIcon,
  Eye,
  Pencil,
  PlusCircleIcon,
  X,
} from "lucide-react";
import { Session } from "next-auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Role, Status } from "@/core/repositories/UserRepository";

type FacetedFilterProps = {
  title: string;
  options: { value: number; label: string }[];
  optionsEnabled?: number[];
  defaultValues?: number[];
  values?: number[];
  onChangeValues: (val: number[]) => void;
};
function FacetedFilter({
  title,
  options,
  defaultValues,
  optionsEnabled,
  values,
  onChangeValues,
}: FacetedFilterProps) {
  const [innerValues, setInnervalues] = useState(defaultValues || []);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} size={"sm"} className="h-8 border-dashed">
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          {title}
          {values ? (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant={"secondary"}
                className="rounded-sm px-1 font-normal"
              >
                {values.length}
              </Badge>
            </>
          ) : (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant={"secondary"}
                className="rounded-sm px-1 font-normal"
              >
                {innerValues.length}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>Sin resultados</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                let isSelected: boolean;
                if (values) {
                  isSelected = values.includes(option.value);
                } else {
                  isSelected = innerValues.includes(option.value);
                }
                return (
                  <CommandItem
                    key={"key-" + option.value}
                    disabled={
                      optionsEnabled
                        ? !optionsEnabled.includes(option.value)
                        : false
                    }
                    onSelect={() => {
                      if (isSelected) {
                        if (values) {
                          onChangeValues(
                            values.filter((opt) => opt !== option.value)
                          );
                        } else {
                          setInnervalues(
                            innerValues.filter((opt) => opt !== option.value)
                          );
                          onChangeValues(
                            innerValues.filter((opt) => opt !== option.value)
                          );
                        }
                      } else {
                        if (values) {
                          onChangeValues([...values, option.value]);
                        } else {
                          setInnervalues([...innerValues, option.value]);
                          onChangeValues([...innerValues, option.value]);
                        }
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const addUserFormSchema = z.object({
  name: z.string(),
  username: z.string().min(3, {
    message: "Es necesario un nombre de usuario de minimo 3 caracteres",
  }),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe tener al menos una letra mayúscula")
    .regex(/[0-9]/, "La contraseña debe tener al menos un número"),
  role: z.enum(
    Object.values(Role).filter((val) => val !== Role.ADMIN) as [
      Exclude<Role, Role.ADMIN>,
      ...Exclude<Role, Role.ADMIN>[]
    ],
    {
      message: "Es necesario un rol, que no sea ADMIN",
    }
  ),

  boardsIDsThatParticipate: z.array(z.number()),
});

const changePasswordFormSchema = z.object({
  password: z.string().min(8, { message: "Minimo 8 caracteres" }),
});

type UsersPageProps = {
  user: Session["user"];
  userRole: "worker" | "board_moderator" | "admin";
  boardList: {
    value: number;
    label: string;
  }[];
  respsItHas: number[];
  userList: {
    id: number;
    username: string;
    name: string | null;
    role: "worker" | "board_moderator" | "admin";
    status: "active" | "inactive";
    userBoardResponsability: {
      id: number;
      boardId: number;
      name: string;
    }[];
  }[];
};

export default function UsersPage({
  user,
  userRole,
  userList,
  boardList,
  respsItHas,
}: UsersPageProps) {
  const [isChangePassActive, setIsChangePassActive] = useState(false);
  const [hidePass, setHidePass] = useState(true);

  const addUserForm = useForm<z.infer<typeof addUserFormSchema>>({
    resolver: zodResolver(addUserFormSchema),
    defaultValues: {
      boardsIDsThatParticipate: [],
    },
  });

  async function onAddUserSubmit(values: z.infer<typeof addUserFormSchema>) {
    const createNoAdminUserResponse = await createNoAdminUser({
      name: values.name,
      username: values.username,
      password: values.password,
      role: values.role,
      status: Status.ACTIVE,
      boardsIdResponsible: values.boardsIDsThatParticipate,
      companyId: Number(user.companyId),
    });

    if (typeof createNoAdminUserResponse.errors !== "undefined") {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          "No fue posbible crear el usuario" +
          createNoAdminUserResponse.errors.toString(),
      });
      return;
    }

    addUserForm.resetField("boardsIDsThatParticipate");

    addUserForm.resetField("name");
    addUserForm.setValue("name", "");

    addUserForm.resetField("password");
    addUserForm.setValue("password", "");

    // addUserForm.resetField("role");
    addUserForm.resetField("role");

    addUserForm.resetField("username");
    addUserForm.setValue("username", "");

    // TODO: Agregar aqui el reset para que se borran los datos de la UI y aparte que no esten
    // en el estado del form.

    toast({
      title: "Okay!",
      description: "Nuevo Usuario creado con exito",
    });
  }

  const changePasswordForm = useForm<z.infer<typeof changePasswordFormSchema>>({
    resolver: zodResolver(changePasswordFormSchema),
  });

  function onChangePasswordSubmit(
    values: z.infer<typeof changePasswordFormSchema>,
    userId: number
  ) {
    try {
      UpdatePassword({ userId: userId, newPassword: values.password });
      changePasswordForm.resetField("password");
      changePasswordForm.setValue("password", "");
      toast({
        title: "Okay!",
        description: "Contraseña cambiada con exito",
      });
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No fue posible cambiar la contraseña",
      });
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
          <CardDescription>Manejador de roles de usuarios</CardDescription>
        </CardHeader>
        <CardContent>
          {userRole == "admin" && (
            <div className="w-full flex justify-end">
              <Dialog>
                <DialogTrigger>
                  <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    Nuevo Usuario
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nuevo Usuario</DialogTitle>
                  </DialogHeader>
                  <Form {...addUserForm}>
                    <form onSubmit={addUserForm.handleSubmit(onAddUserSubmit)}>
                      <FormField
                        control={addUserForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addUserForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Usuario</FormLabel>
                            <FormControl>
                              <Input placeholder="usuario" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addUserForm.control}
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

                      <FormField
                        control={addUserForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Rol</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un Rol" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* <SelectItem value="worker">
                                  Trabajador
                                </SelectItem> */}
                                <SelectItem value="board_moderator">
                                  Manager de Tablero
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={addUserForm.control}
                        name="boardsIDsThatParticipate"
                        render={({ field }) => (
                          <FormItem className="w-full flex flex-col justify-center mt-6">
                            <FormControl>
                              <FacetedFilter
                                title="Tableros"
                                values={field.value}
                                onChangeValues={field.onChange}
                                options={boardList}
                              />
                            </FormControl>
                            <FormDescription>
                              Tableros en los que participara de acuerdo a su
                              Rol
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button className="w-full mt-6" type="submit">
                        Crear Usuario
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead className="hidden md:table-cell">Estado</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userList.map((LUser) => (
                <TableRow key={LUser.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm md:text-base">
                        {LUser.name}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {LUser.username}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Select
                      disabled={userRole == "admin" ? false : true}
                      onValueChange={(val) => {
                        const newRole = val as
                          | Role.BOARD_MODERATOR
                          | Role.WORKER;
                        try {
                          updateRole({
                            userId: LUser.id,
                            role: newRole,
                          });
                          //eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (e) {
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description:
                              "No fue posbible cambiar el rol del usuario",
                          });
                        }
                      }}
                      defaultValue={LUser.role.toLowerCase()}
                    >
                      <SelectTrigger
                        disabled={LUser.role == "admin" ? true : false}
                        className="w-[200px]"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem disabled value={Role.ADMIN}>
                          Administrador
                        </SelectItem>
                        <SelectItem value={Role.BOARD_MODERATOR}>
                          Manager de Tablero
                        </SelectItem>
                        {/* <SelectItem value={Role.WORKER}>Trabajador</SelectItem> */}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant={
                        LUser.status == "active" ? "default" : "destructive"
                      }
                    >
                      {LUser.status == "active" ? "Activo" : "Bloqueado"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger>
                        <Pencil className="w-4 h-4" />
                      </DialogTrigger>
                      <DialogContent className="mt-5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              LUser.status == "active"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {LUser.status == "active" ? "Activo" : "Bloqueado"}
                          </Badge>
                          <Button
                            disabled={LUser.role == "admin" ? true : false}
                            variant={"ghost"}
                            size={"icon"}
                            onClick={() => {
                              updateStatus({
                                userId: LUser.id,
                                status:
                                  LUser.status == "active"
                                    ? Status.INACTIVE
                                    : Status.ACTIVE,
                              });
                            }}
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div>
                          <p className="text-lg font-medium">{LUser.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {LUser.username}
                          </p>
                        </div>
                        <Select
                          onValueChange={(val) => {
                            try {
                              updateRole({
                                userId: LUser.id,
                                role: val as Role.BOARD_MODERATOR | Role.WORKER,
                              });
                              //eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (e) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description:
                                  "No fue posbible cambiar el rol del usuario",
                              });
                            }
                          }}
                          defaultValue={LUser.role.toLowerCase()}
                        >
                          <SelectTrigger
                            disabled={
                              LUser.role == "admin" || userRole !== "admin"
                                ? true
                                : false
                            }
                            className="w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="board_moderator">
                              Manager de Tablero
                            </SelectItem>
                            {/* <SelectItem value="worker">Trabajador</SelectItem> */}
                          </SelectContent>
                        </Select>
                        {LUser.role == "admin"
                          ? undefined
                          : (() => {
                              if (
                                LUser.role == "board_moderator" &&
                                userRole == "board_moderator"
                              ) {
                                return undefined;
                              }
                              return (
                                <FacetedFilter
                                  title="Tableros"
                                  defaultValues={LUser.userBoardResponsability.map(
                                    (boardResp) => {
                                      return boardResp.boardId;
                                    }
                                  )}
                                  onChangeValues={(val) => {
                                    const newBoardsRespIds: number[] = val;
                                    UpdateBoardResponsabilities({
                                      userId: LUser.id,
                                      boardsIds: newBoardsRespIds,
                                    });
                                    console.log(
                                      "Cambio value: ",
                                      newBoardsRespIds
                                    );
                                  }}
                                  options={boardList}
                                  optionsEnabled={
                                    userRole == "board_moderator"
                                      ? respsItHas
                                      : undefined
                                  }
                                />
                              );
                            })()}
                        <Button
                          onClick={() => {
                            setIsChangePassActive(!isChangePassActive);
                          }}
                          variant={"secondary"}
                          className={cn([
                            "mt-4",
                            (() => {
                              if (LUser.role == "admin") {
                                return "hidden";
                              }
                              if (userRole !== "admin") {
                                return "hidden";
                              }
                            })(),
                          ])}
                        >
                          {isChangePassActive ? (
                            <>
                              <X className="w-4 h-4" />
                              Cancelar
                            </>
                          ) : (
                            "Cambiar Contraseña"
                          )}
                        </Button>
                        <div
                          className={cn([
                            "flex flex-col gap-3",
                            isChangePassActive ? undefined : "hidden",
                          ])}
                        >
                          <Form {...changePasswordForm}>
                            <form
                              onSubmit={changePasswordForm.handleSubmit(
                                (
                                  values: z.infer<
                                    typeof changePasswordFormSchema
                                  >
                                ) => {
                                  onChangePasswordSubmit(values, LUser.id);
                                }
                              )}
                              className="flex items-start w-full"
                            >
                              <FormField
                                control={changePasswordForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormControl>
                                      <Input
                                        type={hidePass ? "password" : "text"}
                                        placeholder="Nueva Contraseña"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button
                                className="ml-2 mr-8"
                                variant={"ghost"}
                                size={"icon"}
                                onClick={(e) => {
                                  e.preventDefault();
                                  setHidePass(!hidePass);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button type="submit">Confirmar</Button>
                            </form>
                          </Form>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        {/* <CardFooter>
          <div className="w-full">
            <div className="text-xs text-muted-foreground">
              Se muestran <strong>1-10</strong> de <strong>32</strong> usuarios
            </div>
            <Pagination className="w-full mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    2
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter> */}
      </Card>
    </main>
  );
}
