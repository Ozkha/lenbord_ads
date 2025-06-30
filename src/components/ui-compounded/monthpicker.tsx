"use client";
import React, { useState } from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

type MonthPickerProps = {
  defaultValue: Date;
  onClickAction: (value: Date) => void;
};
export default function MonthPicker({
  defaultValue,
  onClickAction,
}: MonthPickerProps) {
  const [value, setValue] = useState(defaultValue);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id="date"
          variant={"outline"}
          className="justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.toLocaleString("default", { month: "long" })},{" "}
          {value.getFullYear()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-52 space-y-2" align="start">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              const newDate = new Date(value.getTime());
              newDate.setFullYear(newDate.getFullYear() - 1);

              setValue(newDate);
            }}
            className="h-8 w-8"
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <div className="text-sm font-medium">{value.getFullYear()}</div>
          <Button
            onClick={() => {
              const newDate = new Date(value.getTime());
              newDate.setFullYear(newDate.getFullYear() + 1);

              setValue(newDate);
            }}
            className="h-8 w-8"
            variant={"outline"}
            size={"icon"}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Button
            onClick={() => {
              const newDate = new Date(value.getTime());
              newDate.setMonth(newDate.getMonth() - 1);

              setValue(newDate);
            }}
            className="h-8 w-8"
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <div className="text-sm font-medium">
            {value.toLocaleString("default", { month: "long" })}
          </div>
          <Button
            onClick={() => {
              const newDate = new Date(value.getTime());
              newDate.setMonth(newDate.getMonth() + 1);

              setValue(newDate);
            }}
            className="h-8 w-8"
            variant={"outline"}
            size={"icon"}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <Button onClick={() => onClickAction(value)} className="w-full">
          Usar fecha
        </Button>
      </PopoverContent>
    </Popover>
  );
}
