"use client";

import { getFiveWhyRegister } from "@/actions/fivewhy/getFiveWhyRegistry";
import MonthPicker from "@/components/ui-compounded/monthpicker";
import { Tracker } from "@/components/ui-compounded/tracker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  SquareCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { CreateTask } from "@/actions/task/createTask";

import { getFiveWhyTotalEntries } from "@/actions/fivewhy/getFiveWhyTotalEntries";
import { Session } from "next-auth";
import { DatePickerRange } from "@/components/ui-compounded/daterangepicker";

// components/MarkdownRenderer.tsx

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Definimos las props que recibirá nuestro componente
interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]} // Activamos el plugin para tablas, etc.
    >
      {content}
    </ReactMarkdown>
  );
}

// TODO:
// Me falto que se hiciera funcional la pestania de ajustes en area page.

// components/IntelligentSuggestionDialog.tsx

import { Loader2, AlertTriangle } from "lucide-react";

// Este componente ahora es "inteligente". Maneja su propio estado y la llamada a la API.
export function IntelligentSuggestionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchAnalysis = async () => {
    // Si ya tenemos un análisis, no lo volvemos a pedir en la misma sesión del diálogo
    if (analysis) return;

    setIsLoading(true);
    setError(null);

    try {
      // Llamamos a la API que creaste.
      // Asegúrate que la URL coincida con la ubicación de tu archivo de API.
      const response = await fetch("/api/analyzew");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Ocurrió un error al obtener la sugerencia."
        );
      }

      const data = await response.json();
      setAnalysis(data.cleanedAnalysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Cuando el diálogo se abre, llamamos a la función para obtener los datos.
      handleFetchAnalysis();
    } else {
      // Opcional: Reseteamos el estado cuando el diálogo se cierra.
      setAnalysis(null);
      setError(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Sparkles className="w-4 h-4 mr-2" />
          Generar Sugerencia Inteligente
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px] max-h-[650px] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
            Análisis y Sugerencias Estratégicas
          </DialogTitle>
          <DialogDescription>
            Análisis generado por IA basado en los últimos 6 reportes de
            incidentes aleatorios.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm text-muted-foreground">
                Analizando datos y conectando con la IA (Este proceso puede
                tardar un par de minutos)...
              </p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full text-destructive">
              <AlertTriangle className="h-8 w-8" />
              <p className="mt-2 font-semibold">Error al generar el análisis</p>
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {analysis && (
            // Usamos 'whitespace-pre-wrap' para respetar los saltos de línea y el formato del LLM
            <div className="text-sm text-foreground whitespace-pre-wrap p-4 bg-secondary rounded-md">
              {/* {analysis} */}
              <MarkdownRenderer content={analysis} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type AreaPageProps = {
  user: Session["user"];
  maxfivedumps: number;
  areaInfo: {
    id: number;
    name: number;
    board: {
      id: number;
      name: string;
    };
    kpi: {
      name: string;
    };
  };
  areaCurrentDateData: {
    date: Date;
    maxDays: number;
    data: {
      status: "success" | "fail" | "mid" | "disabled" | "empty" | null;
      fieldValues: number[];
      day: number;
    }[];
  };
  areaSelectedDateData: {
    date: Date;
    maxDays: number;
    data: {
      status: "success" | "fail" | "mid" | "disabled" | "empty" | null;
      fieldValues: number[];
      day: number;
    }[];
  };
  causes: {
    id: number;
    name: string;
    frecuency: number;
  }[];
  currentFiveDumpsPage: number;
  currentFiveDump:
    | {
        date: Date;
        what: string;
        where: string | null;
        who: string | null;
        why: string | null;
        whyDetails: string | null;
      }
    | undefined;
  userList: {
    value: number;
    name: string | null;
    username: string;
  }[];
};

const formAddTaskSchema = z.object({
  title: z.string({ message: "Es necesario un titulo" }),
  userAssignedId: z
    .string({
      message: "Es necesario un usuario responsable",
    })
    .min(1),
  limitDate: z.date().optional(),
  description: z.string().optional(),
  problem: z.string({ message: "Es necesario definir el problema" }),
  causeId: z.string({ message: "Es necesario seleccionar una causa" }).min(1),
});

export default function AreaPage({
  user,
  areaCurrentDateData,
  areaSelectedDateData,
  causes,
  areaInfo,
  currentFiveDumpsPage,
  maxfivedumps,
  currentFiveDump,
  userList,
}: AreaPageProps) {
  const router = useRouter();

  const addTaskForm = useForm<z.infer<typeof formAddTaskSchema>>({
    resolver: zodResolver(formAddTaskSchema),
  });

  function onAddTaskSubmit(values: z.infer<typeof formAddTaskSchema>) {
    try {
      CreateTask({
        title: values.title,
        boardId: areaInfo.board.id,
        areaId: areaInfo.id,
        userAssignedId: Number(values.userAssignedId),
        assignedByUserId: Number(user.id),
        problem: values.problem,
        causeId: Number(values.causeId),
        description: values.description,
        dueDate: values.limitDate,
        companyId: Number(user.companyId),
      });

      addTaskForm.resetField("title");
      addTaskForm.setValue("title", "");

      addTaskForm.resetField("limitDate");
      addTaskForm.setValue("limitDate", undefined);

      addTaskForm.resetField("problem");
      addTaskForm.setValue("problem", "");

      addTaskForm.resetField("description");
      addTaskForm.setValue("description", "");
      toast({
        title: "Okay!",
      });
      //eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al asignar la accion",
      });
    }
  }
  // FIXME: Error en que cuando cambio de fecha en la page, no refresca. Yo creo que deberia
  // otra hipotesis: Arreglarlemas para no usar el react.state y mejor solamente
  // el revalidatePath.

  const [specificDay5WDialogOpen, setSpecificDay5WDialogOpen] = useState(false);
  const [specific5wsDate, setSpecific5wsDate] = useState<Date | undefined>(
    undefined
  );
  const [currentSpecific5w, setCurrentSpecific5W] = useState<
    | {
        date: Date;
        what: string;
        where: string | null;
        who: string | null;
        why: string | null;
        whyDetails: string | null;
      }
    | undefined
  >(undefined);
  const [specificw5Page, setSpecificW5Page] = useState(0);
  const [specificw5MaxPages, setSpecificW5MaxPages] = useState(0);

  if (areaInfo.id == null) {
    return (
      <main className="p-4 sm:px-6 sm:py-0">
        <div className="w-full">
          <p className="text-center text-xl mt-8">
            Es necesario haber seleccionada el area de algun tablero al entrar
            aqui
          </p>
        </div>
      </main>
    );
  }

  enum COLORS {
    "fail" = "#fe0000",
    "success" = "#00C49F",
    "mid" = "#FF8042",
    "disabled" = "#71717a",
    "empty" = "#cbd5e1",
  }

  return (
    <main className="p-4 sm:px-6 sm:py-0">
      <Tabs defaultValue="dashboard">
        <div className="flex flex-col md:flex-row py-4 sm:py-6 justify-between">
          <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight ">
            {areaInfo.name}{" "}
            <span className="text-base text-muted-foreground">
              {areaInfo.board.name}
            </span>
          </h3>
          <TabsList className="mt-2 md:mt-0">
            <TabsTrigger value="dashboard" className="w-full">
              Dashboard
            </TabsTrigger>
            <TabsTrigger disabled value="settings" className="w-full">
              Ajustes
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="dashboard">
          <MonthPicker
            defaultValue={new Date()}
            onClickAction={(datee) => {
              const newUrl =
                "/app/area?area=" +
                areaInfo.id +
                "&year=" +
                datee.getFullYear() +
                "&month=" +
                (datee.getMonth() + 1);
              router.replace(newUrl);
            }}
          />
          <div className="mt-2 grid flex-1 items-start gap-4 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
            <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                <Card className="sm:col-span-2">
                  <CardHeader className="pb-3">
                    <CardDescription className="font-semibold">
                      Mostrando:{" "}
                      {areaSelectedDateData.date.toLocaleString("defafult", {
                        month: "long",
                      })}
                      , {areaSelectedDateData.date.getFullYear()}
                    </CardDescription>{" "}
                  </CardHeader>
                  <CardContent>
                    <Tracker
                      data={(() => {
                        const finalData: { color: string; tooltip: string }[] =
                          [];

                        for (
                          let i = 1;
                          i <= areaSelectedDateData.maxDays;
                          i++
                        ) {
                          const val = areaSelectedDateData.data.find(
                            (dayData) => i === dayData.day
                          );
                          if (val) {
                            if (val.status == null) val.status = "empty";
                            finalData[i] = {
                              tooltip: val.day.toString(),
                              color: COLORS[val.status],
                            };
                          } else {
                            finalData[i] = {
                              tooltip: i.toString(),
                              color: COLORS.empty,
                            };
                          }
                        }
                        return finalData;
                      })()}
                    />
                  </CardContent>
                </Card>
                <Card className="sm:col-span-2">
                  <CardHeader className="pb-2">
                    <CardDescription>
                      Actual:{" "}
                      {areaCurrentDateData.date.toLocaleString("defafult", {
                        month: "long",
                      })}
                      , {areaCurrentDateData.date.getFullYear()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tracker
                      data={(() => {
                        const finalData: { color: string; tooltip: string }[] =
                          [];

                        for (let i = 1; i <= areaCurrentDateData.maxDays; i++) {
                          const val = areaCurrentDateData.data.find(
                            (dayData) => i === dayData.day
                          );
                          if (val) {
                            if (val.status == null) val.status = "empty";
                            finalData[i] = {
                              tooltip: val.day.toString(),
                              color: COLORS[val.status],
                            };
                          } else {
                            finalData[i] = {
                              tooltip: i.toString(),
                              color: COLORS.empty,
                            };
                          }
                        }
                        return finalData;
                      })()}
                    />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader className="px-7">
                  <CardTitle className="flex items-center justify-between">
                    <p>Causas</p>
                    {/* <Dialog>
                      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        <SquareCheck className="w-4 h-4 mr-1" />
                        Asignar Accion
                      </DialogTrigger>
                      <DialogContent>
                        <div className="w-full flex gap-1">
                          <Badge>{areaInfo.name}</Badge>
                          <Badge>{areaInfo.board.name}</Badge>
                        </div>
                        <Form {...addTaskForm}>
                          <form
                            onSubmit={addTaskForm.handleSubmit(onAddTaskSubmit)}
                          >
                            <FormField
                              control={addTaskForm.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      className="text-lg border-0 border-b"
                                      placeholder="Titulo..."
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="flex justify-start my-2">
                              <FormField
                                control={addTaskForm.control}
                                name="limitDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant={"ghost"}
                                            className={cn(
                                              "max-w-[280px] justify-start text-left font-normal",
                                              !field.value &&
                                                "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {field.value ? (
                                              format(field.value, "PPP")
                                            ) : (
                                              <span>Sin fecha limite</span>
                                            )}
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Separator orientation="vertical" />
                              <FormField
                                control={addTaskForm.control}
                                name="userAssignedId"
                                render={({ field }) => (
                                  <FormItem>
                                    <div className="flex items-center">
                                      <p className="text-xs text-gray-500 ml-2">
                                        👤
                                      </p>
                                      <Select onValueChange={field.onChange}>
                                        <FormControl>
                                          <SelectTrigger className="max-w-[180px] border-0">
                                            <SelectValue placeholder="Usuario responsable" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {userList.map((usr) => (
                                            <SelectItem
                                              key={"usrss-" + usr.value}
                                              value={usr.value + ""}
                                            >
                                              {usr.name
                                                ? usr.name
                                                : usr.username}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={addTaskForm.control}
                              name="problem"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Problema</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addTaskForm.control}
                              name="causeId"
                              render={({ field }) => (
                                <FormItem className="mt-2">
                                  <FormLabel>Causa</FormLabel>
                                  <Select onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecciona la Causa" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {causes.map((cause) => (
                                        <SelectItem
                                          key={cause.id + ""}
                                          value={cause.id + ""}
                                        >
                                          {cause.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={addTaskForm.control}
                              name="description"
                              render={({ field }) => (
                                <FormItem className="mt-3">
                                  <FormLabel>Descripcion</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button className="w-full mt-4" type="submit">
                              Asignar
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog> */}
                    {/* <Dialog>
                      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Sugerencia Inteligente
                      </DialogTrigger>
                      <DialogContent></DialogContent>
                    </Dialog> */}
                    <IntelligentSuggestionDialog />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row md:gap-4">
                  {causes.length > 0 ? (
                    <ResponsiveContainer
                      className="p-0 m-0 min-h-60 md:min-h-96"
                      width="100%"
                      height="100%"
                    >
                      <BarChart width={150} height={40} data={causes}>
                        <XAxis
                          dataKey="name"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="frecuency"
                          fill="currentColor"
                          radius={[4, 4, 0, 0]}
                          className="fill-primary"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-muted-foreground">
                      No se han ingresado causas para ser graficadas
                    </div>
                  )}
                  <Separator
                    className="hidden md:inline-block"
                    orientation="vertical"
                  ></Separator>
                  <div>
                    <ul className="md:min-w-48 lg:min-w-60 gap-3">
                      {causes.map((cause, indx) => (
                        <li
                          key={"cause-l-" + cause.id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <span className="text-sm">{indx + 1}</span>
                            <span className="text-sm text-muted-foreground ml-3">
                              {cause.name}
                            </span>
                          </div>
                          <span className="text-sm">
                            {/* {((cause.frecuency / 97) * 100).toFixed(1)}% */}
                            {cause.frecuency}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Dialog>
                      <DialogTrigger className="w-full">
                        {causes.length > 0 ? (
                          <div className="mt-4 text-sm font-medium">
                            Mostrar Mas
                          </div>
                        ) : (
                          <></>
                        )}
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Causas</DialogTitle>
                          <DialogDescription>
                            Lista de todas las causas registradas en el rango de
                            tiempo
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-between mb-2">
                          <p className="text-muted-foreground text-sm">Causa</p>
                          <p className="text-muted-foreground text-sm">
                            Frecuencia
                          </p>
                        </div>
                        <ul className="md:min-w-48 lg:min-w-60 gap-3">
                          {causes.map((cause, indx) => (
                            <li
                              key={"cause-l-" + cause.id}
                              className="flex items-center justify-between"
                            >
                              <div>
                                <span className="text-sm">{indx + 1}</span>
                                <span className="text-sm text-muted-foreground ml-3">
                                  {cause.name}
                                </span>
                              </div>
                              <span className="text-sm">
                                {/* {((cause.frecuency / 97) * 100).toFixed(1)}% */}
                                {cause.frecuency}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <DatePickerRange
                className="mb-2"
                from={new Date()}
                to={new Date()}
              />
              {/* TODO: AQUI ANDO PARA LA REMODELACION */}
              {/* Hacer un multiple date picker que pueda filtrar por todo lo que sea de este mes, si es que no ese escoge ninguno
              en particular, o solo los que se hayan escogido. */}
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-start bg-muted/50">
                  <div className="grid gap-0.5">
                    <CardTitle className="group flex items-center gap-2 text-lg">
                      5W
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      {currentFiveDump
                        ? currentFiveDump.date.toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Vacio"}
                    </CardDescription>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <p className="mr-4 text-sm">
                      {currentFiveDumpsPage} / {maxfivedumps}
                    </p>
                    {currentFiveDump ? (
                      <Pagination className="ml-auto mr-0 w-auto">
                        <PaginationContent>
                          <PaginationItem>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={async () => {
                                const newUrl =
                                  "/app/area?area=" +
                                  areaInfo.id +
                                  "&year=" +
                                  areaSelectedDateData.date.getFullYear() +
                                  "&month=" +
                                  (areaSelectedDateData.date.getMonth() + 1) +
                                  "&page=" +
                                  (currentFiveDumpsPage - 1);
                                router.replace(newUrl);
                              }}
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              <span className="sr-only">Previous Order</span>
                            </Button>
                          </PaginationItem>
                          <PaginationItem>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={async () => {
                                const newUrl =
                                  "/app/area?area=" +
                                  areaInfo.id +
                                  "&year=" +
                                  areaSelectedDateData.date.getFullYear() +
                                  "&month=" +
                                  (areaSelectedDateData.date.getMonth() + 1) +
                                  "&page=" +
                                  (currentFiveDumpsPage + 1);
                                router.replace(newUrl);
                              }}
                            >
                              <ChevronRight className="h-3.5 w-3.5" />
                              <span className="sr-only">Next Order</span>
                            </Button>
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    ) : (
                      <></>
                    )}
                  </div>
                </CardHeader>
                {currentFiveDump ? (
                  <CardContent className="p-6 text-sm">
                    <div className="grid gap-3">
                      <div className="font-semibold">Que?</div>
                      <p className="text-muted-foreground">
                        {currentFiveDump.what}
                      </p>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-3">
                      <div className="font-semibold">Donde?</div>
                      <div>
                        <Badge>{currentFiveDump.where}</Badge>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-3">
                      <div className="font-semibold">Quien?</div>
                      <div>
                        <Badge>{currentFiveDump.who}</Badge>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-3">
                      <div className="font-semibold">Porque / Causa?</div>
                      <div className="flex gap-2">
                        <Badge>{currentFiveDump.why}</Badge>
                      </div>
                      <p>Descripcion:</p>
                      <p className="text-muted-foreground text-sm">
                        {currentFiveDump.whyDetails}
                      </p>
                    </div>
                  </CardContent>
                ) : (
                  <></>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="settings">
          <div className="w-full flex justify-center">
            <Card className="w-full max-w-[45rem]">
              <CardHeader>
                <CardTitle>Ajustes</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="areaname">Nombre</Label>
                <Input
                  className="mb-6"
                  type="text"
                  id="areaname"
                  value={"Security"}
                ></Input>

                <Label htmlFor="areakpi">KPI</Label>
                <Select defaultValue="apple">
                  <SelectTrigger id="areakpi" className="w-full">
                    <SelectValue placeholder="Selecciona una KPI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apple">
                      Margen de utilidad bruta
                    </SelectItem>
                    <SelectItem value="banana">Retorno de iversion</SelectItem>
                    <SelectItem value="blueberry">Productividad</SelectItem>
                    <SelectItem value="grapes">Clientes Adquiridos</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="mt-8 w-full" variant={"destructive"}>
                  Eliminar
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
