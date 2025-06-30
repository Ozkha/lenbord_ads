"use client";
import { updateKpiGoal } from "@/actions/kpi/updateKpiGoal";
import { createKpi } from "@/actions/kpi/createKpi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { MinusCircle, Pencil, RotateCcw } from "lucide-react";
import { Session } from "next-auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GoalLabel, Operator } from "@/core/repositories/KpiRepository";

type CategoryBarProps = {
  data: {
    label: "success" | "fail" | "mid";
    operator: ">" | "<=";
    amount: number;
  }[];
  className?: string;
};
function CategoryBar({ data, className }: CategoryBarProps) {
  return (
    <div className={cn(["w-full", className])}>
      <div className="w-full flex justify-around mb-1">
        {data.map((val) => (
          <p key={"label-" + val.label} className="text-xs">
            {val.operator + "" + val.amount}
          </p>
        ))}
      </div>
      <div className="flex flex-row h-3">
        {data.map((val) => (
          <div
            key={"visual-" + val.label}
            className={cn([
              "h-full w-full first:rounded-l-md last:rounded-r-md",
              (() => {
                if (val.label == "success") return "bg-emerald-400";
                if (val.label == "fail") return "bg-red-500";
                else {
                  return "bg-amber-400";
                }
              })(),
            ])}
          />
        ))}
      </div>
    </div>
  );
}

const kpiFormSchema = z.object({
  name: z.string().min(2, { message: "Debe ingresar un nombre" }),
  metric: z.string().min(2, { message: "Es necesaria una metrica valida" }),
  goal: z
    .array(
      z.object({
        label: z.enum(["success", "fail", "mid"]),
        operator: z.enum([">", "<="]),
        amount: z.number(),
      })
    )
    .min(2, { message: "Debe haber por lo menos 2 elementos" })
    .refine(
      (data) => {
        if (data.length > 2) {
          return true;
        }
        if (data[1].amount == data[0].amount) {
          return true;
        }
        return false;
      },
      {
        message: "El segundo elemento debe ser igual al primero",
      }
    )
    .refine(
      (data) => {
        if (data.length < 3) {
          return true;
        }
        if (data[1].amount > data[0].amount) {
          return true;
        }

        return false;
      },
      {
        message: "El segundo elemento debe ser mayor al primero",
      }
    )
    .refine(
      (data) => {
        if (data.length < 3) {
          return true;
        }
        if (data[2].amount == data[1].amount) {
          return true;
        }
        return false;
      },
      {
        message: "El segundo y tercer elemento deben tener el mismo valor",
      }
    ),
});

const kpiUpdateFormSchema = z.object({
  id: z.number(),
  newGoal: z
    .array(
      z.object({
        label: z.enum(["success", "fail", "mid"]),
        operator: z.enum([">", "<="]),
        amount: z.number(),
      })
    )
    .min(2, { message: "Debe haber por lo menos 2 elementos" })
    .refine(
      (data) => {
        if (data.length > 2) {
          return true;
        }
        if (data[1].amount == data[0].amount) {
          return true;
        }
        return false;
      },
      {
        message: "El segundo elemento debe ser igual al primero",
      }
    )
    .refine(
      (data) => {
        if (data.length < 3) {
          return true;
        }
        if (data[1].amount > data[0].amount) {
          return true;
        }

        return false;
      },
      {
        message: "El segundo elemento debe ser mayor al primero",
      }
    )
    .refine(
      (data) => {
        if (data.length < 3) {
          return true;
        }
        if (data[2].amount == data[1].amount) {
          return true;
        }
        return false;
      },
      {
        message: "El segundo y tercer elemento deben tener el mismo valor",
      }
    ),
});

type KpisPageProps = {
  user: Session["user"];
  kpiList: {
    id: number;
    name: string;
    metric: string;
    fields: string[];
    goalId: number;
    goalCratedAt: Date;
    goal: {
      label: "success" | "fail" | "mid";
      operator: ">" | "<=";
      amount: number;
    }[];
  }[];
};

export default function KpisPage({ user, kpiList }: KpisPageProps) {
  const kpiForm = useForm<z.infer<typeof kpiFormSchema>>({
    resolver: zodResolver(kpiFormSchema),

    defaultValues: {
      name: "",
      metric: "",
      goal: [
        {
          label: "success",
          operator: "<=",
          amount: 1,
        },
        {
          label: "mid",
          operator: "<=",
          amount: 2,
        },
        {
          label: "fail",
          operator: ">",
          amount: 2,
        },
      ],
    },
  });

  const kpiUpdateForm = useForm<z.infer<typeof kpiUpdateFormSchema>>({
    resolver: zodResolver(kpiUpdateFormSchema),
    defaultValues: {
      id: -1,
      newGoal: [],
    },
  });

  async function onSubmit(values: z.infer<typeof kpiFormSchema>) {
    try {
      createKpi({
        name: values.name,
        metric: values.metric,
        companyId: Number(user.companyId),
        goal: values.goal as {
          label: GoalLabel;
          operator: Operator;
          amount: number;
        }[],
      });
      kpiForm.reset();
      toast({
        variant: "default",
        title: "Okay!",
        description: "KPI creado con exito",
      });
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No fue posbible crear el KPI",
      });
    }
  }

  async function onSubmitUpdate(values: z.infer<typeof kpiUpdateFormSchema>) {
    try {
      updateKpiGoal({
        kpiId: values.id,
        goal: values.newGoal as {
          label: GoalLabel;
          operator: Operator;
          amount: number;
        }[],
      });
      toast({
        variant: "default",
        title: "Okay!",
        description: "KPI actualizado con exito",
      });
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No fue posbible actualizar el KPI",
      });
    }
  }

  const [midValAux, setMidValAux] = useState<{
    label: "success" | "mid" | "fail";
    operator: "<=" | ">";
    amount: number;
  }>({
    label: "mid",
    operator: "<=",
    amount: 2,
  });

  function getMetricFields(metric: string): string[] {
    const regex = /[a-zA-Z_]\w*/g;
    const coincidencias = metric.match(regex);

    const variablesUnicas = [...new Set(coincidencias)];

    return variablesUnicas;
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle>KPI{"'"}s</CardTitle>
          <CardDescription>Necesarios para crear tableros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full flex justify-end">
            <Dialog>
              <DialogTrigger>
                <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Nuevo KPI
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo KPI</DialogTitle>
                  <DialogDescription>
                    Despues de crear un nuevo KPI, posteriormente solo sera
                    posible modificar la meta.
                  </DialogDescription>
                </DialogHeader>

                <Form {...kpiForm}>
                  <form onSubmit={kpiForm.handleSubmit(onSubmit)}>
                    <FormField
                      control={kpiForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre del KPI" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={kpiForm.control}
                      name="metric"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metrica</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(accidentes/horas_trabajadas)*100"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            No usar espacios en los nombres de las variables o
                            campos. Asegurarse de cerrar los parentesis abiertos
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mt-4 mb-4">
                      <p className="text-sm font-semibold">
                        Campos identificados
                      </p>
                      <ul className="my-2 ml-6 list-disc [&>li]:mt-2">
                        {getMetricFields(kpiForm.watch().metric).map(
                          (field) => (
                            <li key={"cmps-" + field}>{field}</li>
                          )
                        )}
                      </ul>
                    </div>

                    <FormField
                      control={kpiForm.control}
                      name="goal"
                      render={(fieldMayor) => (
                        <FormItem>
                          <FormLabel>Meta</FormLabel>
                          <div className="w-full flex justify-around mb-3">
                            <p className="w-full text-sm font-medium text-center">
                              {fieldMayor.field.value[0].label == "success"
                                ? "Objetivo"
                                : "Fallo"}
                            </p>
                            <div className="w-full" />
                            <p className="w-full text-sm font-medium text-center">
                              {fieldMayor.field.value[
                                fieldMayor.field.value.length - 1
                              ].label == "success"
                                ? "Objetivo"
                                : "Fallo"}
                            </p>
                          </div>
                          <CategoryBar data={fieldMayor.field.value} />
                          <div className="w-full flex gap-1">
                            {kpiForm.getValues().goal.map((val, index) => (
                              <FormField
                                key={"slecs-" + index}
                                control={kpiForm.control}
                                name="goal"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={"formI" + index}
                                      className=" flex items-center  justify-center gap-1 w-full"
                                    >
                                      <Input
                                        type="number"
                                        defaultValue={field.value[index].amount}
                                        onChange={(e) => {
                                          e.preventDefault();
                                          const valueInput = e.target.value;
                                          const updatedState = [...field.value];

                                          const stateToModify =
                                            updatedState[index];

                                          stateToModify.amount =
                                            Number(valueInput);

                                          if (index == 0) {
                                            stateToModify.operator = "<=";
                                          }
                                          if (field.value.length > 2) {
                                            if (index == 1) {
                                              stateToModify.operator = "<=";
                                            }
                                            if (index == 2) {
                                              stateToModify.operator = ">";
                                            }
                                          } else {
                                            if (index == 1) {
                                              stateToModify.operator = ">";
                                            }
                                          }

                                          field.onChange(updatedState);
                                        }}
                                      />
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </div>
                          <div className="flex flex-row flex-nowrap gap-2 mt-3">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                const updatedState = [
                                  ...fieldMayor.field.value,
                                ];

                                const firstVal = updatedState[0];
                                const lastVal =
                                  updatedState[
                                    fieldMayor.field.value.length - 1
                                  ];
                                if (firstVal.label == "fail") {
                                  firstVal.label = "success";
                                } else if (firstVal.label == "success") {
                                  firstVal.label = "fail";
                                }

                                if (lastVal.label == "fail") {
                                  lastVal.label = "success";
                                } else if (lastVal.label == "success") {
                                  lastVal.label = "fail";
                                }

                                fieldMayor.field.onChange([...updatedState]);
                              }}
                              className="w-full"
                              variant={"outline"}
                            >
                              <RotateCcw className="w-4 h-5 mr-1" />
                              Invertir
                            </Button>
                            <Button
                              onClick={(e) => {
                                // FIXME: Se confun den el mid y el ultimo, en el UI. en formulario No.
                                e.preventDefault();
                                const updatedState = [
                                  ...fieldMayor.field.value,
                                ];

                                if (fieldMayor.field.value.length > 2) {
                                  setMidValAux(updatedState[1]);
                                  updatedState.splice(1, 1);
                                  fieldMayor.field.onChange(updatedState);
                                }
                                if (fieldMayor.field.value.length < 3) {
                                  const futureThird = updatedState[1];
                                  updatedState.push(futureThird);
                                  updatedState[1] = midValAux;

                                  fieldMayor.field.onChange(updatedState);
                                }
                              }}
                              className="w-full"
                              variant={"outline"}
                            >
                              <MinusCircle className="w-4 h-5 mr-1" />
                              Eliminar o agregar Parcial
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full mt-6">
                      Agregar KPI
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {kpiList.length < 1 ? (
            <div className="w-full my-4">
              <p className="text-center text-muted-foreground">
                No hay KPI{"'"}s disponibles, cree uno nuevo.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Metrica
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Meta Actual
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpiList.map((kpi) => (
                  <TableRow key={"kpi-" + kpi.name}>
                    <TableCell className="font-medium">{kpi.name}</TableCell>
                    <TableCell className="hidden md:table-cell italic font-serif">
                      {kpi.metric}
                    </TableCell>

                    <TableCell className="hidden lg:table-cell min-w-28">
                      <CategoryBar data={kpi.goal} />
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger
                          onClick={() => {
                            kpiUpdateForm.setValue("id", kpi.id);
                            kpiUpdateForm.setValue("newGoal", kpi.goal);
                          }}
                          className="h-full flex items-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{kpi.name}</DialogTitle>
                          </DialogHeader>
                          <div>
                            <p className="text-sm font-semibold mb-2">Meta</p>
                            <div className="w-full flex justify-around  mb-3">
                              <p className="w-full text-sm font-medium text-center">
                                Objetivo
                              </p>
                              <div className="w-full" />
                              <p className="w-full text-sm font-medium text-center">
                                Fallo
                              </p>
                            </div>
                            <Form {...kpiUpdateForm}>
                              <form
                                onSubmit={kpiUpdateForm.handleSubmit(
                                  onSubmitUpdate
                                )}
                              >
                                <FormField
                                  control={kpiUpdateForm.control}
                                  name="newGoal"
                                  render={(fieldMayor) => (
                                    <FormItem>
                                      <FormLabel>Meta</FormLabel>
                                      <div className="w-full flex justify-around mb-3">
                                        <p className="w-full text-sm font-medium text-center">
                                          {fieldMayor.field.value[0].label ==
                                          "success"
                                            ? "Objetivo"
                                            : "Fallo"}
                                        </p>
                                        <div className="w-full" />
                                        <p className="w-full text-sm font-medium text-center">
                                          {fieldMayor.field.value[
                                            fieldMayor.field.value.length - 1
                                          ].label == "success"
                                            ? "Objetivo"
                                            : "Fallo"}
                                        </p>
                                      </div>
                                      <CategoryBar
                                        data={fieldMayor.field.value}
                                      />
                                      <div className="w-full flex gap-1">
                                        {kpiUpdateForm
                                          .getValues()
                                          .newGoal.map((val, index) => (
                                            <FormField
                                              key={"slecs-" + index}
                                              control={kpiUpdateForm.control}
                                              name="newGoal"
                                              render={({ field }) => {
                                                return (
                                                  <FormItem
                                                    key={"formI" + index}
                                                    className=" flex items-center  justify-center gap-1 w-full"
                                                  >
                                                    <Input
                                                      type="number"
                                                      defaultValue={
                                                        field.value[index]
                                                          .amount
                                                      }
                                                      onChange={(e) => {
                                                        e.preventDefault();
                                                        const valueInput =
                                                          e.target.value;
                                                        const updatedState = [
                                                          ...field.value,
                                                        ];

                                                        const stateToModify =
                                                          updatedState[index];

                                                        stateToModify.amount =
                                                          Number(valueInput);

                                                        if (index == 0) {
                                                          stateToModify.operator =
                                                            "<=";
                                                        }
                                                        if (
                                                          field.value.length > 2
                                                        ) {
                                                          if (index == 1) {
                                                            stateToModify.operator =
                                                              "<=";
                                                          }
                                                          if (index == 2) {
                                                            stateToModify.operator =
                                                              ">";
                                                          }
                                                        } else {
                                                          if (index == 1) {
                                                            stateToModify.operator =
                                                              ">";
                                                          }
                                                        }

                                                        field.onChange(
                                                          updatedState
                                                        );
                                                      }}
                                                    />
                                                  </FormItem>
                                                );
                                              }}
                                            />
                                          ))}
                                      </div>
                                      <div className="flex flex-row flex-nowrap gap-2 mt-3">
                                        <Button
                                          onClick={(e) => {
                                            e.preventDefault();
                                            const updatedState = [
                                              ...fieldMayor.field.value,
                                            ];

                                            const firstVal = updatedState[0];
                                            const lastVal =
                                              updatedState[
                                                fieldMayor.field.value.length -
                                                  1
                                              ];
                                            if (firstVal.label == "fail") {
                                              firstVal.label = "success";
                                            } else if (
                                              firstVal.label == "success"
                                            ) {
                                              firstVal.label = "fail";
                                            }

                                            if (lastVal.label == "fail") {
                                              lastVal.label = "success";
                                            } else if (
                                              lastVal.label == "success"
                                            ) {
                                              lastVal.label = "fail";
                                            }

                                            fieldMayor.field.onChange([
                                              ...updatedState,
                                            ]);
                                          }}
                                          className="w-full"
                                          variant={"outline"}
                                        >
                                          <RotateCcw className="w-4 h-5 mr-1" />
                                          Invertir
                                        </Button>
                                        <Button
                                          onClick={(e) => {
                                            // FIXME: Se confun den el mid y el ultimo, en el UI. en formulario No.
                                            e.preventDefault();
                                            const updatedState = [
                                              ...fieldMayor.field.value,
                                            ];

                                            if (
                                              fieldMayor.field.value.length > 2
                                            ) {
                                              setMidValAux(updatedState[1]);
                                              updatedState.splice(1, 1);
                                              fieldMayor.field.onChange(
                                                updatedState
                                              );
                                            }
                                            if (
                                              fieldMayor.field.value.length < 3
                                            ) {
                                              const futureThird =
                                                updatedState[1];
                                              updatedState.push(futureThird);
                                              updatedState[1] = midValAux;

                                              fieldMayor.field.onChange(
                                                updatedState
                                              );
                                            }
                                          }}
                                          className="w-full"
                                          variant={"outline"}
                                        >
                                          <MinusCircle className="w-4 h-5 mr-1" />
                                          Eliminar o agregar Parcial
                                        </Button>
                                      </div>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <Button type="submit" className="w-full mt-6">
                                  Actualizar
                                </Button>
                              </form>
                            </Form>
                          </div>

                          <Separator className="my-2" />
                          <div>
                            <p className="text-sm font-semibold mb-2">
                              Metrica
                            </p>
                            <p className="italic font-serif mt-1">
                              {kpi.metric}
                            </p>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-semibold">Campos</p>
                            <ul className="my-2 ml-6 list-disc [&>li]:mt-2">
                              {kpi.fields.map((field) => (
                                <li key={"li-" + field}>{field}</li>
                              ))}
                            </ul>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {/* <CardFooter>
          <div className="w-full">
            <div className="text-xs text-muted-foreground">
              Se muestran <strong>1-10</strong> de <strong>32</strong> KPI{"'"}s
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
